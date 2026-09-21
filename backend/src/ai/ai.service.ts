import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

  async processVoiceTranscript(transcript: string) {
    // In production, this would call OpenAI/Claude API to extract structured data
    // For now, we mock the extraction logic based on keywords
    
    const lower = transcript.toLowerCase();
    const result: any = {
      vitals: {},
      complaints: '',
      examination: '',
      diagnosis: '',
    };

    if (lower.includes('complaint') || lower.includes('suffering from')) {
      result.complaints = 'Fever and cough for the last 3 days. ' + transcript;
    } else {
      result.complaints = transcript;
    }

    if (lower.includes('blood pressure')) {
      result.vitals.systolic = '120';
      result.vitals.diastolic = '80';
    }
    if (lower.includes('fever') || lower.includes('temperature')) {
      result.vitals.temperature = '101.2';
    }

    if (lower.includes('diagnosis')) {
      result.diagnosis = 'Viral Pharyngitis';
    }

    return {
      success: true,
      extractedData: result,
      rawTranscript: transcript
    };
  }

  async summarizePatientHistory(patientId: string) {
    const consultations = await this.prisma.consultation.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { diagnoses: true }
    });

    if (consultations.length === 0) {
      return { summary: "No previous history found for this patient." };
    }

    // In production, send the consultations array to an LLM
    // Mock summary:
    const recent = consultations[0];
    return {
      summary: `Patient has a history of ${consultations.length} visits. Last visit was on ${recent.createdAt.toLocaleDateString()}. Previously diagnosed with ${recent.diagnoses?.map(d => d.name).join(', ') || 'minor ailments'}. Shows adherence to treatments. Needs follow-up on previous complaints.`,
      keyPoints: [
        `Total past visits: ${consultations.length}`,
        `Recent diagnosis: ${recent.diagnoses?.map(d => d.name).join(', ') || 'None recorded'}`,
        `Risk factors: None identified in recent history`
      ]
    };
  }

  async analyzePrescriptionPad(file: Express.Multer.File) {
    if (!file) throw new Error('No image provided');
    
    // Save file locally for preview/pdf rendering
    const filename = `template-${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
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
