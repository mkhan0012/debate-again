import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/encryption'
import { ArgumentForm } from '@/components/ArgumentForm'
import { getSession } from "@/lib/session"
import { DebateScorecard } from '@/components/DebateScorecard'
import { endRoundAndJudge } from '@/app/actions/judgement'
import { ShieldAlert, Zap } from 'lucide-react'
import { WaitingRoom } from '@/components/WaitingRoom'
import { ChatRefresher } from '@/components/ChatRefresher'

// --- END DEBATE BUTTON ---
function EndDebateButton({ roundId }: { roundId: string }) {
  return (
    <form action={async () => {
      'use server'
      await endRoundAndJudge(roundId)
    }}>
      <button 
        type="submit"
        className="px-5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
      >
        End & Judge
      </button>
    </form>
  )
}

// --- MAIN PAGE ---
export default async function DebatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: roundId } = await params
  const session = await getSession();

  // 1. Fetch Round
  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: {
      arguments: {
        orderBy: { createdAt: 'asc' },
        include: { participant: { include: { user: true } } },
      },
      participants: true,
    },
  })

  if (!round) return <div className="min-h-screen grid place-items-center text-zinc-500">Round not found</div>;

  // 2. Setup Variables
  const isPvp = round.mode === 'PVP';
  const isCompleted = round.status === "COMPLETED";
  let currentParticipants = [...round.participants];
  let currentUserParticipantId = null;

  // 3. Join Logic (Auto-Join if PvP slot open)
  const myParticipantRecord = currentParticipants.find(p => p.userId === session?.userId);
  
  if (myParticipantRecord) {
    currentUserParticipantId = myParticipantRecord.id;
  } 
  else if (session?.userId && isPvp && !isCompleted) {
    const humanCount = currentParticipants.filter(p => p.role !== 'MODERATOR').length;
    
    // If lobby slot is open (< 2 players), join now
    if (humanCount < 2) {
      const newParticipant = await prisma.participant.create({
        data: { roundId, userId: session.userId as string, role: 'DEBATER' }
      });
      
      // Close the lobby slot so others don't see it as "Waiting"
      await prisma.round.update({
        where: { id: roundId },
        data: { status: 'ACTIVE' } 
      });
      
      currentUserParticipantId = newParticipant.id;
      currentParticipants.push(newParticipant as any);
    }
  }

  // 4. Calculate Status
  const humanCount = currentParticipants.filter(p => p.role !== 'MODERATOR').length;
  const isWaitingForOpponent = isPvp && humanCount < 2;

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-300 font-sans pb-32 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/10 blur-[120px] rounded-full mix-blend-screen"></div>
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 pt-24">
        
        {/* Header */}
        <div className="text-center mb-12 relative">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 backdrop-blur-md mb-6">
             {isPvp ? <ShieldAlert className="w-3 h-3 text-yellow-500" /> : <Zap className="w-3 h-3 text-purple-500" />}
             <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
               {isCompleted ? "Archive" : isPvp ? "AI Moderated PvP" : "AI Duel"}
             </span>
           </div>
           
           <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
             {round.topic}
           </h1>

           {/* End Button */}
           {!isCompleted && !isWaitingForOpponent && currentUserParticipantId && (
             <div className="absolute top-0 right-0 hidden md:block">
               <EndDebateButton roundId={roundId} />
             </div>
           )}
        </div>

        {/* --- DYNAMIC SWITCHER --- */}
        
        {isWaitingForOpponent && !isCompleted ? (
           <WaitingRoom roundId={roundId} />
        ) : isCompleted && round.scorecard ? (
           <DebateScorecard data={round.scorecard} />
        ) : (
           <div className="space-y-8">
             
             {/* Auto-Refresher for Real-Time Chat */}
             <ChatRefresher />

             {round.arguments.map((arg: any) => {
               let content = '[Decryption Error]'
               try { content = decrypt(arg.contentEncrypted, arg.iv) } catch {}

               const user = arg.participant.user;
               const role = arg.participant.role;
               
               const isModerator = role === 'MODERATOR';
               const isAI = role === 'AI';
               const isMe = session?.userId && user?.id === session.userId;
               
               // --- MODERATOR ALERT (Yellow Card) ---
               if (isModerator) {
                 return (
                   <div key={arg.id} className="flex justify-center my-8 animate-fade-in-up">
                     <div className="relative group max-w-xl w-full mx-4">
                        {/* FIX: Changed bg-linear-to-r -> bg-gradient-to-r */}
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
                              {content}
                            </p>
                          </div>
                        </div>
                     </div>
                   </div>
                 )
               }

               // --- PLAYER BUBBLES ---
               return (
                 <div key={arg.id} className={`flex gap-4 md:gap-6 ${isMe ? 'flex-row-reverse' : ''} group animate-fade-in-up`}>
                    <div className="shrink-0 mt-2">
                       <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold shadow-2xl border transition-transform group-hover:scale-105
                         ${isAI ? 'bg-purple-950 text-purple-200 border-purple-500/30' : 
                           isMe ? 'bg-cyan-950 text-cyan-200 border-cyan-500/30' : 
                           'bg-zinc-900 text-zinc-400 border-zinc-700'}`}>
                         {isAI ? <Zap className="w-4 h-4" /> : user?.username?.[0]?.toUpperCase() || 'OP'}
                       </div>
                    </div>

                    <div className={`flex flex-col max-w-[85%] md:max-w-2xl ${isMe ? 'items-end' : 'items-start'}`}>
                       <div className="flex items-center gap-2 mb-2 px-1 opacity-50 group-hover:opacity-80 transition-opacity">
                          <span className="text-xs font-bold text-zinc-300">
                            {isAI ? 'Arguely AI' : (isMe ? 'You' : user?.username || 'Opponent')}
                          </span>
                       </div>

                       <div className={`relative px-6 py-4 rounded-3xl text-[15px] md:text-base leading-relaxed shadow-lg backdrop-blur-md border
                         ${isMe 
                           ? 'bg-zinc-800/80 border-zinc-700/50 text-zinc-100 rounded-tr-sm' 
                           : isAI 
                             ? 'bg-black/60 border-purple-500/20 text-zinc-300 rounded-tl-sm shadow-[0_0_15px_-5px_rgba(168,85,247,0.1)]'
                             : 'bg-black/60 border-zinc-800 text-zinc-300 rounded-tl-sm'
                         }`}>
                         {content}
                       </div>
                    </div>
                 </div>
               )
             })}
             <div className="h-32"></div>
           </div>
        )}

        {!isWaitingForOpponent && !isCompleted && currentUserParticipantId && (
           <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
              <div className="max-w-3xl mx-auto flex gap-2 items-end">
                 <div className="grow">
                    <ArgumentForm roundId={roundId} participantId={currentUserParticipantId}/>
                 </div>
                 <div className="md:hidden mb-1">
                   <EndDebateButton roundId={roundId} />
                 </div>
              </div>
           </div>
        )}

      </div>
    </div>
  )
}