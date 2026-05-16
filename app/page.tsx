'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useClipboard } from '../hooks/useClipboard';
import { useDailyQuota } from '../hooks/useDailyQuota';
import { FeatureCard } from '../components/FeatureCard';
import { ToolSection } from '../components/ToolSection';

const features = [
  {
    icon: '🧠',
    title: 'Smart rewrite',
    description: 'Improve clarity, tighten structure, and make every sentence feel polished.',
  },
  {
    icon: '✍️',
    title: 'Student-ready tone',
    description: 'Turn notes or drafts into crisp writing with a confident, professional voice.',
  },
  {
    icon: '⚡',
    title: 'Fast one-screen workflow',
    description: 'Paste text, choose a style, and get results instantly without distractions.',
  },
];

const actions = ['rewrite', 'explain', 'formalize', 'expand'] as const;
type ActionId = (typeof actions)[number];
type ApiState = 'idle' | 'loading' | 'error' | 'success';

export default function HomePage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [displayedOutput, setDisplayedOutput] = useState('');
  const [status, setStatus] = useState<ApiState>('idle');
  const [message, setMessage] = useState('Paste your text and choose an action.');
  const [activeAction, setActiveAction] = useState<ActionId>('rewrite');
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { copied, copy } = useClipboard();
  const { remaining, limited, resetLabel, increment, limit } = useDailyQuota();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
      setScrollY(window.scrollY);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!output) {
      setDisplayedOutput('');
      return;
    }

    let current = 0;
    setDisplayedOutput('');
    const step = Math.max(1, Math.floor(output.length / 80));
    const interval = window.setInterval(() => {
      current += step;
      setDisplayedOutput(output.slice(0, current));
      if (current >= output.length) {
        setDisplayedOutput(output);
        window.clearInterval(interval);
      }
    }, 16);

    return () => window.clearInterval(interval);
  }, [output]);

  const handleAction = async (type: ActionId) => {
    if (limited) {
      setMessage('Your free limit is reached. Try again after reset.');
      return;
    }
    if (!input.trim()) {
      setMessage('Paste your text first.');
      return;
    }

    setActiveAction(type);
    setStatus('loading');
    setMessage('Refining your writing…');
    setOutput('');
    setDisplayedOutput('');

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, type }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || 'Server error');
      }

      const data = (await response.json()) as { result: string; mock?: boolean; warning?: string };
      setOutput(data.result.trim());
      setStatus('success');
      setMessage(data.mock ? `Using local mock response. ${data.warning ?? ''}` : 'Ready. Copy or refine another text.');
      increment();
    } catch (error) {
      setStatus('error');
      const message = error instanceof Error ? error.message : 'Unable to process text. Check your API key and try again.';
      setMessage(message);
      console.error(error);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      handleAction('rewrite');
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-100 text-slate-950">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          style={{ transform: `translate3d(0, ${scrollY * 0.06}px, 0)` }}
          className="absolute left-1/2 top-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-br from-sky-400 via-cyan-300 to-violet-500 opacity-50 blur-3xl animate-blob"
        />
        <motion.div
          style={{ transform: `translate3d(0, ${scrollY * -0.03}px, 0)` }}
          className="absolute right-0 top-1/3 h-[260px] w-[260px] rounded-full bg-indigo-400/40 blur-3xl opacity-50 animate-blob animation-delay-2000"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),transparent_30%)]" />
      </div>

      <header className={`sticky top-0 z-30 transition-all duration-500 ${scrolled ? 'border-b border-white/70 bg-white/80 backdrop-blur-xl shadow-sm' : 'bg-transparent'}`}>
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
              B
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.3em] uppercase text-blue-600">BluebottleCap</p>
              <p className="text-xs text-slate-500">Student writing assistant</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => document.getElementById('tool-panel')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700"
          >
            Start crafting
          </button>
        </nav>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="rounded-[32px] border border-white/80 bg-white/90 p-8 shadow-soft backdrop-blur-xl"
        >
          <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
            <div>
              <p className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.35em] text-blue-600">
                Premium writing, instantly
              </p>
              <h1 className="mt-8 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                One screen for confident, student-ready writing.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Paste your text, choose a style, and get refined output without distractions. Clean motion, calm feedback, and a premium one-screen workflow.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => document.getElementById('tool-panel')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Start writing
                </button>
                <a href="#features" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition duration-300 hover:border-blue-200 hover:bg-blue-50">
                  See features
                </a>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
              className="rounded-[28px] border border-slate-200 bg-slate-50/90 p-6 shadow-soft"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">How it works</p>
              <div className="mt-6 space-y-4">
                <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-slate-950">Paste your text</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">Insert anything from notes, essays, or messages.</p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-slate-950">Choose an action</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">Rewrite, explain, formalize or expand with one tap.</p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-slate-950">Copy or refine</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">Get fast output and continue editing without friction.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <section id="features" className="grid gap-5 md:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} index={index} icon={feature.icon} title={feature.title} description={feature.description} />
          ))}
        </section>

        <ToolSection
          input={input}
          onInput={setInput}
          output={output}
          displayedOutput={displayedOutput}
          message={message}
          activeAction={activeAction}
          loading={status === 'loading'}
          copied={copied}
          onAction={handleAction}
          onCopy={() => copy(output)}
          onClear={() => {
            setInput('');
            setOutput('');
            setDisplayedOutput('');
            setStatus('idle');
            setMessage('Paste your text and choose an action.');
          }}
          remaining={remaining}
          limit={limit}
        />

        <div className="rounded-[32px] border border-blue-200/80 bg-blue-50/75 p-6 text-sm text-slate-700 shadow-soft">
          <p className="font-semibold text-slate-950">Fast, premium feel</p>
          <p className="mt-2 text-slate-600">Smooth motion, subtle depth, and a calm experience built for daily student writing.</p>
        </div>
      </div>
    </main>
  );
}
