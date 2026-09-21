import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPatientDto: any, clinicId?: string) {
    // Auto-generate UHID
    let patientUHID = 'MED-000001';
    if (clinicId) {
      const clinic = await this.prisma.clinic.findUnique({ where: { id: clinicId } });
      if (clinic) {
        const counter = clinic.patientIdCounter + 1;
        patientUHID = `${clinic.patientIdPrefix}-${String(counter).padStart(6, '0')}`;
        await this.prisma.clinic.update({
          where: { id: clinicId },
          data: { patientIdCounter: counter },
        });
      }
    } else {
      const count = await this.prisma.patient.count();
      patientUHID = `MED-${String(count + 1).padStart(6, '0')}`;
    }

    return this.prisma.patient.create({
      data: {
        ...createPatientDto,
        patientUHID,
        clinicId,
      },
    });
  }

  async findAll(query?: string, clinicId?: string) {
    const where: any = {};
    if (clinicId) where.clinicId = clinicId;

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

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
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

  async update(id: string, updatePatientDto: any) {
    return this.prisma.patient.update({
      where: { id },
      data: updatePatientDto,
    });
  }

  async remove(id: string) {
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
