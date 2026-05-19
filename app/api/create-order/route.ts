import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt = 'receipt_' + Date.now(), user_id, plan } = await req.json();

    if (!amount || amount < 100) {
      return NextResponse.json({ error: 'Invalid amount. Minimum amount is 100 paise.' }, { status: 400 });
    }

    const instance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });

    const order = await instance.orders.create({
      amount,
      currency,
      receipt,
      notes: {
        user_id: user_id || 'anonymous',
        plan: plan || 'basic'
      }
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Razorpay Order Creation Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
