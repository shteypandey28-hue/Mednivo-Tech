import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueueStatus } from '@prisma/client';
import { PUBLIC_USER, assertDoctorInClinic, assertPatientInClinic, requireClinic } from '../common/tenant';

@Injectable()
export class QueueService {
  constructor(private readonly prisma: PrismaService) {}

  async addToQueue(input: { clinicId: string; patientId: string; doctorId: string; appointmentId?: string }) {
    const clinicId = requireClinic(input.clinicId);
    await assertPatientInClinic(this.prisma, input.patientId, clinicId);
    await assertDoctorInClinic(this.prisma, input.doctorId, clinicId);
    if (input.appointmentId) {
      const appt = await this.prisma.appointment.findFirst({ where: { id: input.appointmentId, clinicId }, select: { id: true } });
      if (!appt) throw new NotFoundException('Appointment not found');
    }
    const data = { clinicId, patientId: input.patientId, doctorId: input.doctorId, appointmentId: input.appointmentId };
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get next position
    const lastEntry = await this.prisma.queueEntry.findFirst({
      where: { clinicId: data.clinicId, doctorId: data.doctorId, createdAt: { gte: today } },
      orderBy: { position: 'desc' },
    });

    const position = (lastEntry?.position || 0) + 1;
    const tokenNumber = position;

    return this.prisma.queueEntry.create({
      data: { ...data, position, tokenNumber },
      include: { patient: true, doctor: PUBLIC_USER },
    });
  }

  async getTodayQueue(clinicId: string, doctorId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where: any = { clinicId: requireClinic(clinicId), createdAt: { gte: today } };
    if (doctorId) where.doctorId = doctorId;

    return this.prisma.queueEntry.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true, patientUHID: true, phone: true, age: true, gender: true } },
        doctor: { select: { id: true, name: true } },
        appointment: true,
      },
      orderBy: { position: 'asc' },
    });
  }

  async updateStatus(id: string, status: QueueStatus, clinicId: string) {
    const entry = await this.prisma.queueEntry.findFirst({ where: { id, clinicId: requireClinic(clinicId) } });
    if (!entry) throw new NotFoundException('Queue entry not found');

    const updateData: any = { status };
    if (status === 'IN_CONSULTATION') updateData.calledAt = new Date();
    if (status === 'COMPLETED') updateData.completedAt = new Date();

    return this.prisma.queueEntry.update({
      where: { id },
      data: updateData,
      include: { patient: true, doctor: PUBLIC_USER },
    });
  }

  async callNext(clinicId: string, doctorId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextEntry = await this.prisma.queueEntry.findFirst({
      where: { clinicId, doctorId, status: 'WAITING', createdAt: { gte: today } },
      orderBy: { position: 'asc' },
      include: { patient: true },
    });

    if (!nextEntry) return null;

    return this.prisma.queueEntry.update({
      where: { id: nextEntry.id },
      data: { status: 'IN_CONSULTATION', calledAt: new Date() },
      include: { patient: true, doctor: PUBLIC_USER },
    });
  }

  async reorder(id: string, newPosition: number, clinicId: string) {
    const entry = await this.prisma.queueEntry.findFirst({ where: { id, clinicId: requireClinic(clinicId) }, select: { id: true } });
    if (!entry) throw new NotFoundException('Queue entry not found');
    return this.prisma.queueEntry.update({
      where: { id },
      data: { position: newPosition },
    });
  }
}
