import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import { PassThrough } from 'stream';
import { PrismaService } from '../prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PdfService {
  constructor(private readonly prisma: PrismaService) {}
  async generatePrescriptionPdf(prescriptionData: any, templateId?: string): Promise<Buffer> {
    
    // Fetch requested template or the default one for doctor
    let template = null;
    if (templateId) {
      template = await this.prisma.printTemplate.findUnique({
        where: { id: templateId }
      });
    }

    if (!template) {
      template = await this.prisma.printTemplate.findFirst({
        where: { doctorId: prescriptionData.doctorId, isDefault: true },
        orderBy: { createdAt: 'desc' }
      });
    }
    
    // Fallback to any active if no default is found
    if (!template) {
      template = await this.prisma.printTemplate.findFirst({
        where: { doctorId: prescriptionData.doctorId, isActive: true },
        orderBy: { createdAt: 'desc' }
      });
    }

    return new Promise((resolve, reject) => {
      // Default margins
      let margins = { top: 50, bottom: 50, left: 50, right: 50 };
      if (template?.margins) {
        try {
          margins = typeof template.margins === 'string' ? JSON.parse(template.margins as string) : template.margins;
        } catch (e) {}
      }

      const doc = new PDFDocument({ margin: 0 }); // We handle margins manually for backgrounds
      const buffers: Buffer[] = [];
      const stream = new PassThrough();

      stream.on('data', (chunk) => buffers.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(buffers)));
      stream.on('error', (err) => reject(err));

      doc.pipe(stream);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      // Draw header image if template exists.
      // If the doctor clicked a photo of their pad, it serves as the full background.
      if (template?.headerImageUrl) {
        const headerPath = path.join(process.cwd(), template.headerImageUrl);
        if (fs.existsSync(headerPath)) {
          // Check if this is meant to be a full page background by seeing if they left bottom margin small?
          // The best approach is to stretch it to width, and let it take up space. 
          // If it's a full page scan, it will cover the page.
          doc.image(headerPath, 0, 0, { width: pageWidth, height: pageHeight });
        }
      } else {
        // Fallback Header
        doc.y = margins.top;
        doc.fontSize(24).text('Mednivo Clinic', { align: 'center' });
        doc.fontSize(10).text('123 Health Ave, Medical District', { align: 'center' });
        doc.moveDown();
      }

      // Move Y cursor to below header margin for content
      doc.y = Math.max(doc.y, margins.top);
      doc.x = margins.left;

      // Ensure text is printed strictly within margins by setting text bounds
      const contentWidth = pageWidth - margins.left - margins.right;
      const blocks = template?.margins?.blocks;

      if (blocks) {
        // Advanced Drag & Drop Layout Mode
        const renderText = (text: string, x: number, y: number, options = {}) => {
            doc.text(text, x, y, { width: contentWidth, ...options });
        };

        // Patient
        if (blocks.patient) {
            doc.fontSize(12);
            renderText(`Patient: ${prescriptionData.patient?.name || 'Unknown'}`, blocks.patient.x, blocks.patient.y);
        }

        // Date
        if (blocks.date) {
            doc.fontSize(12);
            renderText(`Date: ${new Date().toLocaleDateString()}`, blocks.date.x, blocks.date.y);
        } else if (blocks.patient) {
            // Fallback if date block is missing but patient block exists (old template compatibility)
            renderText(`Date: ${new Date().toLocaleDateString()}`, blocks.patient.x, blocks.patient.y + 15);
        }

        // Advice
        if (blocks.advice && prescriptionData.advice) {
            doc.fontSize(14);
            renderText('Advice / Notes', blocks.advice.x, blocks.advice.y, { underline: true });
            doc.fontSize(12);
            renderText(prescriptionData.advice, blocks.advice.x, blocks.advice.y + 20);
        }

        // Medicines
        if (blocks.medicines && prescriptionData.medicines && prescriptionData.medicines.length > 0) {
            doc.fontSize(14);
            renderText('Medicines', blocks.medicines.x, blocks.medicines.y, { underline: true });
            
            let curY = blocks.medicines.y + 20;
            prescriptionData.medicines.forEach((med: any, index: number) => {
              doc.fontSize(12);
              renderText(`${index + 1}. ${med.name} - ${med.dosage}`, blocks.medicines.x, curY);
              curY += 15;
              doc.fontSize(10);
              renderText(`   Frequency: ${med.frequency} | Duration: ${med.duration}`, blocks.medicines.x, curY);
              curY += 15;
              if (med.instructions) {
                renderText(`   Note: ${med.instructions}`, blocks.medicines.x, curY);
                curY += 15;
              }
              curY += 5;
            });
        }
      } else {
        // Standard Top-To-Bottom Layout Mode
        // Patient Info
        doc.fontSize(12).text(`Patient: ${prescriptionData.patient?.name || 'Unknown'}`, { width: contentWidth });
        doc.text(`Date: ${new Date().toLocaleDateString()}`, { width: contentWidth });
        doc.moveDown();

        // Advice / Notes
        if (prescriptionData.advice) {
          doc.fontSize(14).text('Advice / Notes', { underline: true, width: contentWidth });
          doc.fontSize(12).text(prescriptionData.advice, { width: contentWidth });
          doc.moveDown();
        }

        // Medicines
        if (prescriptionData.medicines && prescriptionData.medicines.length > 0) {
          doc.fontSize(14).text('Medicines', { underline: true, width: contentWidth });
          doc.moveDown(0.5);
          
          prescriptionData.medicines.forEach((med: any, index: number) => {
            doc.fontSize(12).text(`${index + 1}. ${med.name} - ${med.dosage}`, { width: contentWidth });
            doc.fontSize(10).text(`   Frequency: ${med.frequency} | Duration: ${med.duration}`, { width: contentWidth });
            if (med.instructions) {
              doc.fontSize(10).text(`   Note: ${med.instructions}`, { width: contentWidth });
            }
            doc.moveDown(0.5);
          });
        }
      }

      // Render Custom Text Blocks (Rich Text Builder)
      const customTexts = margins.customTexts || [];
      customTexts.forEach((ct: any) => {
          let curY = ct.y;
          // Split by paragraphs or headers
          const elements = ct.html.match(/<(p|h[1-6])[^>]*>.*?<\/\1>/g) || [ct.html];
          elements.forEach((el: string) => {
              let text = el.replace(/<\/?[^>]+(>|$)/g, ""); // Strip tags
              text = text.replace(/&nbsp;/g, " ").trim(); // Replace HTML spaces
              if (!text) return; // Skip empty paragraphs
              
              // Font and Size
              if (el.includes('<h1')) doc.fontSize(24).font('Helvetica-Bold');
              else if (el.includes('<h2')) doc.fontSize(20).font('Helvetica-Bold');
              else if (el.includes('<h3')) doc.fontSize(16).font('Helvetica-Bold');
              else {
                  doc.fontSize(12).font('Helvetica');
                  if (el.includes('<strong>') || el.includes('<b>')) doc.font('Helvetica-Bold');
                  if (el.includes('<em>') || el.includes('<i>')) doc.font('Helvetica-Oblique');
              }
              
              // Alignment
              let align: "left" | "center" | "right" | "justify" = "left";
              if (el.includes('class="ql-align-center"')) align = "center";
              else if (el.includes('class="ql-align-right"')) align = "right";
              else if (el.includes('class="ql-align-justify"')) align = "justify";
              
              // Text color (optional basic extraction)
              let color = 'black';
              const colorMatch = el.match(/color:\s*(rgb\([^)]+\)|#[0-9a-fA-F]+)/);
              if (colorMatch) color = colorMatch[1];
              
              doc.fillColor(color).text(text, ct.x, curY, { width: ct.width || 495, align });
              curY += doc.heightOfString(text, { width: ct.width || 495, align }) + 2;
          });
          doc.fillColor('black'); // reset
      });


      // Footer Signature
      if (template?.signatureUrl) {
        const sigPath = path.join(process.cwd(), template.signatureUrl);
        if (fs.existsSync(sigPath)) {
          const sigWidth = 150;
          if (blocks && blocks.signature) {
            // Print at dragged exact coordinates
            doc.image(sigPath, blocks.signature.x, blocks.signature.y, { width: sigWidth });
          } else {
            // Fallback bottom right
            doc.image(sigPath, pageWidth - margins.right - sigWidth, pageHeight - margins.bottom - 60, { width: sigWidth });
          }
        }
      } else {
        // Only render fallback text if no header image background was used (otherwise it messes up the custom pad look)
        if (!template?.headerImageUrl) {
           doc.text('Doctor Signature', pageWidth - margins.right - 150, pageHeight - margins.bottom - 20, { align: 'right', width: 150 });
        }
      }

      // Draw footer image if explicitly provided (e.g., cropped footer)
      if (template?.footerImageUrl) {
        const footerPath = path.join(process.cwd(), template.footerImageUrl);
        if (fs.existsSync(footerPath)) {
          doc.image(footerPath, 0, pageHeight - margins.bottom, { width: pageWidth });
        }
      }

      doc.end();
    });
  }
}
