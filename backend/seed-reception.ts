import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'reception@clinic.com';
  const password = 'password123';
  
  let user = await prisma.user.findUnique({ where: { email } });
  const passwordHash = await bcrypt.hash(password, 12);
  
  // Find a clinic first
  let clinic = await prisma.clinic.findFirst();
  if (!clinic) {
    clinic = await prisma.clinic.create({
      data: {
        name: 'My Clinic',
        clinicSettings: { create: {} },
      },
    });
    console.log('Created missing clinic');
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: 'Demo Receptionist',
        role: 'RECEPTIONIST',
        phone: '0987654321',
        clinicId: clinic.id
      }
    });
    console.log('Receptionist created:', email);
  } else {
    await prisma.user.update({
      where: { email },
      data: { passwordHash, role: 'RECEPTIONIST' }
    });
    console.log('Receptionist updated:', email);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
