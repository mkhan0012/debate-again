"use client";

import { useState } from "react";
import { createDebate } from "@/app/actions/debate"; 

// Icons
const MagicIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export default function StartDebatePage() {
  const [topic, setTopic] = useState("");
  const [position, setPosition] = useState<"For" | "Against">("For");
  const [mode, setMode] = useState<"GENERAL" | "POLITICS_INDIA">("GENERAL"); // <--- NEW STATE
  const [timeLimit, setTimeLimit] = useState("5m");
  const [isInitializing, setIsInitializing] = useState(false);
  
  const MAX_CHARS = 140;

  const suggestedTopics = [
    "UBI is necessary for the AI era",
    "Social media bans for under-16s",
    "Nuclear energy is the only green solution",
    "Remote work harms innovation",
  ];

  const handleStart = async () => {
    if (!topic.trim()) return;
    
    setIsInitializing(true);
    
    // --- UPDATED: PASS 'mode' TO SERVER ACTION ---
    const result = await createDebate(topic, position, mode);
    
    if (result?.error) {
      alert(result.error); 
      setIsInitializing(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 relative overflow-hidden bg-linear-to-b from-background to-black">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start z-10">
        
        {/* Main Form Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                Initiate Protocol
                <span className="px-2 py-1 rounded text-[10px] font-mono bg-accent/10 text-accent border border-accent/20 uppercase tracking-widest">Beta v1.0</span>
              </h1>
              <p className="text-zinc-400 mt-2">
                Define parameters. Logic is your only weapon.
              </p>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              124 Active Chambers
            </div>
          </div>

          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-accent/50 to-transparent opacity-50" />

            <div className="space-y-8">
              
              {/* 01: Topic Input */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label htmlFor="topic" className="text-xs font-mono text-accent uppercase tracking-widest flex items-center gap-2">
                    01 // Define Topic
                  </label>
                  <span className={`text-xs font-mono ${topic.length > MAX_CHARS ? 'text-red-400' : 'text-zinc-600'}`}>
                    {topic.length}/{MAX_CHARS}
                  </span>
                </div>
                
                <div className="relative group">
                  <textarea
                    id="topic"
                    rows={3}
                    maxLength={MAX_CHARS}
                    placeholder="e.g., Artificial General Intelligence poses an existential threat to humanity..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-black/40 border border-zinc-800 rounded-xl p-4 text-white text-lg placeholder-zinc-700 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all resize-none shadow-inner"
                  />
                  <button className="absolute bottom-3 right-3 text-zinc-500 hover:text-accent transition-colors p-1" title="Generate Topic with AI">
                    <MagicIcon />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* 02: Position Selection */}
                <div className="space-y-3">
                  <label className="text-xs font-mono text-accent uppercase tracking-widest">
                    02 // Select Stance
                  </label>
                  <div className="grid grid-cols-2 gap-3 h-12">
                    <button
                      onClick={() => setPosition("For")}
                      className={`relative rounded-lg text-sm font-bold tracking-wide uppercase transition-all duration-200 border ${
                        position === "For"
                          ? "bg-accent/10 border-accent text-accent shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                          : "bg-zinc-900/50 border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400"
                      }`}
                    >
                      FOR
                    </button>
                    <button
                      onClick={() => setPosition("Against")}
                      className={`relative rounded-lg text-sm font-bold tracking-wide uppercase transition-all duration-200 border ${
                        position === "Against"
                          ? "bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                          : "bg-zinc-900/50 border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400"
                      }`}
                    >
                      AGAINST
                    </button>
                  </div>
                </div>

                {/* 03: Mode Selection (NEW FEATURE) */}
                <div className="space-y-3">
                  <label className="text-xs font-mono text-accent uppercase tracking-widest">
                    03 // Protocol Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3 h-12">
                    <button
                      onClick={() => setMode("GENERAL")}
                      className={`rounded-lg text-xs font-bold tracking-wide uppercase transition-all duration-200 border flex flex-col items-center justify-center leading-tight ${
                        mode === "GENERAL"
                          ? "bg-white text-black border-white"
                          : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      General
                    </button>
                    <button
                      onClick={() => setMode("POLITICS_INDIA")}
                      className={`rounded-lg text-xs font-bold tracking-wide uppercase transition-all duration-200 border flex flex-col items-center justify-center leading-tight ${
                        mode === "POLITICS_INDIA"
                          ? "bg-orange-500/20 text-orange-400 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                          : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <span>🇮🇳 Indian</span>
                      <span>Politics</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 04: Time Controls (Bumped down) */}
              <div className="space-y-3">
                  <label className="text-xs font-mono text-accent uppercase tracking-widest flex items-center gap-2">
                    04 // Time Control <ClockIcon />
                  </label>
                  <div className="grid grid-cols-3 gap-2 h-12">
                    {['3m', '5m', '10m'].map((time) => (
                      <button
                        key={time}
                        onClick={() => setTimeLimit(time)}
                        className={`rounded-lg text-sm font-medium border transition-all duration-200 ${
                          timeLimit === time
                            ? "bg-zinc-800 text-white border-zinc-600"
                            : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

              {/* Action Button */}
              <div className="pt-4">
                <button
                  onClick={handleStart}
                  disabled={!topic.trim() || isInitializing}
                  className={`group relative w-full h-14 rounded-lg font-bold text-sm tracking-widest uppercase overflow-hidden transition-all duration-300 ${
                    !topic.trim() || isInitializing
                      ? "bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800"
                      : "bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                  }`}
                >
                  <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  <span className="relative flex items-center justify-center gap-3">
                    {isInitializing ? (
                      <>
                        <span className="w-2 h-2 bg-black rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-black rounded-full animate-bounce delay-100" />
                        <span className="w-2 h-2 bg-black rounded-full animate-bounce delay-200" />
                      </>
                    ) : (
                      "Enter Debate Chamber"
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Context */}
        <div className="lg:col-span-4 space-y-6 lg:pt-20">
          <div className="glass-panel p-6 rounded-xl border border-white/5 bg-zinc-900/20">
            <h3 className="text-xs font-mono text-zinc-500 mb-4 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Trending Analysis
            </h3>
            <div className="flex flex-col gap-2">
              {suggestedTopics.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setTopic(t)}
                  className="text-sm text-left text-zinc-400 hover:text-white hover:bg-white/5 p-2 rounded transition-colors duration-200 flex items-start gap-2"
                >
                  <span className="text-zinc-600 mt-0.5">0{i + 1}</span>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-xl border border-zinc-800 bg-black/20">
            <div className="flex items-center gap-3 mb-3 text-zinc-300">
              <UsersIcon />
              <span className="text-sm font-semibold">Community Guidelines</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Arguely uses an <span className="text-zinc-300">AI Moderator</span> to flag ad hominem attacks and logical fallacies in real-time. Keep your arguments evidence-based.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}