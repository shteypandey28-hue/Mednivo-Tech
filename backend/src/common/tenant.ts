import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Fields of a User that are safe to embed in responses (never passwordHash / reset tokens). */
export const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  specialty: true,
  qualification: true,
  registrationNumber: true,
  signature: true,
  avatar: true,
} as const;

export const PUBLIC_USER = { select: PUBLIC_USER_SELECT } as const;

/** Copies only the listed keys, so request bodies can't smuggle clinicId, ids or nested writes. */
export function pick<T extends Record<string, any>, K extends string>(obj: T | undefined, keys: readonly K[]) {
  const out: Record<string, any> = {};
  if (!obj) return out as Partial<Record<K, any>>;
  for (const k of keys) if (obj[k] !== undefined) out[k] = obj[k];
  return out as Partial<Record<K, any>>;
}

export function requireClinic(clinicId: string | null | undefined): string {
  if (!clinicId) throw new ForbiddenException('Your account is not linked to a clinic');
  return clinicId;
}

export async function assertPatientInClinic(prisma: PrismaService, patientId: string, clinicId: string) {
  const found = await prisma.patient.findFirst({ where: { id: patientId, clinicId }, select: { id: true } });
  if (!found) throw new NotFoundException('Patient not found');
}

export async function assertDoctorInClinic(prisma: PrismaService, doctorId: string, clinicId: string) {
  const found = await prisma.user.findFirst({
    where: { id: doctorId, clinicId, role: { in: ['DOCTOR', 'ADMIN'] }, isActive: true },
    select: { id: true },
  });
  if (!found) throw new NotFoundException('Doctor not found');
}
