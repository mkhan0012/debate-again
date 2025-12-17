import Link from "next/link";

export default function SelectModePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-black relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl w-full z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Choose Your Arena
          </h1>
          <p className="text-zinc-400">Select how you wish to engage.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Practice Chamber -> Leads to Debate Setup */}
          <Link href="/start" className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 p-8 hover:border-accent/50 transition-all duration-300">
            <div className="absolute inset-0 bg-linear-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                <svg className="w-6 h-6 text-zinc-400 group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Practice Chamber</h3>
              <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                Debate against the AI logic engine. Perfect for refining your arguments and identifying fallacies in a controlled environment.
              </p>
              
              <span className="text-accent text-sm font-mono uppercase tracking-wider group-hover:underline">
                Initialize Sequence &rarr;
              </span>
            </div>
          </Link>

          {/* PvP Mode (Placeholder) */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/20 p-8 opacity-75 cursor-not-allowed">
            <div className="absolute top-4 right-4 px-2 py-1 bg-zinc-800 rounded text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
              Coming Soon
            </div>
            
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-zinc-500 mb-2">Live PvP</h3>
            <p className="text-zinc-600 text-sm mb-6 leading-relaxed">
              Challenge another human intellect in real-time. Ranked matchmaking and community tournaments.
            </p>
            
            <span className="text-zinc-600 text-sm font-mono uppercase tracking-wider">
              System Offline
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}