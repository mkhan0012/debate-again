'use client'

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Trophy, Skull, Clock, Sword, Users, ArrowRight, Lock, Zap, TrendingUp, Activity } from 'lucide-react';

interface HistoryInterfaceProps {
  aiRounds: any[];
  humanRounds: any[];
}

export function HistoryInterface({ aiRounds, humanRounds }: HistoryInterfaceProps) {
  const [activeTab, setActiveTab] = useState<'AI' | 'PVP'>('AI');

  // --- CALCULATE STATS DYNAMICALLY ---
  const stats = useMemo(() => {
    const rounds = activeTab === 'AI' ? aiRounds : humanRounds;
    let wins = 0;
    let losses = 0;
    let draws = 0;

    rounds.forEach(r => {
      if (r.status === 'COMPLETED' && r.scorecard) {
        if (r.scorecard.winner === 'User') wins++;
        else if (r.scorecard.winner === 'AI') losses++;
        else draws++;
      }
    });

    const total = wins + losses + draws || 1; // Avoid divide by zero
    const winRate = Math.round((wins / total) * 100);

    return { wins, losses, draws, winRate, totalMatches: rounds.length };
  }, [activeTab, aiRounds, humanRounds]);

  return (
    <div className="space-y-10">
      
      {/* --- 1. GLASS SWITCHER --- */}
      <div className="flex flex-col items-center gap-6">
        <div className="p-1.5 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl flex relative shadow-2xl ring-1 ring-white/5">
          {/* Animated Background Pill */}
          <div 
            className={`absolute top-1.5 bottom-1.5 rounded-xl bg-zinc-800 shadow-inner transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
            ${activeTab === 'AI' ? 'left-1.5 w-[160px]' : 'left-[174px] w-[160px]'}`} 
          />
          
          <button
            onClick={() => setActiveTab('AI')}
            className={`relative z-10 w-[160px] py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all duration-300
            ${activeTab === 'AI' ? 'text-white shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)]' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Zap className={`w-6 h-4 ${activeTab === 'AI' ? 'text-purple-400 fill-purple-400/20' : ''}`} />
            AI Rivals
          </button>
          
          <button
            onClick={() => setActiveTab('PVP')}
            className={`relative z-10 w-[160px] py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all duration-300
            ${activeTab === 'PVP' ? 'text-white shadow-[0_0_20px_-5px_rgba(6,182,212,0.1)]' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Users className={`w-6 h-4 ${activeTab === 'PVP' ? 'text-cyan-400 fill-cyan-400/20' : ''}`} />
            PvP Arena
          </button>
        </div>
      </div>

      {/* --- 2. STATS DASHBOARD (Only for AI tab for now) --- */}
      {activeTab === 'AI' && aiRounds.length > 0 && (
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up">
            <StatBox label="Total Battles" value={stats.totalMatches} icon={<Sword className="w-4 h-4 text-zinc-400" />} />
            <StatBox label="Win Rate" value={`${stats.winRate}%`} icon={<TrendingUp className="w-4 h-4 text-green-400" />} color="text-green-400" />
            <StatBox label="Victories" value={stats.wins} icon={<Trophy className="w-4 h-4 text-yellow-500" />} />
            <StatBox label="Defeats" value={stats.losses} icon={<Skull className="w-4 h-4 text-red-500" />} />
         </div>
      )}

      {/* --- 3. MAIN CONTENT AREA --- */}
      <div className="min-h-[400px]">
        {activeTab === 'AI' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in-up">
            {aiRounds.length > 0 ? (
              aiRounds.map((round, idx) => (
                 <div key={round.id} style={{ animationDelay: `${idx * 50}ms` }} className="animate-fade-in-up">
                    <HistoryCard round={round} />
                 </div>
              ))
            ) : (
              <EmptyState 
                title="Your Legacy Begins Here" 
                desc="The archives are empty. Challenge the AI to your first debate to start building your reputation." 
                cta="Start First Debate"
              />
            )}
          </div>
        ) : (
          // --- PVP LOCKED VIEW ---
          <div className="animate-fade-in-up">
            <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-[#080808] p-12 text-center group transition-all hover:border-zinc-700">
               {/* Cyber Grid Background */}
               <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[24px_24px]"></div>
               <div className="absolute inset-0 bg-radial-gradient(circle_at_center,transparent_0%,#080808_100%)"></div>
               
               <div className="relative z-10 flex flex-col items-center justify-center py-10">
                  <div className="w-24 h-24 bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-700 flex items-center justify-center mb-8 shadow-2xl relative rotate-3 group-hover:rotate-0 transition-transform duration-500">
                     <Users className="w-10 h-10 text-zinc-500" />
                     <div className="absolute -top-3 -right-3 bg-cyan-900/80 border border-cyan-500/30 p-2 rounded-xl shadow-lg backdrop-blur-sm">
                        <Lock className="w-4 h-4 text-cyan-400" />
                     </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3">Multiplayer League</h3>
                  <p className="text-zinc-400 max-w-md mx-auto leading-relaxed mb-8">
                    The global matchmaking engine is coming soon. Prepare to debate real opponents and climb the global leaderboard.
                  </p>
                  
                  <div className="flex gap-3">
                     <span className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-500">
                       EST. Q4 2025
                     </span>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatBox({ label, value, icon, color = "text-white" }: { label: string, value: string | number, icon: any, color?: string }) {
   return (
      <div className="bg-zinc-900/30 border border-white/5 p-4 rounded-xl backdrop-blur-sm hover:bg-zinc-900/50 transition-colors">
         <div className="flex items-center gap-2 mb-2 opacity-70">
            {icon}
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</span>
         </div>
         <div className={`text-2xl font-black ${color} tracking-tight`}>{value}</div>
      </div>
   )
}

function HistoryCard({ round }: { round: any }) {
  let status = "ONGOING";
  let winner = null;
  let summary = "Debate in progress...";

  if (round.status === "COMPLETED" && round.scorecard) {
    const sc = round.scorecard as any; 
    winner = sc.winner;
    summary = sc.closing_statement || "Debate concluded.";
    
    if (winner === "User") status = "VICTORY";
    else if (winner === "AI") status = "DEFEAT";
    else status = "DRAW";
  }

  const isVictory = status === "VICTORY";
  const isDefeat = status === "DEFEAT";

  return (
    <Link href={`/debate/${round.id}`} className="block group h-full">
      <div className={`relative h-full bg-[#0A0A0A] border rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl group-hover:shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden
        ${isVictory ? 'border-zinc-800 hover:border-green-500/30' : 
          isDefeat ? 'border-zinc-800 hover:border-red-500/30' : 
          'border-zinc-800 hover:border-purple-500/30'}`}>
        
        {/* Glow Effect on Hover */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500
           ${isVictory ? 'bg-green-500' : isDefeat ? 'bg-red-500' : 'bg-purple-500'}`}></div>

        {/* Header */}
        <div className="relative flex justify-between items-start mb-5">
           {/* Status Chip */}
          <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm
            ${isVictory ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_-3px_rgba(74,222,128,0.2)]' :
              isDefeat ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_-3px_rgba(248,113,113,0.2)]' :
              'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
            {status}
          </div>
          <span className="text-zinc-600 text-xs font-mono bg-zinc-900/50 px-2 py-1 rounded">
            {new Date(round.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Content */}
        <div className="relative min-h-[80px]">
           <h3 className="text-lg font-bold text-zinc-200 mb-3 line-clamp-2 leading-snug group-hover:text-white transition-colors">
             {round.topic}
           </h3>
           <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">
             {summary}
           </p>
        </div>

        {/* Footer */}
        <div className="relative flex items-center pt-5 border-t border-white/5 mt-4">
          <div className="flex items-center gap-2 text-zinc-500 text-xs">
             <div className={`w-1.5 h-1.5 rounded-full ${round.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-zinc-700'}`}></div>
             {round.status === 'ACTIVE' ? "Live Session" : "Completed"}
          </div>
          
          <div className="ml-auto flex items-center gap-2 text-xs font-bold text-zinc-400 group-hover:text-white transition-colors">
            <span>View Analysis</span>
            <div className={`p-1 rounded-full transition-transform duration-300 group-hover:translate-x-1
               ${isVictory ? 'bg-green-500/10 text-green-400' : isDefeat ? 'bg-red-500/10 text-red-400' : 'bg-zinc-800'}`}>
               <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ title, desc, cta }: { title: string, desc: string, cta: string }) {
  return (
    <div className="col-span-full py-20 text-center border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20 flex flex-col items-center">
      <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800 shadow-xl">
         <Sword className="w-8 h-8 text-zinc-600" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-zinc-500 text-sm mb-8 max-w-sm mx-auto leading-relaxed">{desc}</p>
      <Link href="/create" className="group relative inline-flex items-center gap-2 px-8 py-3 bg-white text-black text-sm font-bold rounded-full overflow-hidden hover:scale-105 transition-transform duration-200">
         <span className="relative z-10 flex items-center gap-2">
            {cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
         </span>
      </Link>
    </div>
  );
}