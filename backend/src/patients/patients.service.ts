import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { pick, requireClinic } from '../common/tenant';

const PATIENT_FIELDS = [
  'name', 'dateOfBirth', 'age', 'gender', 'phone', 'email', 'address', 'city', 'state', 'pincode',
  'weight', 'height', 'bloodGroup', 'allergies', 'existingConditions', 'currentMedications',
  'previousHistory', 'emergencyContactName', 'emergencyContactPhone', 'insuranceProvider',
  'insurancePolicyNumber', 'abhaId', 'notes',
] as const;

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPatientDto: any, clinicId: string) {
    requireClinic(clinicId);
    if (!String(createPatientDto?.name || '').trim()) throw new BadRequestException('Patient name is required');
    // Increment atomically so two front-desk users can't mint the same UHID.
    const clinic = await this.prisma.clinic.update({
      where: { id: clinicId },
      data: { patientIdCounter: { increment: 1 } },
      select: { patientIdPrefix: true, patientIdCounter: true },
    });
    const patientUHID = `${clinic.patientIdPrefix}-${String(clinic.patientIdCounter).padStart(6, '0')}`;

    return this.prisma.patient.create({
      data: {
        ...normalize(pick(createPatientDto, PATIENT_FIELDS)),
        name: String(createPatientDto?.name || '').trim(),
        patientUHID,
        clinicId,
      },
    });
  }

  async findAll(query: string | undefined, clinicId: string) {
    const where: any = { clinicId: requireClinic(clinicId), isActive: true };

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
        { patientUHID: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ];
    }

    return this.prisma.patient.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async findOne(id: string, clinicId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id, clinicId: requireClinic(clinicId) },
      include: {
        prescriptions: {
          include: { items: true, doctor: { select: { name: true } } },
          orderBy: { date: 'desc' },
          take: 10,
        },
        consultations: {
          include: { vitals: true, diagnoses: true, doctor: { select: { name: true, specialty: true } } },
          orderBy: { startedAt: 'desc' },
          take: 10,
        },
        appointments: {
          include: { doctor: { select: { name: true } } },
          orderBy: { date: 'desc' },
          take: 10,
        },
        invoices: {
          include: { payments: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        followUps: {
          orderBy: { dueDate: 'desc' },
          take: 10,
        },
        investigationOrders: {
          orderBy: { orderedAt: 'desc' },
          take: 10,
        },
        medicalDocuments: {
          orderBy: { uploadedAt: 'desc' },
        },
        vitals: {
          orderBy: { recordedAt: 'desc' },
          take: 5,
        },
      },
    });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  private async assertOwned(id: string, clinicId: string) {
    const found = await this.prisma.patient.findFirst({ where: { id, clinicId: requireClinic(clinicId) }, select: { id: true } });
    if (!found) throw new NotFoundException('Patient not found');
  }

  async update(id: string, updatePatientDto: any, clinicId: string) {
    await this.assertOwned(id, clinicId);
    return this.prisma.patient.update({
      where: { id },
      data: normalize(pick(updatePatientDto, PATIENT_FIELDS)),
    });
  }

  async remove(id: string, clinicId: string) {
    await this.assertOwned(id, clinicId);
    // Soft delete
    return this.prisma.patient.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getStats(clinicId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [total, newToday, newThisMonth] = await Promise.all([
      this.prisma.patient.count({ where: { clinicId, isActive: true } }),
      this.prisma.patient.count({ where: { clinicId, createdAt: { gte: today } } }),
      this.prisma.patient.count({ where: { clinicId, createdAt: { gte: thisMonth } } }),
    ]);

    return { total, newToday, newThisMonth };
  }
}

// Form inputs arrive as strings; Prisma needs numbers/dates for these columns.
function normalize(data: Record<string, any>) {
  const out = { ...data };
  for (const k of ['age', 'weight', 'height']) {
    if (out[k] === '' || out[k] === null) out[k] = null;
    else if (out[k] !== undefined) {
      const n = Number(out[k]);
      out[k] = Number.isFinite(n) ? (k === 'age' ? Math.round(n) : n) : null;
    }
  }
  if (out.dateOfBirth === '') out.dateOfBirth = null;
  else if (out.dateOfBirth) out.dateOfBirth = new Date(out.dateOfBirth);
  return out;
}
