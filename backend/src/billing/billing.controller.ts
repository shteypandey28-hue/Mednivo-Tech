import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BillingService } from './billing.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('billing')
@UseGuards(AuthGuard('jwt'))
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // ─── Invoices ──────────────────────────────────────────────────
  @Post('invoices')
  createInvoice(@CurrentUser('clinicId') clinicId: string, @Body() data: any) {
    return this.billingService.createInvoice({ ...data, clinicId });
  }

  @Get('invoices')
  getInvoices(
    @CurrentUser('clinicId') clinicId: string,
    @Query('status') status?: string,
    @Query('patientId') patientId?: string,
  ) {
    return this.billingService.getInvoices(clinicId, { status, patientId });
  }

  @Get('invoices/:id')
  getInvoice(@Param('id') id: string) {
    return this.billingService.getInvoice(id);
  }

  // ─── Payments ──────────────────────────────────────────────────
  @Post('payments')
  recordPayment(@CurrentUser('clinicId') clinicId: string, @Body() data: any) {
    return this.billingService.recordPayment({ ...data, clinicId });
  }

  @Get('payments')
  getPayments(
    @CurrentUser('clinicId') clinicId: string,
    @Query('date') date?: string,
  ) {
    return this.billingService.getPayments(clinicId, { date });
  }

  // ─── Receipts ──────────────────────────────────────────────────
  @Get('receipts')
  getReceipts(@CurrentUser('clinicId') clinicId: string) {
    return this.billingService.getReceipts(clinicId);
  }

  @Get('receipts/:id')
  getReceipt(@Param('id') id: string) {
    return this.billingService.getReceipt(id);
  }

  // ─── Financial Summary ─────────────────────────────────────────
  @Get('summary')
  getFinancialSummary(
    @CurrentUser('clinicId') clinicId: string,
    @Query('period') period: 'today' | 'week' | 'month' = 'today',
  ) {
    return this.billingService.getFinancialSummary(clinicId, period);
  }
}
