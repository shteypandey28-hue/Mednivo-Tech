import { Controller, Post, Body, Get, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('process-voice')
  processVoice(@Body() data: { transcript: string }) {
    return this.aiService.processVoiceTranscript(data.transcript);
  }

  @Get('summarize/:patientId')
  summarizePatientHistory(@Param('patientId') patientId: string, @CurrentUser('clinicId') clinicId: string) {
    return this.aiService.summarizePatientHistory(patientId, clinicId);
  }

  @Post('prescription-pad')
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async analyzePrescriptionPad(@UploadedFile() file: Express.Multer.File) {
    return this.aiService.analyzePrescriptionPad(file);
  }
}
