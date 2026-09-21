import { Injectable } from '@nestjs/common';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrescriptionsService {
  constructor(private readonly prisma: PrismaService) { }

  create(createPrescriptionDto: CreatePrescriptionDto) {
    const { doctorId, patientId, diagnosis, notes, items } = createPrescriptionDto;

    return this.prisma.prescription.create({
      data: {
        prescriptionId: `RX-${Date.now()}`,
        diagnosis,
        notes,
        doctor: { connect: { id: doctorId } },
        patient: { connect: { id: patientId } },
        items: {
          create: items.map((item: any) => ({
            medicineId: item.medicineId,
            medicineName: item.medicineName || 'Unknown Medicine',
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            instruction: item.instruction,
          })),
        },
      },
      include: {
        items: {
          include: { medicine: true }
        },
        patient: true,
        doctor: true,
      },
    });
  }

  findAll() {
    return this.prisma.prescription.findMany({
      include: {
        patient: true,
        doctor: true,
        items: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.prescription.findUnique({
      where: { id },
      include: {
        items: { include: { medicine: true } },
        patient: true,
        doctor: true,
      },
    });
  }

  update(id: string, updatePrescriptionDto: UpdatePrescriptionDto) {
    // Complex update logic might be needed for items, for now just update fields
    return this.prisma.prescription.update({
      where: { id },
      data: {
        diagnosis: updatePrescriptionDto.diagnosis,
        notes: updatePrescriptionDto.notes,
      },
    });
  }

  remove(id: string) {
    return this.prisma.prescription.delete({
      where: { id },
    });
  }
}
