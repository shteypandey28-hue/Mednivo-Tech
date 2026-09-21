import { Controller, Post, Body, Get, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('process-voice')
  processVoice(@Body() data: { transcript: string }) {
    return this.aiService.processVoiceTranscript(data.transcript);
  }

  @Get('summarize/:patientId')
  summarizePatientHistory(@Param('patientId') patientId: string) {
    return this.aiService.summarizePatientHistory(patientId);
  }

  @Post('prescription-pad')
  @UseInterceptors(FileInterceptor('image'))
  async analyzePrescriptionPad(@UploadedFile() file: Express.Multer.File) {
    return this.aiService.analyzePrescriptionPad(file);
  }
}
