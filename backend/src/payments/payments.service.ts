import { Injectable, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Razorpay = require('razorpay');
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private razorpay: any;

  constructor(private readonly prisma: PrismaService) {
    // In production, these should come from ConfigService
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
    }
  }

  async createOrder(data: { amount: number; receiptId: string; clinicId: string }) {
    if (!this.razorpay) throw new ServiceUnavailableException('Online payments are not configured');
    try {
      const options = {
        amount: Math.round(data.amount * 100), // Razorpay expects amount in paise
        currency: 'INR',
        receipt: data.receiptId,
      };
      
      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new InternalServerErrorException('Payment gateway error');
    }
  }

  async verifyPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new ServiceUnavailableException('Online payments are not configured');

    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    const expected = Buffer.from(digest);
    const given = Buffer.from(String(razorpay_signature || ''));
    if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) {
      return { success: false, message: 'Invalid signature' };
    }

    return { success: true };
  }
}
