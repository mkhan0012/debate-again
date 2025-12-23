// app/offer/page.tsx
import Link from "next/link";
import { Coins, Timer, Zap } from "lucide-react";

export default function OfferPage() {
  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center overflow-hidden">
      
      {/* Intense Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50"></div>
      </div>

      <main className="relative z-10 text-center px-4 max-w-4xl">
        {/* Urgent Timer Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/50 text-red-500 text-sm font-black uppercase tracking-[0.2em] mb-8 animate-bounce">
          <Timer className="w-4 h-4" />
          Ends in 3 Days
        </div>

        {/* Core Offer */}
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-6 italic uppercase">
          Win Money <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500">
            Fight AI
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-zinc-400 font-light max-w-2xl mx-auto mb-12 leading-relaxed">
          The ultimate logic challenge. Defeat our <span className="text-white font-bold">Pro Logic Engine</span> in a structured debate and claim your bounty. No second chances.
        </p>

        {/* Action Button */}
        <div className="flex flex-col items-center gap-6">
          <Link 
            href="/create"
            className="group relative px-12 py-6 bg-white text-black text-2xl font-black rounded-sm transform transition-all hover:scale-105 active:scale-95 hover:rotate-1 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
          >
            <span className="relative z-10 flex items-center gap-3">
              <Zap className="w-6 h-6 fill-current" />
              ENTER THE ARENA
            </span>
            <div className="absolute inset-0 bg-red-600 translate-x-2 translate-y-2 -z-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform" />
          </Link>
          
          <div className="flex items-center gap-8 mt-4 text-zinc-600 font-mono text-sm uppercase tracking-widest">
            <span className="flex items-center gap-2"><Coins className="w-4 h-4" /> Instant Payout</span>
            <span className="flex items-center gap-2">●</span>
            <span>Verified Logic</span>
          </div>
        </div>
      </main>

      {/* Decorative Side Text */}
      <div className="fixed bottom-10 left-10 hidden xl:block">
        <p className="text-zinc-800 text-9xl font-black select-none pointer-events-none">03:00:00</p>
      </div>
      
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.4; transform: translate(-50%, -50%) scale(1.1); }
        }
      `}</style>
    </div>
  );
}