"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { createClient } from "@/lib/supabase/client";
import { Droplet, ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const plan = searchParams?.get("plan") || "basic";
  const isAnnual = searchParams?.get("annual") === "true";
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number>(83.5);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
    // Fetch real-time exchange rate
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then(res => res.json())
      .then(data => setExchangeRate(data.rates.INR))
      .catch(err => console.error('Failed to fetch exchange rate', err));
  }, []);

  // Determine pricing based on plan
  let monthlyPrice = 0;
  let name = "Basic";
  if (plan === "basic") {
    monthlyPrice = isAnnual ? 79 : 99;
    name = "Basic Plan";
  } else if (plan === "pro") {
    monthlyPrice = isAnnual ? 159 : 199;
    name = "Pro Plan";
  } else if (plan === "elite") {
    monthlyPrice = isAnnual ? 279 : 349;
    name = "Elite Plan";
  }

  // Use exact monthly price as requested by user instead of multiplying by 12
  const totalPrice = monthlyPrice;
  const priceInUSD = (totalPrice / exchangeRate).toFixed(2);

  const handlePayment = async () => {
    if (!user) {
      window.location.href = "/login?redirect=/checkout?plan=" + plan + "&annual=" + isAnnual;
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalPrice * 100, // in paise
          user_id: user.id,
          plan: plan,
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "BluebottleCap",
        description: `${name} (${isAnnual ? 'Annual' : 'Monthly'})`,
        order_id: data.id,
        handler: async function (response: any) {
          try {
            await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...response,
                user_id: user.id,
                plan: plan
              })
            });
            window.location.href = '/dashboard?success=true';
          } catch (err) {
            alert('Failed to verify payment');
          }
        },
        prefill: {
          email: user?.email || '',
        },
        theme: {
          color: "#2563eb"
        },
        modal: {
          ondismiss: function() {
            console.log('Checkout modal dismissed by user');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        alert('Payment failed: ' + response.error.description);
      });
      rzp.open();
    } catch (error: any) {
      console.error(error);
      alert('Checkout failed: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 selection:bg-blue-100 selection:text-blue-900">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Order Summary */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <a href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to home
          </a>

          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
          
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h3 className="font-semibold text-lg">{name}</h3>
              <p className="text-sm text-slate-500">{isAnnual ? 'Billed annually' : 'Billed monthly'}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">${priceInUSD}</div>
              <div className="text-sm text-slate-500 font-medium">₹{totalPrice} INR</div>
            </div>
          </div>

          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <CheckCircle2 size={18} className="text-green-500" /> Instant access to all {plan} features
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <CheckCircle2 size={18} className="text-green-500" /> Cancel anytime
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <CheckCircle2 size={18} className="text-green-500" /> Secure 256-bit encryption
            </li>
          </ul>

        </motion.div>

        {/* Right Column: Checkout Action */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col h-full justify-center"
        >
          <div className="flex items-center gap-2 mb-6 justify-center md:justify-start">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <Droplet size={20} fill="currentColor" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-blue-600 dark:text-blue-400">Bluebottlecap</span>
          </div>

          <h1 className="text-4xl font-bold mb-4 text-center md:text-left">Complete your upgrade</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-center md:text-left">
            You&apos;re just one step away from unlocking premium AI tools and blazing-fast image processing.
          </p>

          <button 
            onClick={handlePayment} 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 mb-6"
          >
            {loading ? 'Processing...' : `Pay $${priceInUSD} Securely`}
          </button>

          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <ShieldCheck size={16} className="text-green-500" />
            <span>Payments secured by Razorpay</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
