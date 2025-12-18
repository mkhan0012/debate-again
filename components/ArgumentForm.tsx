'use client'

import { useRef, useState } from 'react';
import { submitUserArgument } from '@/app/action';
import { useCompletion } from '@ai-sdk/react'; 
import { useRouter } from 'next/navigation';

export function ArgumentForm({ roundId, participantId }: { roundId: string, participantId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  
  // Local state to handle the bubble visibility smoothly
  const [showBubble, setShowBubble] = useState(false);

  // Vercel AI SDK Hook
  const { complete, completion, isLoading } = useCompletion({
    api: '/api/chat',
    body: { roundId }, 
    onFinish: () => {
      // 1. Hide the bubble when finished
      setShowBubble(false);
      
      // 2. Refresh to show the official message in the chat list
      router.refresh(); 
    }
  });

  const handleSubmit = async (formData: FormData) => {
    const text = formData.get('argument') as string;
    if (!text.trim()) return;
    
    // Clear Input manually
    if (formRef.current) formRef.current.reset();

    try {
      // 1. Submit User Argument (Server Action)
      // This saves to DB and runs the Analyst
      await submitUserArgument(formData);
      
      // 2. Show the bubble right before we start streaming
      setShowBubble(true);
      
      // 3. Trigger AI Stream
      await complete(' '); 
      
    } catch (error) {
      console.error("Submission failed:", error);
      setShowBubble(false); // Hide if error
    }
  };

  // Only show if we explicitly want to (started streaming) OR if it's currently loading
  const isVisible = showBubble || isLoading;

  return (
    <div className="relative group w-full max-w-3xl mx-auto">
      
      {/* --- LIVE STREAMING BUBBLE --- */}
      {/* FIX: Controlled visibility so it doesn't get stuck */}
      {isVisible && completion && (
        <div className="absolute bottom-full left-0 mb-4 w-full animate-slide-up">
           <div className="bg-[#0A0A0A]/90 border border-purple-500/30 p-4 rounded-2xl rounded-bl-sm shadow-[0_0_30px_-5px_rgba(147,51,234,0.2)] backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                 <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">AI is typing...</span>
              </div>
              <p className="text-zinc-300 text-[15px] leading-relaxed">
                {completion}
                <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-purple-500 animate-pulse"></span>
              </p>
           </div>
        </div>
      )}

      {/* --- INPUT FORM --- */}
      <form 
        ref={formRef} 
        action={handleSubmit} 
        className={`relative bg-zinc-900/90 backdrop-blur-xl border transition-all duration-300 rounded-2xl shadow-2xl overflow-hidden
        ${isLoading ? 'border-purple-500/30 ring-1 ring-purple-500/20' : 'border-white/10 hover:border-white/20 focus-within:border-white/20'}`}
      >
        <input type="hidden" name="roundId" value={roundId} />
        <input type="hidden" name="participantId" value={participantId} />

        <div className="flex items-end p-2">
          <textarea
            name="argument"
            rows={1}
            disabled={isLoading}
            className="w-full bg-transparent border-none text-zinc-200 placeholder-zinc-600 px-4 py-3 focus:ring-0 resize-none max-h-32 min-h-[50px] scrollbar-hide text-[15px] leading-relaxed"
            placeholder={isLoading ? "AI is responding..." : "Type your argument..."}
            required
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!isLoading && formRef.current) {
                   formRef.current.requestSubmit();
                }
              }
            }}
          />
          
          <button
            type="submit"
            disabled={isLoading}
            className={`mb-1 mr-1 p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center
              ${isLoading 
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                : 'bg-white text-black hover:bg-zinc-200 hover:scale-105 active:scale-95'}`}
          >
            {isLoading ? (
               <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            ) : (
              <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Progress Line */}
        <div className="absolute bottom-0 left-0 h-[2px] bg-linear-to-r from-purple-500 via-cyan-500 to-purple-500 w-full transform origin-left transition-transform duration-1000"
             style={{ transform: isLoading ? 'scaleX(1)' : 'scaleX(0)' }}>
        </div>
      </form>
    </div>
  );
}