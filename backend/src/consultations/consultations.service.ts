import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConsultationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.consultation.create({
      data,
      include: { patient: true, doctor: true, vitals: true, diagnoses: true },
    });
  }

  async findAll(clinicId: string, filters: { patientId?: string; doctorId?: string; date?: string }) {
    const where: any = { clinicId };
    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.doctorId) where.doctorId = filters.doctorId;
    if (filters.date) {
      const date = new Date(filters.date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      where.startedAt = { gte: date, lt: nextDay };
    }

    return this.prisma.consultation.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true, patientUHID: true, age: true, gender: true } },
        doctor: { select: { id: true, name: true } },
        vitals: true,
        diagnoses: true,
        prescription: true,
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
        vitals: true,
        diagnoses: true,
        prescription: { include: { items: true } },
        investigationOrders: true,
        followUp: true,
      },
    });
    if (!consultation) throw new NotFoundException('Consultation not found');
    return consultation;
  }

  async update(id: string, data: any) {
    return this.prisma.consultation.update({
      where: { id },
      data,
      include: { patient: true, doctor: true, vitals: true, diagnoses: true },
    });
  }

  async addVitals(consultationId: string, patientId: string, vitalsData: any) {
    // Calculate BMI if weight and height provided
    if (vitalsData.weight && vitalsData.height) {
      const heightInMeters = vitalsData.height / 100;
      vitalsData.bmi = Math.round((vitalsData.weight / (heightInMeters * heightInMeters)) * 10) / 10;
    }

    return this.prisma.vital.create({
      data: { ...vitalsData, consultationId, patientId },
    });
  }

  async addDiagnosis(consultationId: string, diagnosisData: any) {
    return this.prisma.diagnosis.create({
      data: { ...diagnosisData, consultationId },
    });
  }

  async complete(id: string) {
    return this.prisma.consultation.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
  }

  async getPatientHistory(patientId: string) {
    return this.prisma.consultation.findMany({
      where: { patientId },
      include: {
        vitals: true,
        diagnoses: true,
        prescription: { include: { items: true } },
        doctor: { select: { name: true, specialty: true } },
      },
      orderBy: { startedAt: 'desc' },
    });
  }
}
