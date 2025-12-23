"use client";

import React, { useRef, useState, useCallback } from "react";
import { toPng } from "html-to-image";

interface DebateWrappedCardProps {
  topic: string;
  winner: string;
  summary: string;
  timeWasted?: string; // e.g. "14m 20s"
  totalTurns?: number;
  date?: string;
}

export default function DebateWrappedCard({ 
  topic, 
  winner, 
  summary,
  timeWasted = "12m 30s",
  totalTurns = 8,
  date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}: DebateWrappedCardProps) {
  
  const ref = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Helper to determine the "Vibe" emoji based on the summary text
  const getVibeEmoji = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes("logic") || t.includes("fact")) return "🧠"; // Brain
    if (t.includes("aggressive") || t.includes("attack")) return "🔪"; // Knife
    if (t.includes("funny") || t.includes("joke")) return "💀"; // Skull
    return "⚖️"; // Scales
  };

  const handleDownload = useCallback(() => {
    if (ref.current === null) return;
    setIsCapturing(true);
    
    setTimeout(() => {
        toPng(ref.current!, { cacheBust: true, pixelRatio: 3 })
          .then((dataUrl) => {
            const link = document.createElement("a");
            link.download = `arguely-dossier-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
            setIsCapturing(false);
          })
          .catch((err) => {
            console.error(err);
            setIsCapturing(false);
          });
    }, 100);
  }, [ref]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto p-4">
      
      {/* --- THE CARD --- */}
      <div 
        ref={ref} 
        className="relative w-full aspect-[3/4] bg-[#050505] text-zinc-100 flex flex-col p-8 border border-zinc-800 shadow-2xl"
      >
        {/* Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }}></div>

        {/* 1. Header */}
        <div className="flex justify-between items-end border-b border-zinc-800 pb-4 mb-6 relative z-10">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="font-mono text-[10px] text-red-500 uppercase tracking-widest">Case Closed</span>
                </div>
                <h2 className="font-serif italic text-zinc-500 text-sm">{date}</h2>
            </div>
            <div className="text-right">
                <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest block">File No.</span>
                <span className="font-mono text-xs text-zinc-400">#ARG-{Math.floor(Math.random() * 9999)}</span>
            </div>
        </div>

        {/* 2. Main Content */}
        <div className="flex-1 flex flex-col relative z-10">
            
            {/* Topic */}
            <div className="mb-8">
                <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest mb-2">Subject</p>
                <h1 className="text-2xl md:text-3xl font-light leading-snug text-white/90 font-serif">
                    "{topic}"
                </h1>
            </div>

            {/* Winner */}
            <div className="mb-8">
                <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest mb-2">Victor</p>
                <div className="flex items-center gap-3">
                    <span className="text-2xl filter grayscale opacity-80">👑</span>
                    <div className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white">
                        {winner}
                    </div>
                </div>
            </div>

            {/* Strategy / Summary */}
            <div className="mb-auto">
                <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest mb-2">Winning Strategy</p>
                <div className="pl-3 border-l-2 border-zinc-800 text-zinc-400 text-xs md:text-sm leading-relaxed italic">
                    {summary}
                </div>
            </div>

            {/* 3. The Data Grid (Details) */}
            <div className="mt-8 grid grid-cols-3 gap-px bg-zinc-800 border border-zinc-800 rounded-sm overflow-hidden">
                
                {/* Time Wasted */}
                <div className="bg-[#090909] p-3 flex flex-col items-center justify-center text-center">
                    <span className="text-lg mb-1 filter grayscale contrast-125">⏳</span>
                    <span className="text-[10px] text-zinc-500 font-mono uppercase">Time Wasted</span>
                    <span className="text-sm font-bold text-white mt-1">{timeWasted}</span>
                </div>

                {/* Turn Count */}
                <div className="bg-[#090909] p-3 flex flex-col items-center justify-center text-center">
                    <span className="text-lg mb-1 filter grayscale contrast-125">💬</span>
                    <span className="text-[10px] text-zinc-500 font-mono uppercase">Exchanges</span>
                    <span className="text-sm font-bold text-white mt-1">{totalTurns} Turns</span>
                </div>

                {/* Vibe Check */}
                <div className="bg-[#090909] p-3 flex flex-col items-center justify-center text-center">
                    <span className="text-lg mb-1">{getVibeEmoji(summary)}</span>
                    <span className="text-[10px] text-zinc-500 font-mono uppercase">Vibe</span>
                    <span className="text-sm font-bold text-white mt-1">Calculated</span>
                </div>
            </div>

        </div>

        {/* 4. Footer */}
        <div className="mt-6 pt-4 border-t border-zinc-900 flex justify-between items-center relative z-10">
            <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-[0.2em]">Arguely.gg</p>
            <div className="flex gap-1 opacity-50">
                 {/* Barcode-ish lines */}
                {[...Array(8)].map((_, i) => (
                    <div key={i} className={`w-0.5 h-3 bg-zinc-600 ${i % 2 === 0 ? 'h-2' : 'h-4'}`}></div>
                ))}
            </div>
        </div>

      </div>

      {/* --- BUTTON --- */}
      <button
        onClick={handleDownload}
        disabled={isCapturing}
        className="text-xs font-mono uppercase tracking-widest text-zinc-500 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1"
      >
        {isCapturing ? "Exporting Data..." : "Download Dossier"}
      </button>
    </div>
  );
}