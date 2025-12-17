import Link from "next/link";
import { getSession } from "@/lib/session";

export const metadata = {
  title: "About | Arguely",
  description: "Why we are building a platform for structured disagreement.",
};

export default async function AboutPage() {
  const session = await getSession();
  const isLoggedIn = !!session?.userId;

  return (
    <div className="relative min-h-screen bg-[#030303] text-slate-300 font-sans selection:bg-purple-500/30 overflow-x-hidden">
      
      {/* --- INJECT CUSTOM ANIMATIONS (Same as Home) --- */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.5; filter: blur(100px); }
          50% { opacity: 0.8; filter: blur(120px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shine {
          to { background-position: 200% center; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-glow-pulse { animation: glow 8s ease-in-out infinite; }
        .animate-slide-up { animation: slideUp 0.8s ease-out forwards; opacity: 0; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-500 { animation-delay: 500ms; }
        
        .text-shimmer {
          background-size: 200% auto;
          animation: shine 5s linear infinite;
        }
        
        /* Glass Card Style */
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .glass-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(139, 92, 246, 0.3); /* Purple tint hover */
          transform: translateY(-5px);
          box-shadow: 0 10px 40px -10px rgba(139, 92, 246, 0.15);
        }
      `}</style>

      {/* --- ANIMATED BACKGROUND ORBS --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Purple Orb (Top Left) */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full mix-blend-screen animate-glow-pulse animate-float" />
        {/* Blue Orb (Bottom Right) */}
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-900/20 rounded-full mix-blend-screen animate-glow-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-28">
        
        {/* 1. Hero / Problem Statement */}
        <section className="mb-32 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight animate-slide-up">
            About <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-pink-500 to-red-500 text-shimmer">Arguely</span>
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-light text-slate-200 mb-10 leading-snug animate-slide-up delay-100">
            Online arguments rarely lead to clarity.<br/>
            <span className="text-slate-500 text-xl">We are changing the physics of the conversation.</span>
          </h2>
          
          <div className="max-w-3xl mx-auto text-slate-400 text-lg leading-relaxed animate-slide-up delay-200">
            <p className="mb-6">
              Most internet discussions are driven by speed, emotion, and the desire to win. 
              Strong arguments are ignored, weak claims go unchallenged, and meaningful dialogue breaks down.
            </p>
            <div className="inline-block px-4 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-200 text-sm font-medium">
              This project explores a different approach.
            </div>
          </div>
        </section>

        {/* 2. What We're Building & AI Role */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32 animate-slide-up delay-300">
          
          {/* Card: Building */}
          <div className="glass-card p-8 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/20 transition-all" />
            
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-900/50 text-cyan-400 text-sm">01</span>
              The Platform
            </h3>
            <p className="text-slate-400 mb-8 leading-relaxed">
              We are building a structured debate platform where discussions are slow, focused, and evidence-based.
            </p>
            <ul className="space-y-4 text-sm text-slate-300">
              {[
                "Topics are clearly defined",
                "Participants take a clear position",
                "Claims require evidence",
                "Debates follow structured rounds"
              ].map((item, i) => (
                <li key={i} className="flex gap-3 items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Card: AI Role */}
          <div className="glass-card p-8 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition-all" />
            
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-900/50 text-purple-400 text-sm">AI</span>
              The Analyst
            </h3>
            <p className="text-slate-400 mb-8 leading-relaxed">
              AI is <span className="text-white font-medium">not a judge</span>. It acts as a neutral analyst to highlight inconsistencies.
            </p>
            <ul className="space-y-4 text-sm text-slate-300">
              {[
                "Highlighting unsupported claims",
                "Identifying logical inconsistencies",
                "Comparing evidence quality",
                "Reducing emotional bias"
              ].map((item, i) => (
                <li key={i} className="flex gap-3 items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 3. Is vs Isn't */}
        <section className="mb-32 animate-slide-up delay-500">
          <h3 className="text-3xl font-bold text-white mb-12 text-center">What This Is — and Isn’t</h3>
          
          <div className="relative p-px rounded-3xl bg-linear-to-r from-slate-800 via-slate-700 to-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 bg-[#050505] rounded-3xl overflow-hidden">
              
              {/* IS */}
              <div className="p-12 flex flex-col items-center text-center border-b sm:border-b-0 sm:border-r border-slate-800/50 hover:bg-white/5 transition-colors">
                <div className="w-16 h-16 rounded-full bg-green-900/20 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(74,222,128,0.1)]">
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <ul className="space-y-4 text-slate-300 font-medium">
                  <li>A space for thoughtful disagreement</li>
                  <li>A tool for learning through opposing views</li>
                  <li>An experiment in discourse</li>
                </ul>
              </div>

              {/* IS NOT */}
              <div className="p-12 flex flex-col items-center text-center hover:bg-white/5 transition-colors">
                <div className="w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(248,113,113,0.1)]">
                   <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <ul className="space-y-4 text-slate-300 font-medium">
                  <li>Not a comment section</li>
                  <li>Not for personal attacks</li>
                  <li>Not for viral outrage</li>
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* 4. Transparency & Vision */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24 animate-slide-up" style={{ animationDelay: '600ms' }}>
          <div>
            <h3 className="text-xl font-bold text-white mb-4 border-l-4 border-slate-700 pl-4">Openness & Transparency</h3>
            <p className="text-slate-400 mb-6 leading-relaxed">
              This platform is intentionally open to critique. Users are encouraged to question assumptions, debate ideas respectfully, and challenge the system’s design.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-4 border-l-4 border-slate-700 pl-4">The Long-Term Vision</h3>
            <p className="text-slate-400 mb-6 leading-relaxed">
              We’re starting with a web-based experience focused on design quality. If useful, we will expand to mobile apps and educational use cases.
            </p>
          </div>
        </section>

        {/* 5. Closing Belief */}
        <section className="text-center py-20 border-t border-slate-800/50 animate-slide-up" style={{ animationDelay: '700ms' }}>
          <h3 className="text-xs font-mono text-cyan-500 mb-6 uppercase tracking-[0.2em]">Our Core Belief</h3>
          
          <p className="text-2xl sm:text-4xl text-transparent bg-clip-text bg-linear-to-b from-white to-slate-400 font-bold leading-tight max-w-4xl mx-auto mb-10">
            "Arguments don’t have to be loud to be strong.<br /> Disagreement doesn’t have to be hostile."
          </p>
          
          {/* Action Button styled like Home */}
          <Link 
            href={isLoggedIn ? "/start" : "/login"}
            className="group relative inline-flex items-center gap-2 px-10 py-4 bg-white text-black font-bold rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)]"
          >
            <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-slate-200 to-transparent -translate-x-full group-hover:animate-[shine_1s_ease-in-out]" />
            <span className="relative z-10">
              {isLoggedIn ? "Start a Debate" : "Join to Debate"}
            </span>
            <svg className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </section>

      </div>
    </div>
  );
}