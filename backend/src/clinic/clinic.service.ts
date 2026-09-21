import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClinicService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id },
      include: { clinicSettings: true },
    });
    if (!clinic) throw new NotFoundException('Clinic not found');
    return clinic;
  }

  async update(id: string, data: any) {
    return this.prisma.clinic.update({
      where: { id },
      data,
      include: { clinicSettings: true },
    });
  }

  async updateSettings(clinicId: string, data: any) {
    return this.prisma.clinicSettings.upsert({
      where: { clinicId },
      update: data,
      create: { clinicId, ...data },
    });
  }

  async getDoctors(clinicId: string) {
    return this.prisma.user.findMany({
      where: { clinicId, role: 'DOCTOR' },
      select: {
        id: true,
        name: true,
        specialty: true,
        avatar: true,
        consultationFee: true,
      }
    });
  }

  async getDashboardStats(clinicId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      todayAppointments,
      completedConsultations,
      waitingPatients,
      todayRevenue,
      totalPatients,
      pendingPayments,
    ] = await Promise.all([
      this.prisma.appointment.count({
        where: { clinicId, date: { gte: today, lt: tomorrow } },
      }),
      this.prisma.consultation.count({
        where: { clinicId, status: 'COMPLETED', completedAt: { gte: today, lt: tomorrow } },
      }),
      this.prisma.queueEntry.count({
        where: { clinicId, status: 'WAITING', createdAt: { gte: today } },
      }),
      this.prisma.payment.aggregate({
        where: { clinicId, status: 'SUCCESS', paidAt: { gte: today, lt: tomorrow } },
        _sum: { amount: true },
      }),
      this.prisma.patient.count({ where: { clinicId } }),
      this.prisma.invoice.aggregate({
        where: { clinicId, status: 'PENDING' },
        _sum: { totalAmount: true }
      })
    ]);

    return {
      todayAppointments,
      completedConsultations,
      waitingPatients,
      todayRevenue: todayRevenue._sum.amount || 0,
      totalPatients,
      pendingPayments: pendingPayments._sum.totalAmount || 0,
    };
  }

  // --- Print Templates ---
  async getPrintTemplates(doctorId: string) {
    return this.prisma.printTemplate.findMany({
      where: { doctorId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createPrintTemplate(doctorId: string, clinicId: string, data: any) {
    return this.prisma.printTemplate.create({
      data: {
        ...data,
        doctorId,
        clinicId
      }
    });
  }

  async updatePrintTemplate(id: string, data: any) {
    // If setting this as default, unset all others for this doctor
    if (data.isDefault) {
      const templateToUpdate = await this.prisma.printTemplate.findUnique({ where: { id } });
      if (templateToUpdate) {
        await this.prisma.printTemplate.updateMany({
          where: { doctorId: templateToUpdate.doctorId, id: { not: id } },
          data: { isDefault: false }
        });
      }
    }

    return this.prisma.printTemplate.update({
      where: { id },
      data
    });
  }

  async deletePrintTemplate(id: string) {
    return this.prisma.printTemplate.delete({
      where: { id }
    });
  }
}
