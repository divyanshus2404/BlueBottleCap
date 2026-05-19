'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplet } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      window.location.href = '/tools';
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    setMessage('');
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Check your email for the confirmation link.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 selection:bg-blue-100 selection:text-blue-900">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
            <Droplet size={20} fill="currentColor" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-blue-600">Bluebottlecap</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Welcome back</h2>
          
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-slate-50 focus:bg-white"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-slate-50 focus:bg-white"
                placeholder="••••••••"
                required
              />
            </div>

            {message && (
              <div className="text-sm text-center font-medium text-blue-600 bg-blue-50 p-3 rounded-xl">
                {message}
              </div>
            )}

            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>
            
            <button 
              disabled={loading}
              type="button"
              onClick={handleSignUp}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              Create an account
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
