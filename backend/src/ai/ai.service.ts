import { BadRequestException, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { requireClinic } from '../common/tenant';

const ALLOWED_IMAGE_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

  async processVoiceTranscript(transcript: string) {
    // No speech model is connected yet. Never invent vitals or diagnoses here —
    // return the doctor's own words so they can review and edit them.
    return {
      success: true,
      isAiAssisted: false,
      extractedData: {
        vitals: {},
        complaints: (transcript || '').trim(),
        examination: '',
        diagnosis: '',
      },
      rawTranscript: transcript,
    };
  }

  async summarizePatientHistory(patientId: string, clinicId: string) {
    const consultations = await this.prisma.consultation.findMany({
      where: { patientId, clinicId: requireClinic(clinicId) },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { diagnoses: true }
    });

    if (consultations.length === 0) {
      return { summary: "No previous history found for this patient." };
    }

    // Factual summary built only from recorded data (no clinical judgements).
    const recent = consultations[0];
    const recentDiagnoses = recent.diagnoses?.map(d => d.name).join(', ');
    return {
      summary: `${consultations.length} recorded visit(s). Last visit on ${recent.createdAt.toLocaleDateString('en-IN')}${recentDiagnoses ? `, diagnosed with ${recentDiagnoses}` : ''}.`,
      keyPoints: [
        `Total past visits: ${consultations.length}`,
        `Recent diagnosis: ${recentDiagnoses || 'None recorded'}`,
      ]
    };
  }

  async analyzePrescriptionPad(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No image provided');
    if (!ALLOWED_IMAGE_TYPES[file.mimetype]) throw new BadRequestException('Upload a JPG, PNG or WebP image');

    // Save file locally for preview/pdf rendering. Never use the client's filename
    // (it could contain "../" and escape the uploads folder).
    const filename = `template-${Date.now()}-${randomBytes(6).toString('hex')}.${ALLOWED_IMAGE_TYPES[file.mimetype]}`;
    const publicPath = path.join(process.cwd(), 'public', 'uploads');
    
    if (!fs.existsSync(publicPath)) {
      fs.mkdirSync(publicPath, { recursive: true });
    }
    
    const filePath = path.join(publicPath, filename);
    fs.writeFileSync(filePath, file.buffer);
    
    const fileUrl = `/public/uploads/${filename}`;

    // MOCK AI VISION PARSING:
    // In production, you would send `file.buffer` to OpenAI GPT-4o Vision API:
    // "Analyze this prescription pad. Extract header/footer elements and dimensions."
    
    // For now, we mock the extraction to act as if it detected a header and footer:
    return {
      success: true,
      fileUrl,
      suggestedTemplate: {
        name: "AI Extracted Template",
        headerImageUrl: fileUrl, // Assuming the user cropped/uploaded just the header or the whole thing is used as background
        footerImageUrl: null,
        margins: { top: 150, bottom: 50, left: 40, right: 40 }
      }
    };
  }
}
