import { Trophy, Target, Zap, Swords, FileText, BrainCircuit } from 'lucide-react'

export function DebateScorecard({ data }: { data: any }) {
  if (!data) return null;

  // Calculate percentages for the visual bar
  const scoreA = data.scores?.playerA || 0;
  const scoreB = data.scores?.playerB || 0;
  const totalScore = scoreA + scoreB;
  const percentA = totalScore === 0 ? 50 : Math.round((scoreA / totalScore) * 100);
  const percentB = 100 - percentA;

  return (
    <div className="max-w-4xl mx-auto my-12 animate-fade-in-up px-4 font-sans">
      
      {/* --- 1. WINNER HERO SECTION --- */}
      <div className="relative group overflow-hidden rounded-[2rem] border border-yellow-500/30 bg-[#0A0A0A] mb-8">
        
        {/* Animated Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/40 via-black to-black opacity-80 pointer-events-none"></div>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center py-12 px-6 text-center">
          
          {/* Floating Trophy */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-yellow-500 blur-[60px] opacity-20 animate-pulse"></div>
            <div className="relative w-24 h-24 bg-gradient-to-b from-yellow-400/10 to-yellow-600/10 rounded-full border border-yellow-500/50 flex items-center justify-center shadow-[0_0_40px_-10px_rgba(234,179,8,0.4)]">
              <Trophy className="w-12 h-12 text-yellow-400 drop-shadow-lg" />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest">
              Champion
            </div>
          </div>

          <h2 className="text-sm font-bold text-yellow-500 tracking-[0.3em] uppercase mb-2">Victory Declared</h2>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl mb-6">
            {data.winnerName || data.winner}
          </h1>

          {/* Reasoning Quote */}
          <div className="max-w-2xl bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm relative">
            <FileText className="absolute top-4 left-4 w-4 h-4 text-zinc-600" />
            <p className="text-zinc-300 text-lg leading-relaxed italic">
              "{data.reasoning}"
            </p>
          </div>
        </div>
      </div>

      {/* --- 2. VS METER (Graphics) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Player A Score */}
        <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Swords className="w-24 h-24 text-cyan-500" />
          </div>
          <div className="relative z-10">
             <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Player A</div>
             <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white">{scoreA}</span>
                <span className="text-sm text-zinc-500 font-mono">/100</span>
             </div>
             {/* Progress Bar A */}
             <div className="w-full h-2 bg-zinc-800 rounded-full mt-4 overflow-hidden">
                <div style={{ width: `${scoreA}%` }} className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
             </div>
          </div>
        </div>

        {/* Player B Score */}
        <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BrainCircuit className="w-24 h-24 text-purple-500" />
          </div>
          <div className="relative z-10">
             <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Player B / AI</div>
             <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white">{scoreB}</span>
                <span className="text-sm text-zinc-500 font-mono">/100</span>
             </div>
             {/* Progress Bar B */}
             <div className="w-full h-2 bg-zinc-800 rounded-full mt-4 overflow-hidden">
                <div style={{ width: `${scoreB}%` }} className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
             </div>
          </div>
        </div>
      </div>

      {/* --- 3. POWER BALANCE BAR --- */}
      <div className="mb-10">
        <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-widest">
           <span>Flow of Logic</span>
           <span>{percentA}% vs {percentB}%</span>
        </div>
        <div className="h-4 w-full bg-zinc-800 rounded-full overflow-hidden flex">
           <div style={{ width: `${percentA}%` }} className="h-full bg-cyan-500/80"></div>
           <div className="w-1 h-full bg-black/50 backdrop-blur-sm z-10"></div>
           <div className="flex-1 bg-purple-500/80"></div>
        </div>
      </div>

      {/* --- 4. FEEDBACK GRID --- */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white tracking-wide">Judge's Analysis Log</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {data.feedback?.map((point: string, i: number) => (
            <div key={i} className="group flex gap-4 p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all">
              <div className="shrink-0">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 font-mono font-bold text-xs border border-zinc-700 group-hover:text-white group-hover:border-zinc-500 transition-colors">
                  0{i + 1}
                </div>
              </div>
              <div>
                <p className="text-zinc-300 leading-relaxed text-sm">
                  {point}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}