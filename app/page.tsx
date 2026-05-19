'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useClipboard } from '../hooks/useClipboard';
import { useDailyQuota } from '../hooks/useDailyQuota';
import { FeatureCard } from '../components/FeatureCard';
import { ToolSection } from '../components/ToolSection';
import { AnimatedLogo } from '../components/AnimatedLogo';
import { LottieHero } from '../components/LottieHero';
import { BottleAnimation } from '../components/bottle-animation';

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
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
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
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 26;
      const y = (event.clientY / window.innerHeight - 0.5) * 26;
      setPointer({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
      // Try streaming endpoint first
      const streamResp = await fetch('/api/stream-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, type }),
      });

      if (!streamResp.ok) {
        const error = await streamResp.json();
        throw new Error(error?.error || 'Server error');
      }

      // If the response is a stream (SSE), consume it progressively
      if (streamResp.body) {
        const reader = streamResp.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let full = '';

        while (!done) {
          const { value, done: rDone } = await reader.read();
          done = !!rDone;
          if (value) {
            const chunk = decoder.decode(value);
            // SSE sends `data: ...\n\n` blocks; strip 'data:' and append
            const cleaned = chunk.replace(/data:\s?/g, '').replace(/\n\n/g, '');
            full += cleaned;
            setDisplayedOutput((prev) => prev + cleaned);
          }
        }

        setOutput(full.trim());
        setStatus('success');
        setMessage('Ready. Copy or refine another text.');
        increment();
        return;
      }

      // Fallback to non-streaming endpoint
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
      handleAction(activeAction);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-100 text-slate-950">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          style={{ transform: `translate3d(${pointer.x * 0.02}px, ${scrollY * 0.06}px, 0)` }}
          className="absolute left-1/2 top-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-br from-sky-400 via-cyan-300 to-violet-500 opacity-60 blur-3xl animate-blob"
        />
        <motion.div
          style={{ transform: `translate3d(${pointer.x * -0.03}px, ${scrollY * -0.03}px, 0)` }}
          className="absolute right-0 top-1/3 h-[260px] w-[260px] rounded-full bg-indigo-400/40 blur-3xl opacity-50 animate-blob animation-delay-2000"
        />
        <motion.div
          style={{ transform: `translate3d(${pointer.x * 0.18}px, ${pointer.y * 0.18}px, 0)` }}
          className="absolute left-14 top-1/2 h-24 w-24 rounded-full bg-emerald-300/15 blur-3xl opacity-80"
        />
        <motion.div
          style={{ transform: `translate3d(${pointer.x * -0.14}px, ${pointer.y * -0.12}px, 0)` }}
          className="absolute right-16 top-4 h-20 w-20 rounded-full bg-fuchsia-400/15 blur-3xl opacity-90"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),transparent_30%)]" />
      </div>

      <header className={`sticky top-0 z-30 transition-all duration-500 ${scrolled ? 'border-b border-white/70 bg-white/80 backdrop-blur-xl shadow-sm' : 'bg-transparent'}`}>
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
              <AnimatedLogo size={36} />
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

      <BottleAnimation />
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
                A premium writing studio made for instant clarity.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Paste text, select a tone, and polish everything in a single refined flow. Minimal distractions, thoughtful motion, and output designed to feel effortless.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-xs uppercase tracking-[0.35em] text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-2">Focused workflow</span>
                <span className="rounded-full bg-slate-100 px-3 py-2">Premium motion</span>
                <span className="rounded-full bg-slate-100 px-3 py-2">Student-ready tone</span>
              </div>
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
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.15, ease: 'easeOut' }}
              className="relative rounded-[28px] border border-slate-200 bg-slate-950/95 p-6 shadow-soft glass overflow-hidden"
            >
              <div className="pointer-events-none absolute -top-6 right-4 h-32 w-32 rounded-full bg-blue-400/20 blur-3xl" />
              <div className="pointer-events-none absolute left-4 top-20 h-24 w-24 rounded-full bg-violet-500/15 blur-3xl" />
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-sky-300">Live preview</p>
                  <h3 className="mt-4 text-3xl font-semibold text-white">Polish before you paste.</h3>
                </div>
                <div className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white/80">
                  +35% clarity
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center">
                <LottieHero />
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-[24px] border border-slate-800/90 bg-slate-900/95 p-5 shadow-xl">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Original</p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    I need this paragraph to sound more professional while keeping the original meaning.
                  </p>
                </div>
                <div className="rounded-[24px] border border-blue-500/20 bg-blue-500/10 p-5 shadow-xl">
                  <p className="text-xs uppercase tracking-[0.35em] text-blue-200">Refined</p>
                  <p className="mt-3 text-sm leading-7 text-slate-50">
                    Transform this paragraph into polished, professional language that still reflects the same message.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 text-sm text-slate-300">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_8px_rgba(16,185,129,0.08)]" />
                <span>Instant clarity with premium motion and thoughtful output.</span>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <section id="features" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} index={index} icon={feature.icon} title={feature.title} description={feature.description} />
          ))}
        </section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="rounded-[32px] border border-white/80 bg-white/90 p-8 shadow-soft backdrop-blur-xl"
        >
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-blue-600">Crafted for focus</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                A calm, premium interface designed for effortless writing.
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                The experience blends airy spacing, refined motion, and clean feedback so every interaction feels intuitive and intentional.
              </p>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Speed</p>
                <p className="mt-4 text-lg font-semibold text-slate-950">Instant output</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Get polished writing in a single tap with live progress feedback.</p>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Clarity</p>
                <p className="mt-4 text-lg font-semibold text-slate-950">Studio-grade tone</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">From formal essays to casual notes, every style feels polished and consistent.</p>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Focus</p>
                <p className="mt-4 text-lg font-semibold text-slate-950">One screen workflow</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">No clutter, no tabs. Write, refine, and copy without losing momentum.</p>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Polish</p>
                <p className="mt-4 text-lg font-semibold text-slate-950">Responsive motion</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Subtle animation and tactile UI cues keep the interface feeling alive.</p>
              </div>
            </div>
          </div>
        </motion.section>

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
          onKeyDown={handleKeyDown}
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

        {/* PRICING SECTION */}
        <section id="pricing" className="py-20 px-6 max-w-5xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Simple, transparent pricing</h2>
            <p className="mt-4 text-lg text-slate-600">Invest in your productivity without breaking the bank.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold text-slate-900">Basic</h3>
              <div className="mt-4 flex items-baseline text-4xl font-extrabold text-slate-900">
                ₹99
                <span className="ml-1 text-xl font-medium text-slate-500">/mo</span>
              </div>
              <p className="mt-4 text-sm text-slate-500">Perfect for getting started.</p>
              <button onClick={() => window.location.href='/checkout?plan=basic&annual=false'} className="mt-8 block w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold py-3 px-4 rounded-xl text-center transition-colors">Get Basic</button>
            </div>
            
            <div className="bg-blue-600 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-600/20 relative transform lg:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">Most Popular</div>
              <h3 className="text-xl font-semibold text-white">Student Pro</h3>
              <div className="mt-4 flex items-baseline text-4xl font-extrabold text-white">
                ₹159
                <span className="ml-1 text-xl font-medium text-blue-200">/mo</span>
              </div>
              <p className="mt-4 text-sm text-blue-100">Everything you need to excel.</p>
              <button onClick={() => window.location.href='/checkout?plan=pro&annual=true'} className="mt-8 block w-full bg-white hover:bg-slate-50 text-blue-600 font-semibold py-3 px-4 rounded-xl text-center transition-colors">Upgrade to Pro</button>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
              <h3 className="text-xl font-semibold text-slate-900">Elite</h3>
              <div className="mt-4 flex items-baseline text-4xl font-extrabold text-slate-900">
                ₹349
                <span className="ml-1 text-xl font-medium text-slate-500">/mo</span>
              </div>
              <p className="mt-4 text-sm text-slate-500">For absolute power users.</p>
              <button onClick={() => window.location.href='/checkout?plan=elite&annual=false'} className="mt-8 block w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold py-3 px-4 rounded-xl text-center transition-colors">Get Elite</button>
            </div>
          </div>
        </section>

        <footer className="rounded-[32px] border border-white/80 bg-white/90 p-8 text-sm text-slate-600 shadow-soft backdrop-blur-xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950">BluebottleCap</p>
              <p className="mt-2 max-w-xl text-sm leading-7 text-slate-600">A polished writing studio made for students, creators, and anyone who wants better writing in one clean workflow.</p>
            </div>
            <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.3em] text-slate-500">
              <span>Built for clarity</span>
              <span>Fast workflow</span>
              <span>Clean design</span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
