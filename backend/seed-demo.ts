import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@clinic.com';
  const password = 'password123';
  
  let user = await prisma.user.findUnique({ where: { email } });
  
  const passwordHash = await bcrypt.hash(password, 12);
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: 'Demo Doctor',
        role: 'DOCTOR',
        phone: '1234567890'
      }
    });
    console.log('User created:', email);
  } else {
    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });
    console.log('User updated:', email);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
