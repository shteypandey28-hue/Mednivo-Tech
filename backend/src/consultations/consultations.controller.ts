import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConsultationsService } from './consultations.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('consultations')
@UseGuards(AuthGuard('jwt'))
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Post()
  create(@CurrentUser('clinicId') clinicId: string, @CurrentUser('id') doctorId: string, @Body() data: any) {
    return this.consultationsService.create({ ...data, clinicId, doctorId });
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.consultationsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.consultationsService.update(id, data);
  }

  @Post(':id/vitals')
  addVitals(@Param('id') id: string, @Body() data: any) {
    return this.consultationsService.addVitals(id, data.patientId, data);
  }

  @Post(':id/diagnosis')
  addDiagnosis(@Param('id') id: string, @Body() data: any) {
    return this.consultationsService.addDiagnosis(id, data);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string) {
    return this.consultationsService.complete(id);
  }

  @Get('patient/:patientId/history')
  getPatientHistory(@Param('patientId') patientId: string) {
    return this.consultationsService.getPatientHistory(patientId);
  }
}
