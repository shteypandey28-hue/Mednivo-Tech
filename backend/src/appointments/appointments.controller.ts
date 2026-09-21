import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentsService } from './appointments.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('appointments')
@UseGuards(AuthGuard('jwt'))
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(@CurrentUser('clinicId') clinicId: string, @Body() data: any) {
    return this.appointmentsService.create({ ...data, clinicId });
  }

  @Get()
  findAll(
    @CurrentUser('clinicId') clinicId: string,
    @Query('date') date?: string,
    @Query('doctorId') doctorId?: string,
    @Query('status') status?: string,
  ) {
    return this.appointmentsService.findAll(clinicId, { date, doctorId, status });
  }

  @Get('today')
  findToday(
    @CurrentUser('clinicId') clinicId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    const doctorId = role === 'DOCTOR' ? userId : undefined;
    return this.appointmentsService.findToday(clinicId, doctorId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: any; cancelReason?: string }) {
    return this.appointmentsService.updateStatus(id, body.status, body.cancelReason);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
