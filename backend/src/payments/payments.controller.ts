import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  createOrder(@Body() data: { amount: number; receiptId: string }, @CurrentUser() user: any) {
    return this.paymentsService.createOrder({
      amount: data.amount,
      receiptId: data.receiptId,
      clinicId: user.clinicId,
    });
  }

  @Post('verify')
  verifyPayment(@Body() data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    return this.paymentsService.verifyPayment(data);
  }
}
