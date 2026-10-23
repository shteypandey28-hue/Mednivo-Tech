import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PUBLIC_USER, assertDoctorInClinic, assertPatientInClinic, requireClinic } from '../common/tenant';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Invoices ──────────────────────────────────────────────────
  async createInvoice(data: any) {
    const clinicId = requireClinic(data.clinicId);
    await assertPatientInClinic(this.prisma, data.patientId, clinicId);
    if (data.doctorId) await assertDoctorInClinic(this.prisma, data.doctorId, clinicId);
    if (data.appointmentId) {
      const appt = await this.prisma.appointment.findFirst({ where: { id: data.appointmentId, clinicId }, select: { id: true } });
      if (!appt) throw new NotFoundException('Appointment not found');
    }

    // Increment atomically so concurrent invoices never share a number.
    const clinic = await this.prisma.clinic.update({
      where: { id: clinicId },
      data: { invoiceCounter: { increment: 1 } },
      select: { invoicePrefix: true, invoiceCounter: true },
    });
    const invoiceNumber = `${clinic.invoicePrefix}-${String(clinic.invoiceCounter).padStart(6, '0')}`;

    // Calculate totals server-side; never trust totals sent by the client.
    let subtotal = 0;
    const invoiceItems = (Array.isArray(data.items) ? data.items : []).map((item: any) => {
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
      const total = quantity * unitPrice;
      subtotal += total;
      return { description: String(item.description || 'Item'), category: item.category, quantity, unitPrice, total };
    });

    const discountAmount = Math.max(0, Number(data.discountAmount) || 0);
    const taxAmount = Math.max(0, Number(data.taxAmount) || 0);
    const totalAmount = Math.max(0, subtotal - discountAmount + taxAmount);

    return this.prisma.invoice.create({
      data: {
        clinicId,
        patientId: data.patientId,
        doctorId: data.doctorId,
        appointmentId: data.appointmentId,
        notes: data.notes,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        discountPercent: data.discountPercent,
        taxPercent: data.taxPercent,
        invoiceNumber,
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        balanceDue: totalAmount,
        items: { create: invoiceItems },
      },
      include: { items: true, patient: true, doctor: PUBLIC_USER },
    });
  }

  async getInvoices(clinicId: string, filters: { status?: string; patientId?: string }) {
    const where: any = { clinicId: requireClinic(clinicId) };
    if (filters.status) where.status = filters.status;
    if (filters.patientId) where.patientId = filters.patientId;

    return this.prisma.invoice.findMany({
      where,
      include: {
        items: true,
        patient: { select: { id: true, name: true, patientUHID: true, phone: true } },
        doctor: { select: { id: true, name: true } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInvoice(id: string, clinicId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, clinicId: requireClinic(clinicId) },
      include: { items: true, patient: true, doctor: PUBLIC_USER, payments: true, receipt: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  // ─── Payments ──────────────────────────────────────────────────
  async recordPayment(data: { invoiceId: string; clinicId: string; amount: number; method: any; transactionId?: string; notes?: string }) {
    const clinicId = requireClinic(data.clinicId);
    const amount = Number(data.amount);
    if (!(amount > 0)) throw new BadRequestException('Amount must be greater than zero');

    const invoice = await this.prisma.invoice.findFirst({ where: { id: data.invoiceId, clinicId } });
    if (!invoice) throw new NotFoundException('Invoice not found');

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          invoiceId: invoice.id,
          clinicId,
          amount,
          method: data.method,
          status: 'SUCCESS',
          transactionId: data.transactionId,
          notes: data.notes,
          paidAt: new Date(),
        },
      });

      const updated = await tx.invoice.update({
        where: { id: invoice.id },
        data: { amountPaid: { increment: amount } },
      });
      const newBalance = updated.totalAmount - updated.amountPaid;
      await tx.invoice.update({
        where: { id: invoice.id },
        data: { balanceDue: Math.max(0, newBalance), status: newBalance <= 0 ? 'PAID' : 'PARTIALLY_PAID' },
      });

      // Invoice ↔ receipt is 1:1 in the schema, so only the first payment gets a receipt.
      const existingReceipt = await tx.receipt.findUnique({ where: { invoiceId: invoice.id }, select: { id: true } });
      if (!existingReceipt) {
        const clinic = await tx.clinic.update({
          where: { id: clinicId },
          data: { receiptCounter: { increment: 1 } },
          select: { receiptPrefix: true, receiptCounter: true },
        });
        await tx.receipt.create({
          data: {
            receiptNumber: `${clinic.receiptPrefix}-${String(clinic.receiptCounter).padStart(6, '0')}`,
            clinicId,
            invoiceId: invoice.id,
            paymentId: payment.id,
            amount,
          },
        });
      }

      return payment;
    });
  }

  async getPayments(clinicId: string, filters: { date?: string }) {
    const where: any = { clinicId: requireClinic(clinicId) };
    if (filters.date) {
      const date = new Date(filters.date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      where.paidAt = { gte: date, lt: nextDay };
    }

    return this.prisma.payment.findMany({
      where,
      include: {
        invoice: {
          include: {
            patient: { select: { id: true, name: true, patientUHID: true } },
          },
        },
      },
      orderBy: { paidAt: 'desc' },
    });
  }

  // ─── Receipts ──────────────────────────────────────────────────
  async getReceipts(clinicId: string) {
    return this.prisma.receipt.findMany({
      where: { clinicId: requireClinic(clinicId) },
      include: {
        invoice: {
          include: { patient: { select: { id: true, name: true, patientUHID: true } } },
        },
        payment: true,
      },
      orderBy: { generatedAt: 'desc' },
    });
  }

  async getReceipt(id: string, clinicId: string) {
    const receipt = await this.prisma.receipt.findFirst({
      where: { id, clinicId: requireClinic(clinicId) },
      include: {
        invoice: { include: { patient: true, doctor: PUBLIC_USER, items: true } },
        payment: true,
        clinic: true,
      },
    });
    if (!receipt) throw new NotFoundException('Receipt not found');
    return receipt;
  }

  // ─── Financial Reports ─────────────────────────────────────────
  async getFinancialSummary(clinicId: string, period: 'today' | 'week' | 'month' = 'today') {
    const now = new Date();
    let startDate: Date;

    if (period === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'week') {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const [revenue, expenses, pendingPayments, refunds] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { clinicId, status: 'SUCCESS', paidAt: { gte: startDate } },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.expense.aggregate({
        where: { clinicId, date: { gte: startDate } },
        _sum: { amount: true },
      }),
      this.prisma.invoice.aggregate({
        where: { clinicId, status: { in: ['PENDING', 'PARTIALLY_PAID'] } },
        _sum: { balanceDue: true },
        _count: true,
      }),
      this.prisma.refund.aggregate({
        where: { payment: { clinicId }, status: 'PROCESSED', processedAt: { gte: startDate } },
        _sum: { amount: true },
      }),
    ]);

    return {
      revenue: revenue._sum.amount || 0,
      transactionCount: revenue._count,
      expenses: expenses._sum.amount || 0,
      pendingPayments: pendingPayments._sum.balanceDue || 0,
      pendingCount: pendingPayments._count,
      refunds: refunds._sum.amount || 0,
      netRevenue: (revenue._sum.amount || 0) - (expenses._sum.amount || 0) - (refunds._sum.amount || 0),
    };
  }
}
