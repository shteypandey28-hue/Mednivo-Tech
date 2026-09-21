import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Invoices ──────────────────────────────────────────────────
  async createInvoice(data: any) {
    const clinic = await this.prisma.clinic.findUnique({ where: { id: data.clinicId } });
    if (!clinic) throw new NotFoundException('Clinic not found');

    // Auto-generate invoice number
    const counter = clinic.invoiceCounter + 1;
    const invoiceNumber = `${clinic.invoicePrefix}-${String(counter).padStart(6, '0')}`;

    await this.prisma.clinic.update({
      where: { id: data.clinicId },
      data: { invoiceCounter: counter },
    });

    const { items, ...invoiceData } = data;

    // Calculate totals
    let subtotal = 0;
    const invoiceItems = items?.map((item: any) => {
      const total = item.quantity * item.unitPrice;
      subtotal += total;
      return { ...item, total };
    }) || [];

    const discountAmount = invoiceData.discountAmount || 0;
    const taxAmount = invoiceData.taxAmount || 0;
    const totalAmount = subtotal - discountAmount + taxAmount;

    return this.prisma.invoice.create({
      data: {
        ...invoiceData,
        invoiceNumber,
        subtotal,
        totalAmount,
        balanceDue: totalAmount,
        items: { create: invoiceItems },
      },
      include: { items: true, patient: true, doctor: true },
    });
  }

  async getInvoices(clinicId: string, filters: { status?: string; patientId?: string }) {
    const where: any = { clinicId };
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

  async getInvoice(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { items: true, patient: true, doctor: true, payments: true, receipt: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  // ─── Payments ──────────────────────────────────────────────────
  async recordPayment(data: { invoiceId: string; clinicId: string; amount: number; method: any; transactionId?: string; notes?: string }) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: data.invoiceId } });
    if (!invoice) throw new NotFoundException('Invoice not found');

    const payment = await this.prisma.payment.create({
      data: {
        invoiceId: data.invoiceId,
        clinicId: data.clinicId,
        amount: data.amount,
        method: data.method,
        status: 'SUCCESS',
        transactionId: data.transactionId,
        notes: data.notes,
        paidAt: new Date(),
      },
    });

    // Update invoice
    const newAmountPaid = invoice.amountPaid + data.amount;
    const newBalance = invoice.totalAmount - newAmountPaid;
    const newStatus = newBalance <= 0 ? 'PAID' : 'PARTIALLY_PAID';

    await this.prisma.invoice.update({
      where: { id: data.invoiceId },
      data: {
        amountPaid: newAmountPaid,
        balanceDue: Math.max(0, newBalance),
        status: newStatus,
      },
    });

    // Auto-generate receipt
    const clinic = await this.prisma.clinic.findUnique({ where: { id: data.clinicId } });
    if (clinic) {
      const receiptCounter = (await this.prisma.receipt.count({ where: { clinicId: data.clinicId } })) + 1;
      const receiptNumber = `${clinic.receiptPrefix}-${String(receiptCounter).padStart(6, '0')}`;

      await this.prisma.receipt.create({
        data: {
          receiptNumber,
          clinicId: data.clinicId,
          invoiceId: data.invoiceId,
          paymentId: payment.id,
          amount: data.amount,
        },
      });
    }

    return payment;
  }

  async getPayments(clinicId: string, filters: { date?: string }) {
    const where: any = { clinicId };
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
      where: { clinicId },
      include: {
        invoice: {
          include: { patient: { select: { id: true, name: true, patientUHID: true } } },
        },
        payment: true,
      },
      orderBy: { generatedAt: 'desc' },
    });
  }

  async getReceipt(id: string) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id },
      include: {
        invoice: { include: { patient: true, doctor: true, items: true } },
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
