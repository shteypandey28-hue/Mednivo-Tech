import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PUBLIC_USER, assertPatientInClinic, pick, requireClinic } from '../common/tenant';

const CONSULTATION_FIELDS = [
  'chiefComplaint', 'symptoms', 'historyOfPresentIllness', 'examination', 'clinicalNotes',
  'advice', 'aiGeneratedNotes', 'isAiAssisted', 'status',
] as const;
const VITAL_FIELDS = ['temperature', 'systolicBP', 'diastolicBP', 'pulse', 'respiratoryRate', 'spo2', 'weight', 'height'] as const;
const DIAGNOSIS_FIELDS = ['code', 'name', 'type', 'notes'] as const;

@Injectable()
export class ConsultationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any, clinicId: string, doctorId: string) {
    requireClinic(clinicId);
    await assertPatientInClinic(this.prisma, data.patientId, clinicId);
    if (data.appointmentId) {
      const appt = await this.prisma.appointment.findFirst({ where: { id: data.appointmentId, clinicId }, select: { id: true } });
      if (!appt) throw new NotFoundException('Appointment not found');
    }
    return this.prisma.consultation.create({
      data: {
        ...pick(data, CONSULTATION_FIELDS),
        clinicId,
        doctorId,
        patientId: data.patientId,
        appointmentId: data.appointmentId,
      },
      include: { patient: true, doctor: PUBLIC_USER, vitals: true, diagnoses: true },
    });
  }

  async findAll(clinicId: string, filters: { patientId?: string; doctorId?: string; date?: string }) {
    const where: any = { clinicId: requireClinic(clinicId) };
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

  async findOne(id: string, clinicId: string) {
    const consultation = await this.prisma.consultation.findFirst({
      where: { id, clinicId: requireClinic(clinicId) },
      include: {
        patient: true,
        doctor: PUBLIC_USER,
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

  private async owned(id: string, clinicId: string) {
    const c = await this.prisma.consultation.findFirst({
      where: { id, clinicId: requireClinic(clinicId) },
      select: { id: true, patientId: true },
    });
    if (!c) throw new NotFoundException('Consultation not found');
    return c;
  }

  async update(id: string, data: any, clinicId: string) {
    await this.owned(id, clinicId);
    return this.prisma.consultation.update({
      where: { id },
      data: pick(data, CONSULTATION_FIELDS),
      include: { patient: true, doctor: PUBLIC_USER, vitals: true, diagnoses: true },
    });
  }

  async addVitals(consultationId: string, vitalsData: any, clinicId: string) {
    // Patient always comes from the consultation, never from the request body.
    const { patientId } = await this.owned(consultationId, clinicId);
    const vitals: any = pick(vitalsData, VITAL_FIELDS);
    // Calculate BMI if weight and height provided
    if (vitals.weight && vitals.height) {
      const heightInMeters = vitals.height / 100;
      vitals.bmi = Math.round((vitals.weight / (heightInMeters * heightInMeters)) * 10) / 10;
    }

    return this.prisma.vital.create({
      data: { ...vitals, consultationId, patientId },
    });
  }

  async addDiagnosis(consultationId: string, diagnosisData: any, clinicId: string) {
    await this.owned(consultationId, clinicId);
    return this.prisma.diagnosis.create({
      data: { ...(pick(diagnosisData, DIAGNOSIS_FIELDS) as { name: string }), consultationId },
    });
  }

  async complete(id: string, clinicId: string) {
    await this.owned(id, clinicId);
    return this.prisma.consultation.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
  }

  async getPatientHistory(patientId: string, clinicId: string) {
    return this.prisma.consultation.findMany({
      where: { patientId, clinicId: requireClinic(clinicId) },
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
