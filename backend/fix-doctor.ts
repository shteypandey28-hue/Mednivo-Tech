import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const clinic = await prisma.clinic.findFirst();
  if (clinic) {
    await prisma.user.update({
      where: { email: 'demo@clinic.com' },
      data: { clinicId: clinic.id }
    });
    console.log('Doctor linked to clinic successfully!');
  }
}
main().finally(() => prisma.$disconnect());
