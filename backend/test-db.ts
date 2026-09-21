import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.$connect();
  console.log('Connected to DB successfully!');
}
main().catch(console.error).finally(() => prisma.$disconnect());
