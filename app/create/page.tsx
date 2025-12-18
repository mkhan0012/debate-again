'use client'

import { useState } from 'react'
import { createRound } from '@/app/action' 
import { Zap, Users, ArrowRight, Sword, Globe } from 'lucide-react'
import Link from 'next/link'

export default function CreatePage() {
  const [mode, setMode] = useState<'GENERAL' | 'PVP'>('GENERAL')
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-900/10 blur-[120px] rounded-full mix-blend-screen"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-12 animate-fade-in-up">
           <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
             Initiate Protocol
           </h1>
           <p className="text-zinc-500 text-lg">Define parameters. Logic is your only weapon.</p>
           
           {/* LINK TO LOBBY */}
           <Link href="/lobby" className="inline-block mt-4 text-cyan-400 hover:text-white border-b border-cyan-500/30 pb-0.5 text-sm font-bold tracking-wide transition-colors">
             Looking for an opponent? Browse Open Chambers &rarr;
           </Link>
        </div>

        {/* Standard Form Submission - No Matchmaking logic here anymore */}
        <form action={createRound} onSubmit={() => setLoading(true)} className="space-y-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Solo Card */}
            <div 
              onClick={() => setMode('GENERAL')}
              className={`cursor-pointer group relative p-8 rounded-3xl border transition-all duration-300
              ${mode === 'GENERAL' 
                ? 'bg-zinc-900/80 border-purple-500 ring-1 ring-purple-500/50 shadow-2xl shadow-purple-900/20' 
                : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'}`}
            >
              <div className="mb-6 w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center">
                <Zap className={`w-7 h-7 ${mode === 'GENERAL' ? 'text-purple-400' : 'text-zinc-500'}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Solo vs AI</h3>
              <p className="text-zinc-500 text-sm">Train against the logic engine.</p>
              {mode === 'GENERAL' && <div className="absolute top-6 right-6 w-2 h-2 bg-purple-500 rounded-full" />}
            </div>

            {/* PvP Card (Host Room) */}
            <div 
              onClick={() => setMode('PVP')}
              className={`cursor-pointer group relative p-8 rounded-3xl border transition-all duration-300
              ${mode === 'PVP' 
                ? 'bg-zinc-900/80 border-cyan-500 ring-1 ring-cyan-500/50 shadow-2xl shadow-cyan-900/20' 
                : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'}`}
            >
              <div className="mb-6 w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center">
                <Globe className={`w-7 h-7 ${mode === 'PVP' ? 'text-cyan-400' : 'text-zinc-500'}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Host PvP Room</h3>
              <p className="text-zinc-500 text-sm">Open a public chamber and wait for challengers.</p>
              {mode === 'PVP' && <div className="absolute top-6 right-6 w-2 h-2 bg-cyan-500 rounded-full" />}
            </div>
          </div>

          <div className="relative group">
             <input type="hidden" name="mode" value={mode} />
             <input 
               name="topic"
               type="text" 
               placeholder="Enter topic (e.g., 'AI will replace coders')"
               required
               value={topic}
               onChange={(e) => setTopic(e.target.value)}
               className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-5 pl-14 text-lg text-white placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-all"
             />
             <Sword className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black font-bold text-lg py-5 rounded-2xl hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? 'Creating Chamber...' : (
              <>{mode === 'PVP' ? 'Open Chamber & Wait' : 'Start Debate'} <ArrowRight className="w-5 h-5" /></>
            )}
          </button>

        </form>
      </div>
    </div>
  )
}