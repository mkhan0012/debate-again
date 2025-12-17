"use client";

import { useActionState } from 'react';
import { login } from '@/app/actions/auth';
import AuthInput from '@/components/AuthInput';
import Link from 'next/link';

export default function LoginPage() {
  const [state, action, isPending] = useActionState(login, undefined);

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
        {/* Purple Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full mix-blend-screen animate-glow-pulse animate-float" />
        {/* Cyan Orb (Offset) */}
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full mix-blend-screen animate-glow-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md z-10 animate-slide-up">
        <div className="glass-panel-enhanced p-8 md:p-10 rounded-2xl shadow-2xl relative overflow-hidden group">
          
          {/* Subtle Top Border Glow */}
          <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-purple-500/50 to-transparent opacity-50" />

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
              Welcome <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-cyan-400 text-shimmer">Back</span>
            </h1>
            <p className="text-slate-400 text-sm font-light">
              Resume your logical engagements.
            </p>
          </div>

          <form action={action} className="space-y-6">
            <div className="space-y-5">
              <AuthInput 
                name="email" 
                type="email" 
                label="Email Address" 
                placeholder="name@example.com" 
              />
              
              <div className="relative">
                <AuthInput 
                  name="password" 
                  type="password" 
                  label="Password" 
                  placeholder="••••••••" 
                />
                <div className="absolute right-0 top-0">
                    <Link href="/forgot-password" className="text-xs text-cyan-500 hover:text-cyan-400 transition-colors">
                        Forgot?
                    </Link>
                </div>
              </div>
            </div>

            {state?.errors?.form && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center flex items-center justify-center gap-2 animate-slide-up">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {state.errors.form}
              </div>
            )}

            {/* Creative Button */}
            <button
              disabled={isPending}
              className="group relative w-full py-3.5 rounded-lg font-bold text-sm tracking-wide uppercase bg-white text-black overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)]"
            >
              <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-slate-200 to-transparent -translate-x-full group-hover:animate-[shine_1s_ease-in-out]" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  <>
                    Access Terminal
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Need an account?{' '}
            <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline decoration-cyan-500/30 underline-offset-4 transition-all">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}