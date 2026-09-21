import { Controller, Get, Param, Res, UseGuards, NotFoundException } from '@nestjs/common';
import { PdfService } from './pdf.service';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('pdf')
@UseGuards(JwtAuthGuard)
export class PdfController {
  constructor(
    private readonly pdfService: PdfService,
    private readonly prisma: PrismaService
  ) {}

  @Get('prescription/:id')
  async downloadPrescription(@Param('id') id: string, @Res() res: Response) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: true,
        items: {
          include: { medicine: true }
        }
      }
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    // Format data for PDF
    const formattedData = {
      doctorId: prescription.doctorId,
      patient: prescription.patient,
      advice: prescription.advice,
      medicines: prescription.items.map(item => ({
        name: item.medicine?.name || 'Unknown',
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        instructions: item.instruction
      }))
    };

    const pdfBuffer = await this.pdfService.generatePrescriptionPdf(formattedData);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="prescription-${prescription.id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    
    res.end(pdfBuffer);
  }
}
