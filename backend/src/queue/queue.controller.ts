import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QueueService } from './queue.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('queue')
@UseGuards(AuthGuard('jwt'))
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post()
  addToQueue(@CurrentUser('clinicId') clinicId: string, @Body() data: any) {
    return this.queueService.addToQueue({ patientId: data.patientId, doctorId: data.doctorId, appointmentId: data.appointmentId, clinicId });
  }

  @Get('today')
  getTodayQueue(
    @CurrentUser('clinicId') clinicId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Query('doctorId') doctorId?: string,
  ) {
    const dId = role === 'DOCTOR' ? userId : doctorId;
    return this.queueService.getTodayQueue(clinicId, dId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: any }, @CurrentUser('clinicId') clinicId: string) {
    return this.queueService.updateStatus(id, body.status, clinicId);
  }

  @Post('call-next')
  callNext(@CurrentUser('clinicId') clinicId: string, @CurrentUser('id') doctorId: string) {
    return this.queueService.callNext(clinicId, doctorId);
  }

  @Patch(':id/reorder')
  reorder(@Param('id') id: string, @Body() body: { position: number }, @CurrentUser('clinicId') clinicId: string) {
    return this.queueService.reorder(id, body.position, clinicId);
  }
}
