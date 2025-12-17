"use client";

import { useActionState } from 'react';
import { signup } from '@/app/actions/auth';
import AuthInput from '@/components/AuthInput';
import Link from 'next/link';

export default function SignupPage() {
  const [state, action, isPending] = useActionState(signup, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-[#030303] overflow-hidden text-slate-300">
      
      {/* --- INJECT CUSTOM ANIMATIONS --- */}
      <style jsx global>{`
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
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shine {
          to { background-position: 200% center; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-glow-pulse { animation: glow 8s ease-in-out infinite; }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; opacity: 0; }
        .text-shimmer {
          background-size: 200% auto;
          animation: shine 4s linear infinite;
        }
        .glass-panel-enhanced {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
        }
      `}</style>

      {/* --- ANIMATED BACKGROUND ORBS --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Cyan Orb (Top Right for Signup) */}
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full mix-blend-screen animate-glow-pulse animate-float" />
        {/* Purple Orb (Bottom Left) */}
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full mix-blend-screen animate-glow-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md z-10 animate-slide-up">
        <div className="glass-panel-enhanced p-8 md:p-10 rounded-2xl shadow-2xl relative overflow-hidden group">
          
          {/* Subtle Top Border Glow (Cyan for Signup) */}
          <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
              Initialize <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-400 text-shimmer">Identity</span>
            </h1>
            <p className="text-slate-400 text-sm font-light">
              Join the network of rational discourse.
            </p>
          </div>

          <form action={action} className="space-y-5">
            <div className="space-y-4">
              <AuthInput 
                name="username" 
                label="Username" 
                placeholder="LogicUser01" 
                error={state?.errors?.username}
              />
              <AuthInput 
                name="email" 
                type="email" 
                label="Email Address" 
                placeholder="name@example.com" 
                error={state?.errors?.email}
              />
              <AuthInput 
                name="password" 
                type="password" 
                label="Password" 
                placeholder="••••••••" 
                error={state?.errors?.password}
              />
            </div>
            
            {state?.message && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center flex items-center justify-center gap-2 animate-slide-up">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {state.message}
              </div>
            )}

            {/* Creative Button */}
            <button
              disabled={isPending}
              className="group relative w-full py-3.5 rounded-lg font-bold text-sm tracking-wide uppercase bg-cyan-600 text-white overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_-5px_rgba(8,145,178,0.4)] hover:shadow-[0_0_25px_-5px_rgba(8,145,178,0.6)] mt-2"
            >
              <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1s_ease-in-out]" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Sign Up
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline decoration-cyan-500/30 underline-offset-4 transition-all">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}