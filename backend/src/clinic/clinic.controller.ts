import { Controller, Get, Post, Patch, Delete, Body, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClinicService } from './clinic.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('clinic')
@UseGuards(AuthGuard('jwt'))
export class ClinicController {
  constructor(private readonly clinicService: ClinicService) {}

  @Get()
  async getClinic(@CurrentUser('clinicId') clinicId: string) {
    return this.clinicService.findOne(clinicId);
  }

  @Patch()
  async updateClinic(@CurrentUser('clinicId') clinicId: string, @Body() data: any) {
    return this.clinicService.update(clinicId, data);
  }

  @Patch('settings')
  async updateSettings(@CurrentUser('clinicId') clinicId: string, @Body() data: any) {
    return this.clinicService.updateSettings(clinicId, data);
  }

  @Get('doctors')
  async getDoctors(@CurrentUser('clinicId') clinicId: string) {
    return this.clinicService.getDoctors(clinicId);
  }

  @Get('dashboard')
  async getDashboard(@CurrentUser('clinicId') clinicId: string) {
    return this.clinicService.getDashboardStats(clinicId);
  }

  // --- Print Templates ---
  @Get('print-templates')
  async getPrintTemplates(@CurrentUser('id') doctorId: string) {
    return this.clinicService.getPrintTemplates(doctorId);
  }

  @Post('print-templates')
  async createPrintTemplate(@CurrentUser('id') doctorId: string, @CurrentUser('clinicId') clinicId: string, @Body() data: any) {
    return this.clinicService.createPrintTemplate(doctorId, clinicId, data);
  }

  @Patch('print-templates/:id')
  updatePrintTemplate(@Param('id') id: string, @Body() data: any) {
    return this.clinicService.updatePrintTemplate(id, data);
  }

  @Delete('print-templates/:id')
  deletePrintTemplate(@Param('id') id: string) {
    return this.clinicService.deletePrintTemplate(id);
  }
}
