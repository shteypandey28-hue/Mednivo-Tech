import { Controller, Get, Post, Patch, Delete, Body, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClinicService } from './clinic.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('clinic')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ClinicController {
  constructor(private readonly clinicService: ClinicService) {}

  @Get()
  async getClinic(@CurrentUser('clinicId') clinicId: string, @CurrentUser('role') role: string) {
    return this.clinicService.findOne(clinicId, role);
  }

  @Patch()
  @Roles('DOCTOR', 'ADMIN')
  async updateClinic(@CurrentUser('clinicId') clinicId: string, @Body() data: any) {
    return this.clinicService.update(clinicId, data);
  }

  @Patch('settings')
  @Roles('DOCTOR', 'ADMIN')
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

  // --- Staff ---
  @Post('join')
  async join(@CurrentUser('id') userId: string, @Body() body: { code: string }) {
    return this.clinicService.joinClinic(userId, body?.code);
  }

  @Get('staff')
  @Roles('DOCTOR', 'ADMIN')
  async getStaff(@CurrentUser('clinicId') clinicId: string) {
    return this.clinicService.getStaff(clinicId);
  }

  @Delete('staff/:id')
  @Roles('DOCTOR', 'ADMIN')
  async removeStaff(@CurrentUser('clinicId') clinicId: string, @CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.clinicService.removeStaff(clinicId, id, userId);
  }

  @Post('join-code/regenerate')
  @Roles('DOCTOR', 'ADMIN')
  async regenerateJoinCode(@CurrentUser('clinicId') clinicId: string) {
    return this.clinicService.regenerateJoinCode(clinicId);
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
  updatePrintTemplate(@Param('id') id: string, @CurrentUser('id') doctorId: string, @Body() data: any) {
    return this.clinicService.updatePrintTemplate(id, doctorId, data);
  }

  @Delete('print-templates/:id')
  deletePrintTemplate(@Param('id') id: string, @CurrentUser('id') doctorId: string) {
    return this.clinicService.deletePrintTemplate(id, doctorId);
  }
}
