'use client'

import { useState, useActionState } from 'react' // Import useActionState
import { createDebate } from '@/app/actions/debate' 
import { Zap, Users, ArrowRight, Sword, Shield, Skull, Smile, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function CreatePage() {
  const [mode, setMode] = useState<'GENERAL' | 'PVP'>('GENERAL')
  const [position, setPosition] = useState<'For' | 'Against'>('For')
  const [persona, setPersona] = useState<'LOGIC_LORD' | 'ROAST_MASTER' | 'GENTLE_GUIDE'>('LOGIC_LORD')

  // FIX: Use the hook to handle the form action
  const [state, formAction, isPending] = useActionState(createDebate, null)

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4 relative overflow-hidden -mt-16">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-900/10 blur-[120px] rounded-full mix-blend-screen"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl pt-24 pb-12">
        <div className="text-center mb-12 animate-fade-in-up">
           <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter">
             Initiate Protocol
           </h1>
           <p className="text-zinc-500 text-lg">Define parameters. Logic is your only weapon.</p>
           
           <Link href="/lobby" className="inline-block mt-4 text-cyan-400 hover:text-white border-b border-cyan-500/30 pb-0.5 text-sm font-bold tracking-wide transition-colors">
             Looking for an opponent? Browse Open Chambers &rarr;
           </Link>
        </div>

        {/* Display Server Error if it exists */}
        {state?.error && (
          <div className="max-w-xl mx-auto mb-8 bg-red-950/30 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-200 animate-pulse">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-bold">{state.error}</span>
          </div>
        )}

        {/* Use formAction from the hook */}
        <form action={formAction} className="space-y-12 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          
          {/* 1. TOPIC & SIDE */}
          <div className="space-y-6">
             <div className="relative group">
                <input 
                  name="topic"
                  type="text" 
                  placeholder="Enter topic (e.g., 'AI will replace coders')"
                  required
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-6 pl-16 text-xl md:text-2xl font-bold text-white placeholder-zinc-700 focus:outline-none focus:border-white/20 transition-all shadow-xl"
                />
                <Sword className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-600" />
             </div>

             <div className="flex justify-center">
               <div className="bg-zinc-900 p-1 rounded-xl inline-flex border border-zinc-800">
                 <button
                   type="button"
                   onClick={() => setPosition('For')}
                   className={`px-8 py-2 rounded-lg text-sm font-bold transition-all ${position === 'For' ? 'bg-cyan-950 text-cyan-400 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                 >
                   FOR
                 </button>
                 <button
                   type="button"
                   onClick={() => setPosition('Against')}
                   className={`px-8 py-2 rounded-lg text-sm font-bold transition-all ${position === 'Against' ? 'bg-red-950 text-red-400 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                 >
                   AGAINST
                 </button>
                 <input type="hidden" name="position" value={position} />
               </div>
             </div>
          </div>

          <div className="h-px bg-zinc-900 w-full max-w-2xl mx-auto"></div>

          {/* 2. MODE SELECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input type="hidden" name="mode" value={mode} />
            
            <div 
              onClick={() => setMode('GENERAL')}
              className={`cursor-pointer group relative p-8 rounded-3xl border transition-all duration-300
              ${mode === 'GENERAL' 
                ? 'bg-zinc-900/80 border-purple-500 ring-1 ring-purple-500/50 shadow-2xl shadow-purple-900/20' 
                : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
                  <Zap className={`w-6 h-6 ${mode === 'GENERAL' ? 'text-purple-400' : 'text-zinc-500'}`} />
                </div>
                {mode === 'GENERAL' && <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Solo vs AI</h3>
              <p className="text-zinc-500 text-sm">Train your skills against the Logic Engine.</p>
            </div>

            <div 
              onClick={() => setMode('PVP')}
              className={`cursor-pointer group relative p-8 rounded-3xl border transition-all duration-300
              ${mode === 'PVP' 
                ? 'bg-zinc-900/80 border-cyan-500 ring-1 ring-cyan-500/50 shadow-2xl shadow-cyan-900/20' 
                : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
                  <Users className={`w-6 h-6 ${mode === 'PVP' ? 'text-cyan-400' : 'text-zinc-500'}`} />
                </div>
                {mode === 'PVP' && <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse" />}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Host PvP Room</h3>
              <p className="text-zinc-500 text-sm">Create a public chamber and wait for a human.</p>
            </div>
          </div>

          {/* 3. PERSONA SELECTION */}
          <div className="space-y-4">
            <h3 className="text-center text-zinc-500 text-xs font-bold uppercase tracking-widest">Select AI Analyst Persona</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="hidden" name="persona" value={persona} />
              
              <button
                type="button"
                onClick={() => setPersona('LOGIC_LORD')}
                className={`p-4 rounded-2xl border text-left transition-all ${persona === 'LOGIC_LORD' ? 'bg-zinc-800 border-white text-white' : 'bg-transparent border-zinc-800 text-zinc-500 hover:bg-zinc-900'}`}
              >
                <Shield className="w-5 h-5 mb-3" />
                <div className="font-bold text-sm">Logic Lord</div>
                <div className="text-xs opacity-70 mt-1">Strict, academic, ruthless.</div>
              </button>

              <button
                type="button"
                onClick={() => setPersona('ROAST_MASTER')}
                className={`p-4 rounded-2xl border text-left transition-all ${persona === 'ROAST_MASTER' ? 'bg-red-900/20 border-red-500 text-red-100' : 'bg-transparent border-zinc-800 text-zinc-500 hover:bg-zinc-900'}`}
              >
                <Skull className="w-5 h-5 mb-3" />
                <div className="font-bold text-sm">Roast Master</div>
                <div className="text-xs opacity-70 mt-1">Sarcastic, funny, mocking.</div>
              </button>

              <button
                type="button"
                onClick={() => setPersona('GENTLE_GUIDE')}
                className={`p-4 rounded-2xl border text-left transition-all ${persona === 'GENTLE_GUIDE' ? 'bg-green-900/20 border-green-500 text-green-100' : 'bg-transparent border-zinc-800 text-zinc-500 hover:bg-zinc-900'}`}
              >
                <Smile className="w-5 h-5 mb-3" />
                <div className="font-bold text-sm">Gentle Guide</div>
                <div className="text-xs opacity-70 mt-1">Encouraging, beginner friendly.</div>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-white text-black font-black text-xl py-6 rounded-2xl hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
          >
            {isPending ? 'Initializing...' : (
              <>{mode === 'PVP' ? 'Open Chamber' : 'Enter Arena'} <ArrowRight className="w-6 h-6" /></>
            )}
          </button>

        </form>
      </div>
    </div>
  )
}