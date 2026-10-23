import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PatientsService } from './patients.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('patients')
@UseGuards(AuthGuard('jwt'))
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  create(@Body() createPatientDto: any, @CurrentUser('clinicId') clinicId: string) {
    return this.patientsService.create(createPatientDto, clinicId);
  }

  @Get()
  findAll(@Query('q') query: string, @CurrentUser('clinicId') clinicId: string) {
    return this.patientsService.findAll(query, clinicId);
  }

  @Get('stats')
  getStats(@CurrentUser('clinicId') clinicId: string) {
    return this.patientsService.getStats(clinicId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('clinicId') clinicId: string) {
    return this.patientsService.findOne(id, clinicId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePatientDto: any, @CurrentUser('clinicId') clinicId: string) {
    return this.patientsService.update(id, updatePatientDto, clinicId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('clinicId') clinicId: string) {
    return this.patientsService.remove(id, clinicId);
  }
}
