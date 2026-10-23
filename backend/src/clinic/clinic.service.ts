import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { pick, requireClinic } from '../common/tenant';
import { generateJoinCode } from './join-code';

const CLINIC_FIELDS = [
  'name', 'logo', 'address', 'phone', 'email', 'website', 'gstNumber', 'registrationInfo',
  'invoicePrefix', 'receiptPrefix', 'prescriptionPrefix', 'patientIdPrefix', 'timezone', 'currency',
] as const;

const SETTINGS_FIELDS = [
  'workingDays', 'workingHoursStart', 'workingHoursEnd', 'lunchBreakStart', 'lunchBreakEnd',
  'appointmentDuration', 'enableNotifications', 'enableSMS', 'enableEmail', 'enableWhatsApp',
  'autoGenerateInvoice', 'defaultConsultationFee',
] as const;

const TEMPLATE_FIELDS = [
  'name', 'headerImageUrl', 'footerImageUrl', 'signatureUrl', 'watermarkUrl', 'margins', 'isActive', 'isDefault',
] as const;

@Injectable()
export class ClinicService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string, role?: string) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id: requireClinic(id) },
      include: { clinicSettings: true },
    });
    if (!clinic) throw new NotFoundException('Clinic not found');
    // Only doctors/admins may see (and share) the code that lets staff join this clinic.
    if (role !== 'DOCTOR' && role !== 'ADMIN') return { ...clinic, joinCode: undefined };
    if (!clinic.joinCode) {
      // Clinics created before join codes existed get one on first view.
      const updated = await this.prisma.clinic.update({
        where: { id: clinic.id },
        data: { joinCode: generateJoinCode() },
        include: { clinicSettings: true },
      });
      return updated;
    }
    return clinic;
  }

  async update(id: string, data: any) {
    return this.prisma.clinic.update({
      where: { id: requireClinic(id) },
      data: pick(data, CLINIC_FIELDS),
      include: { clinicSettings: true },
    });
  }

  async updateSettings(clinicId: string, data: any) {
    const fields = pick(data, SETTINGS_FIELDS);
    return this.prisma.clinicSettings.upsert({
      where: { clinicId: requireClinic(clinicId) },
      update: fields,
      create: { clinicId, ...fields },
    });
  }

  async regenerateJoinCode(clinicId: string) {
    const clinic = await this.prisma.clinic.update({
      where: { id: requireClinic(clinicId) },
      data: { joinCode: generateJoinCode() },
      select: { joinCode: true },
    });
    return clinic;
  }

  /**
   * Moves a staff member from the empty clinic created at sign-up into the clinic
   * that owns the join code. Refused if their current clinic already holds data.
   */
  async joinClinic(userId: string, code: string) {
    const joinCode = (code || '').trim().toUpperCase();
    if (!joinCode) throw new BadRequestException('Enter your clinic code');
    const target = await this.prisma.clinic.findUnique({ where: { joinCode }, select: { id: true, name: true } });
    if (!target) throw new NotFoundException('No clinic found for that code');

    const me = await this.prisma.user.findUnique({ where: { id: userId }, select: { clinicId: true } });
    if (me?.clinicId === target.id) return { clinicId: target.id, clinicName: target.name };

    if (me?.clinicId) {
      const [otherUsers, patients] = await Promise.all([
        this.prisma.user.count({ where: { clinicId: me.clinicId, id: { not: userId }, isActive: true } }),
        this.prisma.patient.count({ where: { clinicId: me.clinicId } }),
      ]);
      if (otherUsers > 0 || patients > 0) {
        throw new ConflictException('Your current clinic already has patients or staff, so it cannot be left');
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { clinicId: target.id, role: 'RECEPTIONIST' },
    });
    return { clinicId: target.id, clinicName: target.name };
  }

  async getStaff(clinicId: string) {
    return this.prisma.user.findMany({
      where: { clinicId: requireClinic(clinicId), isActive: true },
      select: { id: true, name: true, email: true, role: true, lastLoginAt: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async removeStaff(clinicId: string, staffId: string, requesterId: string) {
    if (staffId === requesterId) throw new BadRequestException('You cannot remove yourself');
    const staff = await this.prisma.user.findFirst({ where: { id: staffId, clinicId: requireClinic(clinicId) } });
    if (!staff) throw new NotFoundException('Staff member not found');
    if (staff.role !== 'RECEPTIONIST') throw new BadRequestException('Only receptionists can be removed here');
    // Give them a fresh empty clinic so they keep a working (but isolated) account.
    const own = await this.prisma.clinic.create({
      data: { name: `${staff.name}'s Clinic`, joinCode: generateJoinCode(), clinicSettings: { create: {} } },
    });
    await this.prisma.user.update({ where: { id: staffId }, data: { clinicId: own.id } });
    return { success: true };
  }

  async getDoctors(clinicId: string) {
    return this.prisma.user.findMany({
      where: { clinicId: requireClinic(clinicId), role: 'DOCTOR', isActive: true },
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
        ...pick(data, TEMPLATE_FIELDS),
        doctorId,
        clinicId
      }
    });
  }

  private async ownTemplate(id: string, doctorId: string) {
    const template = await this.prisma.printTemplate.findFirst({ where: { id, doctorId } });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async updatePrintTemplate(id: string, doctorId: string, data: any) {
    await this.ownTemplate(id, doctorId);
    const fields = pick(data, TEMPLATE_FIELDS);
    // If setting this as default, unset all others for this doctor
    if (fields.isDefault) {
      await this.prisma.printTemplate.updateMany({
        where: { doctorId, id: { not: id } },
        data: { isDefault: false }
      });
    }

    return this.prisma.printTemplate.update({
      where: { id },
      data: fields
    });
  }

  async deletePrintTemplate(id: string, doctorId: string) {
    await this.ownTemplate(id, doctorId);
    return this.prisma.printTemplate.delete({
      where: { id }
    });
  }
}
