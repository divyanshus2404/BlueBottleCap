'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Wand2, Loader2, Copy, Check, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ThemeToggle } from '@/components/theme-toggle';

export default function ToolPage() {
  const params = useParams();
  const toolId = (params?.id as string) || '';
  
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  
  // Image Tool States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageOutput, setImageOutput] = useState('');
  const [outputFilename, setOutputFilename] = useState('');
  const [tier, setTier] = useState<string>('free');
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function checkAccess() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('tier')
          .eq('id', session.user.id)
          .single();
        if (sub) setTier(sub.tier);
      }
      setCheckingAccess(false);
    }
    checkAccess();
  }, []);

  const title = toolId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Basic routing map to map our new 20 tools to the existing backend actions
  let backendAction = 'rewrite';
  if (toolId.includes('explain')) backendAction = 'explain';
  if (toolId.includes('formalize') || toolId.includes('email')) backendAction = 'formalize';
  if (toolId.includes('summary') || toolId.includes('expand')) backendAction = 'expand';

  const isImageTool = ['image-compressor', 'image-resizer', 'crop-image', 'jpg-to-png', 'background-remover', 'ocr-image-to-text'].includes(toolId);

  const handleProcess = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setError('');
    setOutput('');
    
    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, type: backendAction, user_id: userId, tool_id: toolId }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setOutput(data.result);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (e) {
      setError('Failed to process request');
    }
    
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageProcess = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError('');
    setImageOutput('');
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('action', toolId);

      const res = await fetch('/api/process-image', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setImageOutput(data.result);
        setOutputFilename(data.filename);
      } else {
        setError(data.error || 'Failed to process image');
      }
    } catch (e) {
      setError('Upload failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col p-6 selection:bg-blue-100 selection:text-blue-900 transition-colors">
      <header className="mb-10 flex justify-between items-center max-w-5xl mx-auto w-full">
        <a href="/" className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-colors">&larr; Back to Platform</a>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full capitalize">
            {tier} Tier
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-10 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
        >
          <div className="flex items-center gap-4 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{title}</h1>
            <span className="bg-purple-100 text-purple-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              Beta
            </span>
          </div>
          
          {checkingAccess ? (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <Loader2 className="animate-spin mr-2" /> Checking access...
            </div>
          ) : (tier === 'free' && ['background-remover', 'ocr-image-to-text', 'paraphrasing-tool', 'question-generator', 'answer-generator', 'summary-generator', 'email-generator', 'caption-generator', 'assignment-formatter', 'flashcard-generator', 'study-planner', 'notes-to-questions', 'topic-explainer'].includes(toolId)) ? (
            <div className="h-64 border-2 border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-600 bg-slate-50 p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-4">
                <Lock size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Premium Tool</h3>
              <p className="mb-6">Upgrade to Basic, Pro, or Elite to unlock this tool and many more.</p>
              <a href="/#pricing" className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                View Pricing
              </a>
            </div>
          ) : isImageTool ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Input Area */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-slate-700">Upload Image</label>
                <div className="w-full h-64 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-500 bg-slate-50 relative hover:bg-slate-100 transition-colors cursor-pointer overflow-hidden">
                  {selectedFile ? (
                    <div className="text-center p-4">
                      <p className="font-medium text-slate-800 mb-1">{selectedFile.name}</p>
                      <p className="text-xs text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button onClick={(e) => { e.preventDefault(); setSelectedFile(null); setImageOutput(''); }} className="mt-4 text-red-500 text-sm font-medium hover:underline">Remove</button>
                    </div>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-slate-300"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      <p className="text-sm font-medium">Click to upload image</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <button 
                  onClick={handleImageProcess}
                  disabled={loading || !selectedFile}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                  {loading ? 'Processing...' : `Run ${title}`}
                </button>
                {error && <p className="text-sm text-red-500 font-medium text-center">{error}</p>}
              </div>

              {/* Image Output Area */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-slate-700">Result</label>
                <div className={`w-full h-64 rounded-2xl border transition-all flex items-center justify-center overflow-hidden ${imageOutput ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                  {imageOutput ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageOutput} alt="Processed Result" className="max-w-full max-h-full object-contain" />
                  ) : (
                    "Your processed image will appear here..."
                  )}
                </div>
                {imageOutput && (
                  <a 
                    href={imageOutput} 
                    download={outputFilename || 'processed_image.jpg'}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    Download Result
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Area */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-slate-700">Original Text</label>
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste your text here..."
                  className="w-full h-64 p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                />
                <button 
                  onClick={handleProcess}
                  disabled={loading || !input.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                  {loading ? 'Processing...' : `Run ${title}`}
                </button>
                {error && <p className="text-sm text-red-500 font-medium text-center">{error}</p>}
              </div>

              {/* Output Area */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700">Result</label>
                  {output && (
                    <button 
                      onClick={handleCopy}
                      className="text-xs flex items-center gap-1 font-medium text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
                <div className={`w-full h-64 p-4 rounded-2xl border transition-all overflow-y-auto ${output ? 'border-blue-200 bg-blue-50/30 text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                  {output || "Your processed result will appear here..."}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
