'use client';

import { motion } from 'framer-motion';

type ActionId = 'rewrite' | 'explain' | 'formalize' | 'expand';

type ToolSectionProps = {
  input: string;
  onInput: (value: string) => void;
  output: string;
  displayedOutput: string;
  message: string;
  activeAction: ActionId;
  loading: boolean;
  copied: boolean;
  onAction: (type: ActionId) => void;
  onCopy: () => void;
  onClear: () => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  remaining: number;
  limit: number;
};

const actions: Array<{ id: ActionId; label: string }> = [
  { id: 'rewrite', label: 'Rewrite' },
  { id: 'explain', label: 'Explain' },
  { id: 'formalize', label: 'Formalize' },
  { id: 'expand', label: 'Expand' },
];

export function ToolSection({
  input,
  onInput,
  output,
  displayedOutput,
  message,
  activeAction,
  loading,
  copied,
  onAction,
  onCopy,
  onClear,
  onKeyDown,
  remaining,
  limit,
}: ToolSectionProps) {
  return (
    <motion.section
      id="tool-panel"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="rounded-[32px] border border-white/80 bg-white/90 p-6 shadow-soft backdrop-blur-xl"
      aria-busy={loading}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">BluebottleCap Studio</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Paste your text and polish it in one click.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            The same tool used to rewrite, clarify, formalize, or expand anything fast.
          </p>
        </div>

        <div className="rounded-[28px] border border-blue-100 bg-blue-50/80 px-4 py-3 text-sm text-slate-700 shadow-sm">
          <p className="font-semibold text-slate-900">{remaining}/{limit} free uses left</p>
          <p className="mt-2 text-slate-600">Limit resets daily. Upgrade for unlimited access.</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6">
        <label className="block text-sm font-medium text-slate-700">
          Input text
          <textarea
            value={input}
            onChange={(event) => onInput(event.target.value)}
            onKeyDown={onKeyDown}
            rows={6}
            placeholder="Paste your paragraph or notes here…"
            className="mt-3 w-full rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-900 outline-none transition duration-300 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          {actions.map((action) => (
            <motion.button
              key={action.id}
              type="button"
              onClick={() => onAction(action.id)}
              disabled={loading}
              whileHover={!loading ? { y: -3, scale: 1.02 } : undefined}
              whileTap={{ scale: 0.985 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition duration-300 ${
                activeAction === action.id
                  ? 'btn-gradient text-white shadow-lg shadow-blue-500/15'
                  : 'border border-blue-100 bg-white text-blue-700 hover:border-blue-200 hover:bg-blue-50'
              } ${loading ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              {action.label}
            </motion.button>
          ))}
        </div>

        <div className="relative rounded-[28px] border border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-900 shadow-inner">
          <div className="absolute inset-x-6 top-6 h-px bg-slate-200/80" />
          <div className="min-h-[220px] pt-3" role="status" aria-live="polite">
            {loading ? (
              <div className="space-y-3">
                <div className="h-4 w-3/4 rounded-md skeleton" />
                <div className="h-4 w-5/6 rounded-md skeleton" />
                <div className="h-4 w-2/3 rounded-md skeleton" />
                <div className="h-4 w-4/5 rounded-md skeleton" />
              </div>
            ) : displayedOutput ? (
              <p className="whitespace-pre-wrap break-words">{displayedOutput}</p>
            ) : (
              <p className="text-slate-500">Output appears here after you choose an action.</p>
            )}
          </div>
          <p className="mt-4 text-xs text-slate-500">{message}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <button
              type="button"
              onClick={onCopy}
              disabled={!output || loading}
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-blue-700 ring-1 ring-blue-100 transition duration-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Copy
            </button>
            {copied && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: -12 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28 }}
                className="pointer-events-none absolute -right-2 -top-8 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-md"
              >
                Copied
              </motion.div>
            )}
          </div>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white transition duration-300 hover:bg-blue-700"
          >
            Clear all
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Tip: Hold <span className="rounded-full bg-slate-100 px-2 py-1">Ctrl/⌘</span> + Enter to rewrite immediately.
        </p>
      </div>
    </motion.section>
  );
}
