import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentStatus } from '@prisma/client';
import { PUBLIC_USER, assertDoctorInClinic, assertPatientInClinic, pick, requireClinic } from '../common/tenant';

const APPOINTMENT_FIELDS = ['date', 'startTime', 'endTime', 'type', 'status', 'reason', 'notes'] as const;

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any, clinicId: string) {
    requireClinic(clinicId);
    await assertPatientInClinic(this.prisma, data.patientId, clinicId);
    await assertDoctorInClinic(this.prisma, data.doctorId, clinicId);
    return this.prisma.appointment.create({
      data: {
        ...(pick(data, APPOINTMENT_FIELDS) as { date: string; startTime: string }),
        clinicId,
        patientId: data.patientId,
        doctorId: data.doctorId,
      },
      include: { patient: true, doctor: PUBLIC_USER },
    });
  }

  private async owned(id: string, clinicId: string) {
    const appointment = await this.prisma.appointment.findFirst({ where: { id, clinicId: requireClinic(clinicId) } });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async findAll(clinicId: string, filters: { date?: string; doctorId?: string; status?: string }) {
    const where: any = { clinicId: requireClinic(clinicId) };

    if (filters.date) {
      const date = new Date(filters.date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      where.date = { gte: date, lt: nextDay };
    }

    if (filters.doctorId) where.doctorId = filters.doctorId;
    if (filters.status) where.status = filters.status;

    return this.prisma.appointment.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true, patientUHID: true, phone: true, age: true, gender: true } },
        doctor: { select: { id: true, name: true, specialty: true } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findToday(clinicId: string, doctorId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where: any = { clinicId: requireClinic(clinicId), date: { gte: today, lt: tomorrow } };
    if (doctorId) where.doctorId = doctorId;

    return this.prisma.appointment.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true, patientUHID: true, phone: true, age: true, gender: true } },
        doctor: { select: { id: true, name: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async updateStatus(id: string, status: AppointmentStatus, cancelReason: string | undefined, clinicId: string) {
    await this.owned(id, clinicId);

    return this.prisma.appointment.update({
      where: { id },
      data: { status, cancelReason },
      include: { patient: true, doctor: PUBLIC_USER },
    });
  }

  async findOne(id: string, clinicId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id, clinicId: requireClinic(clinicId) },
      include: { patient: true, doctor: PUBLIC_USER },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async remove(id: string, clinicId: string) {
    await this.owned(id, clinicId);
    return this.prisma.appointment.delete({ where: { id } });
  }
}
