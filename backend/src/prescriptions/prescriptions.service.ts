import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { CreatePrescriptionDto, PrescriptionItemDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PUBLIC_USER, assertPatientInClinic, requireClinic } from '../common/tenant';

const INCLUDE = {
  items: { orderBy: { sortOrder: 'asc' as const } },
  patient: true,
  doctor: PUBLIC_USER,
};

@Injectable()
export class PrescriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePrescriptionDto, doctorId: string, clinicId: string) {
    requireClinic(clinicId);
    await assertPatientInClinic(this.prisma, dto.patientId, clinicId);
    if (dto.consultationId) await this.assertConsultation(dto.consultationId, clinicId);

    const clinic = await this.prisma.clinic.findUnique({ where: { id: clinicId }, select: { prescriptionPrefix: true } });
    const prescriptionId = `${clinic?.prescriptionPrefix || 'RX'}-${Date.now().toString(36).toUpperCase()}${randomBytes(2).toString('hex').toUpperCase()}`;

    return this.prisma.prescription.create({
      data: {
        prescriptionId,
        diagnosis: dto.diagnosis,
        notes: dto.notes,
        advice: dto.advice,
        followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : undefined,
        doctorId,
        patientId: dto.patientId,
        clinicId,
        consultationId: dto.consultationId,
        items: { create: await this.toItems(dto.items) },
      },
      include: INCLUDE,
    });
  }

  findAll(clinicId: string, patientId?: string) {
    return this.prisma.prescription.findMany({
      where: { clinicId: requireClinic(clinicId), ...(patientId ? { patientId } : {}) },
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
        patient: { select: { id: true, name: true, patientUHID: true, age: true, gender: true, phone: true } },
        doctor: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
      take: 200,
    });
  }

  async findOne(id: string, clinicId: string) {
    const rx = await this.prisma.prescription.findFirst({
      where: { id, clinicId: requireClinic(clinicId) },
      include: INCLUDE,
    });
    if (!rx) throw new NotFoundException('Prescription not found');
    return rx;
  }

  async update(id: string, dto: UpdatePrescriptionDto, doctorId: string, clinicId: string) {
    await this.assertPrescriber(id, doctorId, clinicId);
    const items = dto.items ? await this.toItems(dto.items) : undefined;
    return this.prisma.prescription.update({
      where: { id },
      data: {
        diagnosis: dto.diagnosis,
        notes: dto.notes,
        advice: dto.advice,
        followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : undefined,
        ...(items ? { items: { deleteMany: {}, create: items } } : {}),
      },
      include: INCLUDE,
    });
  }

  async remove(id: string, doctorId: string, clinicId: string) {
    await this.assertPrescriber(id, doctorId, clinicId);
    return this.prisma.prescription.delete({ where: { id } });
  }

  private async assertPrescriber(id: string, doctorId: string, clinicId: string) {
    const rx = await this.prisma.prescription.findFirst({
      where: { id, clinicId: requireClinic(clinicId) },
      select: { doctorId: true },
    });
    if (!rx) throw new NotFoundException('Prescription not found');
    if (rx.doctorId !== doctorId) throw new ForbiddenException('Only the prescribing doctor can change this prescription');
  }

  private async assertConsultation(consultationId: string, clinicId: string) {
    const found = await this.prisma.consultation.findFirst({ where: { id: consultationId, clinicId }, select: { id: true } });
    if (!found) throw new NotFoundException('Consultation not found');
  }

  // Ignore medicineIds that don't exist rather than failing the whole prescription.
  private async toItems(items: PrescriptionItemDto[]) {
    const ids = items.map((i) => i.medicineId).filter((x): x is string => !!x);
    const known = new Set(
      ids.length
        ? (await this.prisma.medicine.findMany({ where: { id: { in: ids } }, select: { id: true } })).map((m) => m.id)
        : [],
    );
    return items.map((item, index) => ({
      medicineId: item.medicineId && known.has(item.medicineId) ? item.medicineId : null,
      medicineName: item.medicineName,
      genericName: item.genericName,
      strength: item.strength,
      form: item.form,
      dosage: item.dosage || '',
      route: item.route,
      frequency: item.frequency || '',
      timing: item.timing,
      duration: item.duration || '',
      quantity: item.quantity,
      instruction: item.instruction,
      sortOrder: index,
    }));
  }
}
