'use client'

import { useOptimistic } from 'react'
import { ArgumentForm } from './ArgumentForm'
import { ShieldAlert, Zap } from 'lucide-react'

// Define Message Structure
type Message = {
  id: string;
  content: string;
  role: string;
  username: string;
  isMe: boolean;
  isAI: boolean;
  isModerator: boolean;
  isOptimistic?: boolean; // Flag for "Fake/Instant" messages
}

export function LiveDebate({ 
  initialMessages, 
  roundId, 
  currentUserParticipantId 
}: { 
  initialMessages: Message[], 
  roundId: string, 
  currentUserParticipantId: string | null 
}) {

  // THE MAGIC HOOK: Handles instant UI updates
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    initialMessages,
    (state, newMessage: string) => [
      ...state,
      {
        id: 'opt-' + Date.now(),
        content: newMessage,
        role: 'DEBATER',
        username: 'You',
        isMe: true,
        isAI: false,
        isModerator: false,
        isOptimistic: true // Marks this as a temporary instant message
      }
    ]
  );

  return (
    <div className="space-y-8">
      {/* MESSAGE LIST */}
      {optimisticMessages.map((msg) => (
        <div key={msg.id}>
           {/* --- MODERATOR (Yellow Card) --- */}
           {msg.isModerator ? (
               <div className="flex justify-center my-8 animate-fade-in-up">
                 <div className="relative group max-w-xl w-full mx-4">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl opacity-20 blur group-hover:opacity-30 transition duration-1000"></div>
                    <div className="relative bg-[#120F05] border border-yellow-500/20 rounded-xl p-4 flex gap-4 items-start shadow-2xl">
                      <div className="shrink-0 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20 mt-0.5">
                         <ShieldAlert className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-black text-yellow-500 uppercase tracking-widest">Fact Check</span>
                          <span className="text-[10px] text-yellow-500/60 font-mono">AI REFEREE</span>
                        </div>
                        <p className="text-sm text-yellow-100/90 leading-relaxed font-medium">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                 </div>
               </div>
           ) : (
             // --- PLAYERS (You / AI / Opponent) ---
             <div className={`flex gap-4 md:gap-6 ${msg.isMe ? 'flex-row-reverse' : ''} group animate-fade-in-up`}>
                <div className="shrink-0 mt-2">
                   <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold shadow-2xl border transition-transform group-hover:scale-105
                     ${msg.isAI ? 'bg-purple-950 text-purple-200 border-purple-500/30' : 
                       msg.isMe ? 'bg-cyan-950 text-cyan-200 border-cyan-500/30' : 
                       'bg-zinc-900 text-zinc-400 border-zinc-700'}`}>
                     {msg.isAI ? <Zap className="w-4 h-4" /> : msg.username[0].toUpperCase()}
                   </div>
                </div>

                <div className={`flex flex-col max-w-[85%] md:max-w-2xl ${msg.isMe ? 'items-end' : 'items-start'}`}>
                   <div className="flex items-center gap-2 mb-2 px-1 opacity-50 group-hover:opacity-80 transition-opacity">
                      <span className="text-xs font-bold text-zinc-300">
                        {msg.isAI ? 'Arguely AI' : (msg.isMe ? 'You' : msg.username)}
                      </span>
                      {/* Show 'Sending...' indicator for optimistic messages */}
                      {msg.isOptimistic && (
                        <span className="text-[10px] uppercase tracking-widest text-cyan-500 animate-pulse ml-2">
                          Sending...
                        </span>
                      )}
                   </div>

                   <div className={`relative px-6 py-4 rounded-3xl text-[15px] md:text-base leading-relaxed shadow-lg backdrop-blur-md border
                     ${msg.isMe 
                       ? 'bg-zinc-800/80 border-zinc-700/50 text-zinc-100 rounded-tr-sm' 
                       : msg.isAI 
                         ? 'bg-black/60 border-purple-500/20 text-zinc-300 rounded-tl-sm shadow-[0_0_15px_-5px_rgba(168,85,247,0.1)]'
                         : 'bg-black/60 border-zinc-800 text-zinc-300 rounded-tl-sm'
                     } ${msg.isOptimistic ? 'opacity-70' : ''}`}>
                     {msg.content}
                   </div>
                </div>
             </div>
           )}
        </div>
      ))}
      
      <div className="h-32"></div>

      {/* FIXED FORM AT BOTTOM */}
      {currentUserParticipantId && (
           <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
              <div className="max-w-3xl mx-auto flex gap-2 items-end">
                 <div className="grow">
                    {/* KEY CHANGE: Passing the addOptimisticMessage handler here */}
                    <ArgumentForm 
                      roundId={roundId} 
                      participantId={currentUserParticipantId}
                      onOptimisticAdd={addOptimisticMessage} 
                    />
                 </div>
              </div>
           </div>
      )}
    </div>
  )
}