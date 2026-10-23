/**
 * Imports the India A–Z medicine dataset (~2.5 lakh brands) into the Medicine table.
 *
 *   DATABASE_URL=... npm run import:medicines
 *
 * Safe to re-run: rows are matched on (name, manufacturer) and updated in place,
 * so existing PrescriptionItem references are never broken. Also creates the
 * trigram / prefix indexes the medicine search relies on.
 */
import { PrismaClient } from '@prisma/client';
import { createReadStream } from 'fs';
import { createGunzip } from 'zlib';
import { createInterface } from 'readline';
import { join } from 'path';

const prisma = new PrismaClient();
const DATA_FILE = join(__dirname, 'data', 'medicines.csv.gz');
const BATCH = 2000;

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

async function insertBatch(rows: string[][]) {
  const params: (string | number | boolean | null)[] = [];
  const values = rows.map((r, i) => {
    const [name, genericName, form, strength, manufacturer, packSize, mrp, active] = r;
    params.push(name, genericName || null, form || 'Other', strength || null, manufacturer || null, packSize || null, mrp ? Number(mrp) : null, active !== '0');
    const b = i * 8;
    return `($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5},$${b + 6},$${b + 7}::float8,$${b + 8}::boolean)`;
  });
  await prisma.$executeRawUnsafe(
    `INSERT INTO "_medicine_import" (name, "genericName", type, strength, manufacturer, "packSize", mrp, "isActive") VALUES ${values.join(',')}`,
    ...params,
  );
}

async function main() {
  console.log('Preparing staging table...');
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "_medicine_import"`);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE "_medicine_import" (
      name text NOT NULL, "genericName" text, type text, strength text,
      manufacturer text, "packSize" text, mrp float8, "isActive" boolean
    )`);

  const rl = createInterface({ input: createReadStream(DATA_FILE).pipe(createGunzip()) });
  let header = true;
  let batch: string[][] = [];
  let total = 0;
  for await (const line of rl) {
    if (header) { header = false; continue; }
    if (!line.trim()) continue;
    batch.push(parseCsvLine(line));
    if (batch.length === BATCH) {
      await insertBatch(batch);
      total += batch.length;
      batch = [];
      if (total % 20000 === 0) console.log(`  staged ${total} rows`);
    }
  }
  if (batch.length) { await insertBatch(batch); total += batch.length; }
  console.log(`Staged ${total} rows. Merging into "Medicine"...`);

  await prisma.$executeRawUnsafe(`CREATE INDEX ON "_medicine_import" (lower(name))`);

  // Older seeds stored rows without a manufacturer — match those on name alone.
  const updated = await prisma.$executeRawUnsafe(`
    UPDATE "Medicine" m SET
      "genericName" = i."genericName", type = i.type, strength = i.strength,
      manufacturer = i.manufacturer, "packSize" = i."packSize", mrp = i.mrp, "isActive" = i."isActive"
    FROM "_medicine_import" i
    WHERE lower(m.name) = lower(i.name)
      AND (m.manufacturer IS NULL OR lower(m.manufacturer) = lower(i.manufacturer))`);

  const inserted = await prisma.$executeRawUnsafe(`
    INSERT INTO "Medicine" (id, name, "genericName", type, strength, manufacturer, "packSize", mrp, "isActive")
    SELECT gen_random_uuid(), i.name, i."genericName", i.type, i.strength, i.manufacturer, i."packSize", i.mrp, i."isActive"
    FROM "_medicine_import" i
    WHERE NOT EXISTS (
      SELECT 1 FROM "Medicine" m
      WHERE lower(m.name) = lower(i.name)
        AND lower(coalesce(m.manufacturer, '')) = lower(coalesce(i.manufacturer, ''))
    )`);

  await prisma.$executeRawUnsafe(`DROP TABLE "_medicine_import"`);
  console.log(`Updated ${updated}, inserted ${inserted}.`);

  console.log('Creating search indexes...');
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Medicine_name_trgm_idx" ON "Medicine" USING gin (name gin_trgm_ops)`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Medicine_genericName_trgm_idx" ON "Medicine" USING gin ("genericName" gin_trgm_ops)`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Medicine_name_lower_prefix_idx" ON "Medicine" (lower(name) text_pattern_ops)`);
  await prisma.$executeRawUnsafe(`ANALYZE "Medicine"`);

  const count = await prisma.medicine.count({ where: { isActive: true } });
  console.log(`Done. ${count} active medicines available.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
