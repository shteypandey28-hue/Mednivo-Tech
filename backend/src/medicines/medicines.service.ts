import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { PrismaService } from '../prisma/prisma.service';

type MedicineRow = {
  id: string;
  name: string;
  genericName: string | null;
  type: string;
  strength: string | null;
  manufacturer: string | null;
  packSize: string | null;
  mrp: number | null;
  defaultDosage: string | null;
  defaultFreq: string | null;
  defaultDuration: string | null;
  instruction: string | null;
};

const COLUMNS = Prisma.sql`id, name, "genericName", type, strength, manufacturer, "packSize", mrp,
  "defaultDosage", "defaultFreq", "defaultDuration", instruction`;

@Injectable()
export class MedicinesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateMedicineDto) {
    return this.prisma.medicine.create({ data: dto });
  }

  /**
   * Autocomplete search over the full Indian medicine catalogue.
   * Whole-word brand matches ("dolo" → "Dolo 650") rank first, then brand prefixes,
   * then name/composition substring matches.
   */
  async search(query: string, limit = 20) {
    const q = (query || '').trim();
    if (q.length < 2) return [];
    const take = Math.min(Math.max(limit, 1), 50);
    const like = `%${escapeLike(q)}%`;
    const prefix = `${escapeLike(q.toLowerCase())}%`;
    const wordPrefix = `${escapeLike(q.toLowerCase())} %`;

    // 2-char queries can't use the trigram index, so restrict them to a prefix scan.
    const where =
      q.length < 3
        ? Prisma.sql`lower(name) LIKE ${prefix}`
        : Prisma.sql`(name ILIKE ${like} OR "genericName" ILIKE ${like})`;

    const rows = await this.prisma.$queryRaw<MedicineRow[]>`
      SELECT ${COLUMNS} FROM "Medicine"
      WHERE "isActive" = true AND ${where}
      ORDER BY (lower(name) LIKE ${wordPrefix}) DESC, (lower(name) LIKE ${prefix}) DESC, (name ILIKE ${like}) DESC, length(name), name
      LIMIT ${take}`;
    return rows.map(toResult);
  }

  /** Paginated catalogue for the Medicines directory page (same ranking as autocomplete). */
  async directory(params: { q?: string; form?: string; page?: number; limit?: number }) {
    const page = Math.max(Number(params.page) || 1, 1);
    const limit = Math.min(Math.max(Number(params.limit) || 24, 1), 100);
    const q = (params.q || '').trim();
    const like = `%${escapeLike(q)}%`;
    const prefix = `${escapeLike(q.toLowerCase())}%`;
    const wordPrefix = `${escapeLike(q.toLowerCase())} %`;

    const conditions = [Prisma.sql`"isActive" = true`];
    if (params.form) conditions.push(Prisma.sql`type = ${params.form}`);
    if (q.length >= 2) conditions.push(Prisma.sql`(name ILIKE ${like} OR "genericName" ILIKE ${like})`);
    const where = Prisma.join(conditions, ' AND ');
    const orderBy = q.length >= 2
      ? Prisma.sql`(lower(name) LIKE ${wordPrefix}) DESC, (lower(name) LIKE ${prefix}) DESC, (name ILIKE ${like}) DESC, length(name), name`
      : Prisma.sql`name`;

    const [items, countRows] = await Promise.all([
      this.prisma.$queryRaw<MedicineRow[]>`
        SELECT ${COLUMNS} FROM "Medicine" WHERE ${where}
        ORDER BY ${orderBy} LIMIT ${limit} OFFSET ${(page - 1) * limit}`,
      this.prisma.$queryRaw<{ count: bigint }[]>`SELECT count(*)::bigint AS count FROM "Medicine" WHERE ${where}`,
    ]);
    const total = Number(countRows[0]?.count ?? 0);
    return { items: items.map(toResult), total, page, limit, pages: Math.ceil(total / limit) };
  }

  async forms() {
    const rows = await this.prisma.medicine.groupBy({
      by: ['type'],
      where: { isActive: true },
      _count: { _all: true },
      orderBy: { _count: { type: 'desc' } },
    });
    return rows.map((r) => ({ form: r.type, count: r._count._all }));
  }

  async findOne(id: string) {
    const med = await this.prisma.medicine.findUnique({ where: { id } });
    if (!med) throw new NotFoundException('Medicine not found');
    return toResult(med);
  }

  update(id: string, dto: UpdateMedicineDto) {
    return this.prisma.medicine.update({ where: { id }, data: dto });
  }

  // Soft delete: prescriptions may still reference this medicine.
  remove(id: string) {
    return this.prisma.medicine.update({ where: { id }, data: { isActive: false } });
  }
}

function escapeLike(s: string) {
  return s.replace(/[\\%_]/g, (c) => `\\${c}`);
}

// Keeps the field aliases the frontend autocomplete already reads (dosageForm, composition, sourceId).
function toResult(m: MedicineRow) {
  return {
    id: m.id,
    sourceId: m.id,
    source: 'mednivo',
    name: m.name,
    genericName: m.genericName,
    composition: m.genericName,
    type: m.type,
    dosageForm: m.type,
    strength: m.strength,
    manufacturer: m.manufacturer,
    packSize: m.packSize,
    mrp: m.mrp,
    defaultDosage: m.defaultDosage || m.strength,
    defaultFreq: m.defaultFreq,
    defaultDuration: m.defaultDuration,
    instruction: m.instruction,
  };
}
