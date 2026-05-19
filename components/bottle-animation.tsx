"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const TOOLS = [
  "Essay Writer", "Grammar Check", "Plagiarism Checker", "Citation Generator",
  "Math Solver", "Physics Helper", "Chemistry Balancer", "History Summarizer",
  "Code Debugger", "Code Explainer", "SQL Generator", "Regex Builder",
  "Flashcard Maker", "Quiz Generator", "Study Planner", "GPA Calculator",
  "Resume Builder", "Cover Letter Writer", "Interview Prep", "Email Drafter",
  "Paraphraser", "Text Summarizer", "Tone Changer", "Creative Story Writer",
  "Language Translator", "Vocab Builder", "Pronunciation Guide", "Idiom Explainer",
  "Presentation Outliner", "Speech Writer", "Slide Summarizer", "Debate Prep",
  "Data Analyzer", "Graph Maker", "Stat Solver", "Excel Formula Maker",
  "Music Theory", "Art History", "Philosophy Guide", "Literature Analyst"
];

export function BottleAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Bottle transformations
  const bottleY = useTransform(scrollYProgress, [0, 0.2], [0, 200]);
  const bottleScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.5]);
  const bottleOpacity = useTransform(scrollYProgress, [0.4, 0.5], [1, 0]);

  // Cap transformations (opens upwards)
  const capY = useTransform(scrollYProgress, [0.1, 0.2], [0, -100]);
  const capRotate = useTransform(scrollYProgress, [0.1, 0.2], [0, 45]);
  const capOpacity = useTransform(scrollYProgress, [0.3, 0.4], [1, 0]);

  // Liquid/Fizz transformations
  const fizzOpacity = useTransform(scrollYProgress, [0.15, 0.25], [0, 1]);
  const fizzScale = useTransform(scrollYProgress, [0.15, 0.3], [0.5, 2]);

  // Tools Grid transformations
  const gridOpacity = useTransform(scrollYProgress, [0.3, 0.5], [0, 1]);
  const gridY = useTransform(scrollYProgress, [0.3, 0.5], [100, 0]);

  return (
    <div ref={containerRef} className="relative h-[250vh] w-full bg-slate-50 overflow-hidden">
      
      {/* Sticky Container for Animation */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        
        <div className="absolute top-20 text-center z-10 w-full px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-2 sm:mb-4">
            Unleash Your Productivity
          </h2>
          <p className="text-sm sm:text-lg text-slate-500 font-medium tracking-wide uppercase">
            Scroll down to open
          </p>
        </div>

        {/* The Bottle SVG */}
        <motion.div 
          style={{ y: bottleY, scale: bottleScale, opacity: bottleOpacity }}
          className="relative z-20 flex flex-col items-center mt-20"
        >
          {/* Cap */}
          <motion.div style={{ y: capY, rotate: capRotate, opacity: capOpacity }} className="z-30 origin-bottom-left">
            <svg width="60" height="40" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 0H50C55.5228 0 60 4.47715 60 10V40H0V10C0 4.47715 4.47715 0 10 0Z" fill="#1e40af"/>
              <rect x="5" y="10" width="50" height="4" fill="#3b82f6"/>
              <rect x="5" y="20" width="50" height="4" fill="#3b82f6"/>
              <rect x="5" y="30" width="50" height="4" fill="#3b82f6"/>
            </svg>
          </motion.div>

          {/* Bottle Body */}
          <svg width="120" height="250" viewBox="0 0 120 250" fill="none" xmlns="http://www.w3.org/2000/svg" className="-mt-2">
            <path d="M40 0H80V30C80 40 110 60 110 90V220C110 236.569 96.5685 250 80 250H40C23.4315 250 10 236.569 10 220V90C10 60 40 40 40 30V0Z" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="4"/>
            {/* Liquid */}
            <path d="M14 120C14 100 30 90 40 90H80C90 90 106 100 106 120V220C106 234.359 94.3594 246 80 246H40C25.6406 246 14 234.359 14 220V120Z" fill="#3b82f6" opacity="0.8"/>
            <path d="M40 90C45 80 55 85 60 90C65 95 75 80 80 90" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round"/>
          </svg>
          
          {/* Fizz Particles popping out */}
          <motion.div style={{ opacity: fizzOpacity, scale: fizzScale }} className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div 
                key={i}
                initial={{ y: 0, x: 0, opacity: 0 }}
                animate={{ 
                  y: -Math.random() * 200 - 50, 
                  x: (Math.random() - 0.5) * 200, 
                  opacity: [0, 1, 0] 
                }}
                transition={{ duration: 1.5 + Math.random(), repeat: Infinity, delay: Math.random() }}
                className="absolute top-1/2 left-1/2 w-3 h-3 bg-blue-500 rounded-full blur-[1px]"
              />
            ))}
          </motion.div>
        </motion.div>

        {/* 40 Tools Grid revealing */}
        <motion.div 
          style={{ opacity: gridOpacity, y: gridY }}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center pt-32 px-6 max-w-7xl mx-auto"
        >
          <div className="text-center mb-8 bg-white/80 backdrop-blur px-8 py-4 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">40+ Premium Tools Inside</h3>
            <p className="text-slate-500">Everything you need to excel, perfectly aligned.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 w-full max-w-5xl max-h-[60vh] overflow-y-auto pr-2 pb-20 custom-scrollbar">
            {TOOLS.map((tool, i) => (
              <div 
                key={i}
                className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-center text-center text-sm font-semibold text-slate-700 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer hover:-translate-y-1"
              >
                {tool}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
