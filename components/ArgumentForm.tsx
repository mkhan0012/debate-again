'use client'

import { useRef, useState } from 'react';
import { submitUserArgument,triggerAiResponse } from '@/app/action';

export function ArgumentForm({ roundId, participantId }: { roundId: string, participantId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = async (formData: FormData) => {
    const text = inputValue.trim();
    if (!text) return;

    // Optimistically clear input
    setInputValue("");
    
    try {
      // 1. Submit User Arg (Instant UI update via Server Action)
      await submitUserArgument(formData);
      
      // 2. Artificial Delay for UX (Thinking State)
      setIsThinking(true);
      const minDelay = new Promise(resolve => setTimeout(resolve, 1500));
      const aiRequest = triggerAiResponse(roundId, text);
      
      await Promise.all([minDelay, aiRequest]);
    } catch (error) {
      console.error("Submission failed:", error);
      // Optional: Restore input value on error
      // setInputValue(text); 
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="relative group">
      
      {/* --- AI STATUS INDICATOR --- */}
      <div className={`absolute -top-16 left-1/2 -translate-x-1/2 transition-all duration-500 ease-out transform
        ${isThinking ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
         <div className="flex items-center gap-3 bg-[#0A0A0A] border border-purple-500/30 px-5 py-2.5 rounded-full shadow-[0_0_30px_-5px_rgba(147,51,234,0.3)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
            </span>
            <span className="text-xs font-medium text-purple-200 tracking-wide">AI IS THINKING...</span>
         </div>
      </div>

      {/* --- COMMAND BAR --- */}
      <form 
        ref={formRef} 
        action={handleSubmit} 
        className={`relative bg-zinc-900/90 backdrop-blur-xl border transition-all duration-300 rounded-2xl shadow-2xl overflow-hidden
        ${isThinking ? 'border-purple-500/30 ring-1 ring-purple-500/20' : 'border-white/10 hover:border-white/20 focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/10'}`}
      >
        <input type="hidden" name="roundId" value={roundId} />
        <input type="hidden" name="participantId" value={participantId} />

        <div className="flex items-end p-2">
          <textarea
            name="argument"
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isThinking}
            className="w-full bg-transparent border-none text-zinc-200 placeholder-zinc-600 px-4 py-3 focus:ring-0 resize-none max-h-32 min-h-[50px] scrollbar-hide text-[15px] leading-relaxed"
            placeholder={isThinking ? "Wait for AI response..." : "Type your argument..."}
            required
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                // Safety check for ref existence
                if (inputValue.trim() && !isThinking && formRef.current) {
                   const formData = new FormData(formRef.current);
                   handleSubmit(formData);
                }
              }
            }}
          />
          
          <button
            type="submit"
            disabled={isThinking || !inputValue.trim()}
            className={`mb-1 mr-1 p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center
              ${!inputValue.trim() || isThinking 
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                : 'bg-white text-black hover:bg-zinc-200 hover:scale-105 active:scale-95 shadow-[0_0_15px_-3px_rgba(255,255,255,0.3)]'}`}
          >
            {isThinking ? (
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
             style={{ transform: isThinking ? 'scaleX(1)' : 'scaleX(0)' }}>
        </div>
      </form>
    </div>
  );
}