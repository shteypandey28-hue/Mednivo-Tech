import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  // Only doctors write prescriptions; the prescriber is always the logged-in doctor.
  @Post()
  @Roles('DOCTOR', 'ADMIN')
  create(@Body() dto: CreatePrescriptionDto, @CurrentUser() user: any) {
    return this.prescriptionsService.create(dto, user.id, user.clinicId);
  }

  @Get()
  findAll(@CurrentUser('clinicId') clinicId: string, @Query('patientId') patientId?: string) {
    return this.prescriptionsService.findAll(clinicId, patientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('clinicId') clinicId: string) {
    return this.prescriptionsService.findOne(id, clinicId);
  }

  @Patch(':id')
  @Roles('DOCTOR', 'ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdatePrescriptionDto, @CurrentUser() user: any) {
    return this.prescriptionsService.update(id, dto, user.id, user.clinicId);
  }

  @Delete(':id')
  @Roles('DOCTOR', 'ADMIN')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.prescriptionsService.remove(id, user.id, user.clinicId);
  }
}
