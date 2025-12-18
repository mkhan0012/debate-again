import Link from 'next/link'
import { Sword, Zap, ShieldAlert, Users, BrainCircuit, Activity, ArrowRight, Scale, CheckCircle2, XCircle, MessageSquare } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#030303] text-zinc-300 font-sans selection:bg-cyan-500/30 overflow-x-hidden -mt-16">
      
      {/* --- ANIMATIONS --- */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        .animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-500 { animation-delay: 500ms; }
      `}</style>

      {/* --- BACKGROUND AMBIENCE --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-cyan-900/10 rounded-full mix-blend-screen blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-900/10 rounded-full mix-blend-screen blur-[100px]" />
      </div>

      <main className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto">
        
        {/* 1. HERO: THE MISSION */}
        <div className="text-center mb-32 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 backdrop-blur-md mb-8">
            <Scale className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">The Manifesto</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tight leading-none">
            Fixing the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">Public Square.</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed font-light">
            Online discourse is broken. It's dominated by echo chambers, ad hominem attacks, and endless shouting. 
            <span className="text-white font-medium block mt-2">Arguely creates a structured arena where logic wins, not volume.</span>
          </p>
        </div>

        {/* 2. THE PROBLEM VS SOLUTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-40 animate-slide-up delay-100">
            <div className="p-8 rounded-3xl bg-red-950/10 border border-red-900/30">
                <div className="flex items-center gap-3 mb-6">
                    <XCircle className="w-6 h-6 text-red-500" />
                    <h3 className="text-2xl font-bold text-white">Social Media Today</h3>
                </div>
                <ul className="space-y-4 text-zinc-400">
                    <li className="flex gap-3">
                        <span className="text-red-500/50">•</span> Infinite, unstructured comment threads.
                    </li>
                    <li className="flex gap-3">
                        <span className="text-red-500/50">•</span> Facts are ignored; emotional outrage is rewarded.
                    </li>
                    <li className="flex gap-3">
                        <span className="text-red-500/50">•</span> No winner, no conclusion, just noise.
                    </li>
                </ul>
            </div>

            <div className="p-8 rounded-3xl bg-green-950/10 border border-green-900/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-cyan-500"></div>
                <div className="flex items-center gap-3 mb-6">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                    <h3 className="text-2xl font-bold text-white">The Arguely Way</h3>
                </div>
                <ul className="space-y-4 text-zinc-300">
                    <li className="flex gap-3">
                        <span className="text-green-500">•</span> <strong>Turn-based</strong> rounds (Opening, Rebuttal, Closing).
                    </li>
                    <li className="flex gap-3">
                        <span className="text-green-500">•</span> <strong>AI Referee</strong> flags logical fallacies in real-time.
                    </li>
                    <li className="flex gap-3">
                        <span className="text-green-500">•</span> <strong>Clear Verdict</strong> based on scoring metrics.
                    </li>
                </ul>
            </div>
        </div>

        {/* 3. HOW IT WORKS (Timeline) */}
        <div className="mb-40 animate-slide-up delay-200">
            <h2 className="text-4xl font-bold text-white text-center mb-16">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-zinc-800 via-cyan-900 to-zinc-800 -z-10"></div>

                {[
                    { title: "1. Initiate", icon: MessageSquare, desc: "Choose a controversial topic and pick your side (For or Against)." },
                    { title: "2. Match", icon: Users, desc: "Enter the Lobby to find a human rival, or challenge the AI Engine instantly." },
                    { title: "3. Debate", icon: Sword, desc: "Exchange arguments in timed rounds. The AI Moderator watches for lies." },
                    { title: "4. Verdict", icon: Scale, desc: "The Supreme Judge analyzes the transcript and declares a winner." },
                ].map((step, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative group hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-12 h-12 bg-black border border-zinc-700 rounded-xl flex items-center justify-center mb-4 group-hover:border-cyan-500 transition-colors z-10 relative">
                            <step.icon className="w-6 h-6 text-zinc-400 group-hover:text-cyan-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                        <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* 4. GAME MODES (The Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
          
          {/* LEFT: PvP */}
          <div className="group relative bg-zinc-900/40 border border-zinc-800 p-10 rounded-[2rem] hover:bg-zinc-900/80 hover:border-cyan-500/30 transition-all duration-500 animate-slide-up delay-300 overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
              <Users className="w-64 h-64" />
            </div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-cyan-950/30 rounded-2xl flex items-center justify-center mb-8 border border-cyan-500/20 group-hover:scale-110 transition-transform shadow-[0_0_30px_-10px_rgba(6,182,212,0.3)]">
                <Sword className="w-8 h-8 text-cyan-400" />
              </div>
              <h2 className="text-3xl font-black text-white mb-4">PvP Arena</h2>
              <div className="h-1 w-12 bg-cyan-500 mb-6 rounded-full"></div>
              <p className="text-zinc-400 leading-relaxed mb-8 text-lg">
                The ultimate test of wit. Enter the Lobby, find a live opponent, and engage in a synchronous duel. 
              </p>
              
              <div className="bg-black/40 rounded-xl p-5 border border-zinc-800/50 backdrop-blur-sm">
                 <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-yellow-500" /> Unique Feature: AI Referee
                 </h4>
                 <p className="text-sm text-zinc-500">
                    In PvP mode, a silent AI Referee monitors the chat. If your opponent lies about a specific fact (e.g., stats, dates), 
                    the Referee interrupts with a <strong>"Yellow Card"</strong> correction instantly.
                 </p>
              </div>
            </div>
          </div>

          {/* RIGHT: AI */}
          <div className="group relative bg-zinc-900/40 border border-zinc-800 p-10 rounded-[2rem] hover:bg-zinc-900/80 hover:border-purple-500/30 transition-all duration-500 animate-slide-up delay-500 overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
              <BrainCircuit className="w-64 h-64" />
            </div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-purple-950/30 rounded-2xl flex items-center justify-center mb-8 border border-purple-500/20 group-hover:scale-110 transition-transform shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)]">
                <Zap className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-3xl font-black text-white mb-4">Solo vs AI</h2>
              <div className="h-1 w-12 bg-purple-500 mb-6 rounded-full"></div>
              <p className="text-zinc-400 leading-relaxed mb-8 text-lg">
                Training mode. Face off against our fine-tuned Large Language Model. It mimics a top-tier debater: logical, relentless, and unbiased.
              </p>

              <div className="bg-black/40 rounded-xl p-5 border border-zinc-800/50 backdrop-blur-sm">
                 <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-500" /> Why use this?
                 </h4>
                 <p className="text-sm text-zinc-500">
                    Perfect for preparing for real life arguments. Test your viewpoints against a machine that has read the entire internet. 
                    It forces you to sharpen your logic before you face a human.
                 </p>
              </div>
            </div>
          </div>

        </div>

        {/* 5. CTA */}
        <div className="relative text-center mt-20 py-20 border-t border-zinc-900 animate-slide-up delay-500">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/20 to-transparent pointer-events-none"></div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">Ready to enter the arena?</h2>
          <Link href="/create">
            <button className="group relative px-12 py-6 bg-white text-black font-black text-xl rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_50px_-15px_rgba(255,255,255,0.5)]">
              <span className="relative z-10 flex items-center gap-3">
                Start a Debate <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </Link>
          <p className="mt-6 text-zinc-500">No account required to browse. Login to fight.</p>
        </div>

      </main>
    </div>
  )
}