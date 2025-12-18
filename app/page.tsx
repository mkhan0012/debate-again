import Link from "next/link";
import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import LiveStats from "@/components/LiveStats";
import { Users, Sword } from "lucide-react"; // Import Icons

export const metadata: Metadata = {
  title: "Arguely | Rational Discourse",
  description: "A structured environment to elevate online disagreement into productive debate.",
};

export default async function Home() {
  const session = await getSession();
  const isLoggedIn = !!session?.userId;

  return (
    // FIX: Added '-mt-16' to pull this page up behind the fixed Navbar
    <div className="relative min-h-screen bg-[#030303] text-slate-300 font-sans selection:bg-cyan-500/30 overflow-x-hidden -mt-16">
      
      {/* --- INJECT CUSTOM ANIMATIONS --- */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes float-delayed {
          0% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.5; filter: blur(100px); }
          50% { opacity: 0.8; filter: blur(120px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shine {
          to { background-position: 200% center; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite; }
        .animate-glow-pulse { animation: glow 8s ease-in-out infinite; }
        .animate-slide-up { animation: slideUp 0.8s ease-out forwards; opacity: 0; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .text-shimmer {
          background-size: 200% auto;
          animation: shine 5s linear infinite;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        }
        .glass-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(6, 182, 212, 0.3);
          box-shadow: 0 0 30px rgba(6, 182, 212, 0.15);
          transform: translateY(-5px);
        }
      `}</style>

      {/* --- ANIMATED BACKGROUND ORBS --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full mix-blend-screen animate-glow-pulse animate-float" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full mix-blend-screen animate-glow-pulse animate-float-delayed" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[30%] left-[40%] w-[300px] h-[300px] bg-indigo-500/10 rounded-full mix-blend-screen blur-[80px] animate-pulse" />
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center text-center pt-32 px-4">
        
        {/* Live Stats */}
        <div className="animate-slide-up">
           <LiveStats />
        </div>

        {/* Main Title */}
        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 mt-10 animate-slide-up delay-100 drop-shadow-2xl">
          Welcome to <br className="md:hidden" />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-300 via-blue-500 to-indigo-500 text-shimmer">
            Arguely.
          </span>
        </h1>
        
        <p className="text-2xl md:text-3xl text-slate-300 font-light mb-8 max-w-3xl animate-slide-up delay-200">
          Rational discourse in a <span className="text-red-400/80 font-normal italic">chaotic</span> world.
        </p>
        
        <p className="max-w-2xl text-slate-500 mb-12 text-lg leading-relaxed animate-slide-up delay-300">
          Choose your arena: Challenge our advanced AI Logic Engine or invite a friend for a 
          <span className="text-cyan-400 font-medium ml-1">Live PvP Duel with AI Fact-Checking.</span>
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-5 animate-slide-up" style={{ animationDelay: '400ms' }}>
          
          {/* PRIMARY: CREATE */}
          <Link 
            href={isLoggedIn ? "/create" : "/login"}
            className="group relative px-8 py-4 bg-cyan-600 text-white font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(8,145,178,0.5)]"
          >
            <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1s_ease-in-out]" />
            <span className="relative z-10 flex items-center gap-2">
              <Sword className="w-4 h-4" />
              {isLoggedIn ? 'Create Arena' : 'Join the Argument'}
            </span>
          </Link>
          
          {/* SECONDARY: BROWSE LOBBY (If Logged In) OR ABOUT */}
          {isLoggedIn ? (
            <Link 
              href="/lobby" 
              className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white rounded-full transition-all hover:scale-105 backdrop-blur-sm flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Browse Lobby
            </Link>
          ) : (
            <Link 
              href="/about" 
              className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white rounded-full transition-all hover:scale-105 backdrop-blur-sm"
            >
              See How It Works
            </Link>
          )}
        </div>
      </main>

      {/* Community Consensus */}
      <section className="relative z-10 mt-48 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <h2 className="text-3xl font-bold text-white mb-3">Community Consensus</h2>
          <div className="h-1 w-20 bg-linear-to-r from-transparent via-cyan-500 to-transparent mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote: "The AI Referee is a game changer. My friend tried to use fake stats in our PvP duel, and the AI called him out instantly.",
              name: "Alex Rivera",
              role: "PvP Beta Tester",
              initials: "AR",
              color: "bg-cyan-500"
            },
            {
              quote: "Arguely is what social media should have been. I didn't change my mind on UBI, but I definitely respect the opposition now.",
              name: "David Kim",
              role: "Top Contributor",
              initials: "DK",
              color: "bg-blue-500"
            },
            {
              quote: "The Logic Coach is brutal but fair. It pointed out a logical fallacy I didn't even know I was making. Highly recommended.",
              name: "Marcus Ross",
              role: "Policy Researcher",
              initials: "MR",
              color: "bg-purple-500"
            }
          ].map((card, i) => (
            <div key={i} className="glass-card p-8 rounded-2xl transition-all duration-500">
              <div className="text-4xl text-slate-700 mb-2 font-serif">"</div>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed relative z-10">
                {card.quote}
              </p>
              <div className="flex items-center gap-4 border-t border-white/5 pt-4">
                <div className={`w-10 h-10 rounded-full ${card.color} flex items-center justify-center text-xs text-white font-bold shadow-lg shadow-${card.color.replace('bg-', '')}/20`}>
                  {card.initials}
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{card.name}</div>
                  <div className="text-slate-500 text-xs">{card.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Section */}
      <section className="relative z-10 mt-48 mb-32 max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <h2 className="text-4xl font-bold text-white mb-6">
            Structure creates <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500">Clarity.</span>
          </h2>
          <p className="text-slate-400 mb-10 text-lg leading-relaxed">
            We replace infinite scrolling and shout-matches with a focused, round-based system designed to extract the best arguments.
          </p>

          <div className="space-y-6">
            {[
              "Choose Arena: Solo vs AI or PvP Duel", 
              "Real-time AI Fact-Checking Referee", 
              "Structured Rounds (No Interruptions)", 
              "Post-Debate Analysis & Scoring"
            ].map((step, i) => (
              <div key={i} className="group flex items-center gap-4 text-slate-300 p-3 rounded-xl transition-colors hover:bg-white/5 cursor-default">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-cyan-400 text-sm font-bold font-mono shadow-sm group-hover:scale-110 group-hover:bg-cyan-900/30 group-hover:text-cyan-300 transition-all">
                  {i + 1}
                </span>
                <span className="font-medium group-hover:text-white transition-colors">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Animated Chat Bubbles - VISUALIZING PVP REFEREE */}
        <div className="relative space-y-6 perspective-[1000px]">
          <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-linear-to-b from-cyan-500/50 via-slate-700 to-red-500/50" />

          {/* User Bubble */}
          <div className="relative ml-8 p-6 glass-card rounded-xl rounded-tl-none border-l-4 border-l-cyan-500 transform transition-all duration-500 hover:translate-x-2 hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)]">
            <div className="absolute -left-[2.2rem] top-6 w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
            <div className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-2 flex justify-between">
              <span>You (User)</span>
              <span className="opacity-50">Round 1</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              "The earth is actually flat, as proven by the horizon line."
            </p>
          </div>

          {/* AI Referee Bubble (Yellow Card) */}
          <div className="relative ml-8 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-xl flex gap-3 transform transition-all duration-500 hover:scale-[1.02]">
            <div className="shrink-0 pt-1">
               <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
            </div>
            <div>
               <div className="text-yellow-500 text-xs font-black uppercase tracking-widest mb-1">AI Referee Intervention</div>
               <p className="text-yellow-100/80 text-sm leading-relaxed">
                 ⚠️ Fact Check: This is incorrect. The Earth is an oblate spheroid. The horizon appears flat due to scale.
               </p>
            </div>
          </div>

        </div>
      </section>

      <div className="h-24"></div>
    </div>
  );
}