import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConsultationsService } from './consultations.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('consultations')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Post()
  @Roles('DOCTOR', 'ADMIN')
  create(@CurrentUser('clinicId') clinicId: string, @CurrentUser('id') doctorId: string, @Body() data: any) {
    return this.consultationsService.create(data, clinicId, doctorId);
  }

  @Get()
  findAll(
    @CurrentUser('clinicId') clinicId: string,
    @Query('patientId') patientId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('date') date?: string,
  ) {
    return this.consultationsService.findAll(clinicId, { patientId, doctorId, date });
  }

  @Get('patient/:patientId/history')
  getPatientHistory(@Param('patientId') patientId: string, @CurrentUser('clinicId') clinicId: string) {
    return this.consultationsService.getPatientHistory(patientId, clinicId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('clinicId') clinicId: string) {
    return this.consultationsService.findOne(id, clinicId);
  }

  @Patch(':id')
  @Roles('DOCTOR', 'ADMIN')
  update(@Param('id') id: string, @Body() data: any, @CurrentUser('clinicId') clinicId: string) {
    return this.consultationsService.update(id, data, clinicId);
  }

  // Receptionists commonly record vitals at check-in, so this stays open to all clinic staff.
  @Post(':id/vitals')
  addVitals(@Param('id') id: string, @Body() data: any, @CurrentUser('clinicId') clinicId: string) {
    return this.consultationsService.addVitals(id, data, clinicId);
  }

  @Post(':id/diagnosis')
  @Roles('DOCTOR', 'ADMIN')
  addDiagnosis(@Param('id') id: string, @Body() data: any, @CurrentUser('clinicId') clinicId: string) {
    return this.consultationsService.addDiagnosis(id, data, clinicId);
  }

  @Patch(':id/complete')
  @Roles('DOCTOR', 'ADMIN')
  complete(@Param('id') id: string, @CurrentUser('clinicId') clinicId: string) {
    return this.consultationsService.complete(id, clinicId);
  }
}
