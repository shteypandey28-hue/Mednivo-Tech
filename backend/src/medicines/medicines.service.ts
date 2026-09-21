import { Injectable } from '@nestjs/common';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { PrismaService } from '../prisma/prisma.service';
import { DrugsetuService, NormalizedMedicine } from './drugsetu.service';

@Injectable()
export class MedicinesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly drugsetuService: DrugsetuService
  ) { }

  create(createMedicineDto: CreateMedicineDto) {
    return this.prisma.medicine.create({
      data: createMedicineDto,
    });
  }

  async findAll(query?: string) {
    if (query && query.length > 2) {
      // Prioritize DrugSetu API for search
      const results = await this.drugsetuService.searchDrugs(query);
      if (results && results.length > 0) {
        return results;
      }

      // Fallback to local DB if DrugSetu fails or returns empty
      return this.prisma.medicine.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { genericName: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 20,
      });
    }
    
    // Default fallback for empty queries
    return this.prisma.medicine.findMany({ take: 50 });
  }

  findOne(id: string) {
    return this.prisma.medicine.findUnique({
      where: { id },
    });
  }

  update(id: string, updateMedicineDto: UpdateMedicineDto) {
    return this.prisma.medicine.update({
      where: { id },
      data: updateMedicineDto,
    });
  }

  remove(id: string) {
    return this.prisma.medicine.delete({
      where: { id },
    });
  }
}
