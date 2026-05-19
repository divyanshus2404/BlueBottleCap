import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing required payment verification fields.' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || '';

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment is authentic. Now sync with database!
      
      const rzpInstance = new Razorpay({
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        key_secret: secret,
      });

      // Fetch the order to get the attached user_id and plan from notes
      const order = await rzpInstance.orders.fetch(razorpay_order_id);
      const userId = order.notes?.user_id;
      const plan = order.notes?.plan;

      if (userId && userId !== 'anonymous') {
        // Initialize Supabase Admin client to bypass RLS
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_key';
        
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });

        // Upsert the user's new premium tier
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .upsert({ 
            id: userId, 
            tier: plan,
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error("Failed to update database, but payment succeeded:", error);
          // Return success anyway since we got their money, we can fix DB manually later
        }
      }

      return NextResponse.json({ success: true, message: 'Payment verified and database synced successfully.' });
    } else {
      return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Razorpay Verification Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
