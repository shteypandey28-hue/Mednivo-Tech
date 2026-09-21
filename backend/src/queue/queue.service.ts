import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueueStatus } from '@prisma/client';

@Injectable()
export class QueueService {
  constructor(private readonly prisma: PrismaService) {}

  async addToQueue(data: { clinicId: string; patientId: string; doctorId: string; appointmentId?: string }) {
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
      include: { patient: true, doctor: true },
    });
  }

  async getTodayQueue(clinicId: string, doctorId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where: any = { clinicId, createdAt: { gte: today } };
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

  async updateStatus(id: string, status: QueueStatus) {
    const entry = await this.prisma.queueEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException('Queue entry not found');

    const updateData: any = { status };
    if (status === 'IN_CONSULTATION') updateData.calledAt = new Date();
    if (status === 'COMPLETED') updateData.completedAt = new Date();

    return this.prisma.queueEntry.update({
      where: { id },
      data: updateData,
      include: { patient: true, doctor: true },
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
      include: { patient: true, doctor: true },
    });
  }

  async reorder(id: string, newPosition: number) {
    return this.prisma.queueEntry.update({
      where: { id },
      data: { position: newPosition },
    });
  }
}
