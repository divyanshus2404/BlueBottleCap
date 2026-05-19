'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Clock, Zap, Crown, User as UserIcon } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [tier, setTier] = useState<string>('free');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadDashboard() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        window.location.href = '/login';
        return;
      }
      setUser(session.user);

      // Load subscription
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('id', session.user.id)
        .single();
      
      if (sub) setTier(sub.tier);

      // Load history
      const { data: hist } = await supabase
        .from('tool_history')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (hist) setHistory(hist);
      
      setLoading(false);
    }
    loadDashboard();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin text-blue-600"><Zap size={32} /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors font-medium">
            <ArrowLeft size={18} />
            Back to Platform
          </a>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button onClick={handleLogout} className="text-sm font-medium text-red-500 hover:text-red-600">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
            <UserIcon size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Welcome back!</h1>
            <p className="text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4">
              <Crown size={24} />
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Current Plan</h3>
            <div className="text-2xl font-bold capitalize">{tier}</div>
            {tier === 'free' && (
              <a href="/#pricing" className="mt-4 text-sm text-blue-600 hover:underline">Upgrade Now</a>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-4">
              <Zap size={24} />
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Generations Used</h3>
            <div className="text-2xl font-bold">{history.length}</div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Clock className="text-blue-600" />
          Recent Activity
        </h2>
        
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
          {history.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              You haven&apos;t generated anything yet. Go try out some tools!
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {history.map((item, i) => (
                <div key={i} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                      {item.tool_id.replace(/-/g, ' ')}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Input</span>
                      <p className="text-slate-500 dark:text-slate-400 line-clamp-3">{item.input_text}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Output</span>
                      <p className="text-slate-900 dark:text-slate-200 line-clamp-3">{item.output_text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
