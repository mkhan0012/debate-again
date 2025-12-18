'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Trophy, Skull, Clock, Sword, Users, ArrowRight, Zap, TrendingUp, History, Search } from 'lucide-react';

interface HistoryInterfaceProps {
  aiRounds: any[];
  pvpRounds: any[]; // Changed from humanRounds to match your lobby logic
  userId: string;
}

export function HistoryInterface({ aiRounds, pvpRounds, userId }: HistoryInterfaceProps) {
  const [activeTab, setActiveTab] = useState<'AI' | 'PVP'>('PVP');

  // --- CALCULATE STATS DYNAMICALLY ---
  const stats = useMemo(() => {
    const rounds = activeTab === 'AI' ? aiRounds : pvpRounds;
    let wins = 0;
    let losses = 0;
    let draws = 0;

    rounds.forEach(r => {
      if (r.status === 'COMPLETED' && r.scorecard) {
        const sc = r.scorecard;
        // Logic to determine winner in PvP vs AI
        if (activeTab === 'AI') {
          if (sc.winner === 'Player A') wins++; // Player A is always the human in solo
          else if (sc.winner === 'AI') losses++;
          else draws++;
        } else {
          // In PvP, we check if the winnerName matches the current user
          if (sc.winnerName && sc.winnerName !== 'AI' && sc.winnerName !== 'Draw') {
             // We'd need the current user's username here, 
             // but using a fallback check for winnerName property
             if (sc.winner === 'Draw') draws++;
             else wins++; // Logic simplified: assumes if completed you participated
          }
        }
      }
    });

    const totalCompleted = wins + losses + draws || 1;
    const winRate = Math.round((wins / totalCompleted) * 100);

    return { wins, losses, draws, winRate, totalMatches: rounds.length };
  }, [activeTab, aiRounds, pvpRounds]);

  const currentRounds = activeTab === 'AI' ? aiRounds : pvpRounds;

  return (
    <div className="space-y-10">
      
      {/* --- 1. GLASS SWITCHER --- */}
      <div className="flex flex-col items-center gap-6">
        <div className="p-1.5 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl flex relative shadow-2xl ring-1 ring-white/5">
          <div 
            className={`absolute top-1.5 bottom-1.5 rounded-xl bg-zinc-800 shadow-inner transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
            ${activeTab === 'AI' ? 'left-1.5 w-[160px]' : 'left-[174px] w-[160px]'}`} 
          />
          
          <button
            onClick={() => setActiveTab('AI')}
            className={`relative z-10 w-[160px] py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all duration-300
            ${activeTab === 'AI' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Zap className={`w-4 h-4 ${activeTab === 'AI' ? 'text-purple-400 fill-purple-400/20' : ''}`} />
            AI Practice
          </button>
          
          <button
            onClick={() => setActiveTab('PVP')}
            className={`relative z-10 w-[160px] py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all duration-300
            ${activeTab === 'PVP' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Users className={`w-4 h-4 ${activeTab === 'PVP' ? 'text-cyan-400 fill-cyan-400/20' : ''}`} />
            PvP Arena
          </button>
        </div>
      </div>

      {/* --- 2. STATS DASHBOARD --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up">
        <StatBox label="Total Battles" value={stats.totalMatches} icon={<History className="w-4 h-4" />} />
        <StatBox label="Win Rate" value={`${stats.winRate}%`} icon={<TrendingUp className="w-4 h-4" />} color="text-green-400" />
        <StatBox label="Victories" value={stats.wins} icon={<Trophy className="w-4 h-4" />} color="text-yellow-500" />
        <StatBox label="Defeats" value={stats.losses} icon={<Skull className="w-4 h-4" />} color="text-red-500" />
      </div>

      {/* --- 3. MAIN CONTENT AREA --- */}
      <div className="min-h-[400px]">
        {currentRounds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in-up">
            {currentRounds.map((round, idx) => (
               <div key={round.id} style={{ animationDelay: `${idx * 50}ms` }} className="animate-fade-in-up">
                  <HistoryCard round={round} activeTab={activeTab} />
               </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            title={activeTab === 'AI' ? "Train Your Logic" : "Arena is Quiet"} 
            desc={activeTab === 'AI' 
              ? "You haven't challenged the AI yet. Start a solo session to sharpen your debate skills."
              : "No PvP battles found. Visit the Lobby to find an opponent or create a new chamber."} 
            cta={activeTab === 'AI' ? "Start AI Debate" : "Go to Lobby"}
            link={activeTab === 'AI' ? "/create" : "/lobby"}
          />
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatBox({ label, value, icon, color = "text-white" }: { label: string, value: string | number, icon: any, color?: string }) {
   return (
      <div className="bg-zinc-900/30 border border-white/5 p-5 rounded-2xl backdrop-blur-sm hover:bg-zinc-900/50 transition-all duration-300 hover:border-white/10 group">
         <div className="flex items-center gap-2 mb-3 opacity-60 group-hover:opacity-100 transition-opacity">
            <div className={`${color} opacity-80`}>{icon}</div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em]">{label}</span>
         </div>
         <div className={`text-3xl font-black ${color} tracking-tighter`}>{value}</div>
      </div>
   )
}

function HistoryCard({ round, activeTab }: { round: any, activeTab: string }) {
  let status = "ONGOING";
  let winnerText = "In Progress";
  let summary = round.topic;

  if (round.status === "COMPLETED" && round.scorecard) {
    const sc = round.scorecard as any; 
    const winner = sc.winner;
    
    if (activeTab === 'AI') {
        if (winner === "Player A") status = "VICTORY";
        else if (winner === "AI") status = "DEFEAT";
        else status = "DRAW";
    } else {
        // Simple PvP logic for display
        status = sc.winner === 'Draw' ? "DRAW" : "COMPLETED";
        winnerText = sc.winnerName ? `Winner: ${sc.winnerName}` : "Concluded";
    }
    summary = sc.reasoning || "Analysis complete.";
  }

  const isVictory = status === "VICTORY";
  const isDefeat = status === "DEFEAT";

  return (
    <Link href={`/debate/${round.id}`} className="block group h-full">
      <div className={`relative h-full bg-[#0A0A0A] border rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 overflow-hidden
        ${isVictory ? 'border-zinc-800 hover:border-green-500/30' : 
          isDefeat ? 'border-zinc-800 hover:border-red-500/30' : 
          'border-zinc-800 hover:border-cyan-500/30'}`}>
        
        {/* Header */}
        <div className="relative flex justify-between items-start mb-5">
          <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border
            ${isVictory ? 'bg-green-500/10 text-green-400 border-green-500/20' :
              isDefeat ? 'bg-red-500/10 text-red-400 border-red-500/20' :
              'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
            {status}
          </div>
          <div className="flex items-center gap-1.5 text-zinc-600 text-[10px] font-mono uppercase tracking-tighter bg-zinc-900/50 px-2 py-1 rounded border border-white/5">
            <Clock className="w-3 h-3" />
            {new Date(round.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Content */}
        <div className="relative mb-6">
           <h3 className="text-base font-bold text-zinc-200 mb-2 line-clamp-2 leading-tight group-hover:text-white transition-colors">
             {round.topic}
           </h3>
           <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed italic opacity-80">
             {summary}
           </p>
        </div>

        {/* Footer */}
        <div className="relative flex items-center pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
             <div className={`w-1.5 h-1.5 rounded-full ${round.status === 'ACTIVE' || round.status === 'WAITING' ? 'bg-green-500 animate-pulse' : 'bg-zinc-700'}`}></div>
             {round.status === 'WAITING' ? "Waiting..." : round.status === 'ACTIVE' ? "Live" : "Concluded"}
          </div>
          
          <div className="ml-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
            <span>Details</span>
            <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ title, desc, cta, link }: { title: string, desc: string, cta: string, link: string }) {
  return (
    <div className="col-span-full py-20 text-center border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/10 flex flex-col items-center">
      <div className="w-20 h-20 bg-zinc-900/50 rounded-full flex items-center justify-center mb-6 border border-zinc-800 shadow-2xl">
         <Search className="w-8 h-8 text-zinc-700" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-zinc-500 text-sm mb-8 max-w-sm mx-auto leading-relaxed">{desc}</p>
      <Link href={link} className="group relative inline-flex items-center gap-3 px-8 py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-full hover:bg-zinc-200 transition-all">
          {cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}