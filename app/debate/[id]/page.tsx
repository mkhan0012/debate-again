import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/encryption'
import { getSession } from "@/lib/session"
import { DebateScorecard } from '@/components/DebateScorecard'
import { endRoundAndJudge } from '@/app/actions/judgement'
import { ShieldAlert, Zap } from 'lucide-react'
import { WaitingRoom } from '@/components/WaitingRoom'
import { ChatRefresher } from '@/components/ChatRefresher'
import { LiveDebate } from '@/components/LiveDebate'
// 1. IMPORT THE COMPONENT
import DebateWrappedCard from '@/components/DebateWrappedCard'

export default async function DebatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: roundId } = await params
  const session = await getSession();

  // 1. Fetch Round Data
  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: {
      participants: { include: { user: true } }, 
    },
  })

  if (!round) return <div className="min-h-screen grid place-items-center text-zinc-500">Round not found</div>;

  const isPvp = round.mode === 'PVP';
  const isCompleted = round.status === "COMPLETED";

  // 2. Fetch Chat History (Only if active)
  let argumentsList: any[] = [];
  if (!isCompleted) {
    argumentsList = await prisma.argument.findMany({
      where: { roundId },
      orderBy: { createdAt: 'asc' },
      include: { participant: { include: { user: true } } },
    });
  }

  // 3. User Logic
  let currentParticipants = [...round.participants];
  let currentUserParticipantId = null;

  const myParticipantRecord = currentParticipants.find(p => p.userId === session?.userId);
  
  if (myParticipantRecord) {
    currentUserParticipantId = myParticipantRecord.id;
  } 
  else if (session?.userId && isPvp && !isCompleted) {
    const humanCount = currentParticipants.filter(p => p.role !== 'MODERATOR').length;
    if (humanCount < 2) {
      const newParticipant = await prisma.participant.create({
        data: { roundId, userId: session.userId as string, role: 'DEBATER' }
      });
      await prisma.round.update({ where: { id: roundId }, data: { status: 'ACTIVE' } });
      currentUserParticipantId = newParticipant.id;
      currentParticipants.push(newParticipant as any);
    }
  }

  const humanCount = currentParticipants.filter(p => p.role !== 'MODERATOR').length;
  const isWaitingForOpponent = isPvp && humanCount < 2;

  // 4. PREPARE DATA FOR CLIENT COMPONENT
  const initialMessages = argumentsList.map((arg) => {
    let content = '[Decryption Error]'
    try { content = decrypt(arg.contentEncrypted, arg.iv) } catch {}

    const user = arg.participant.user;
    const role = arg.participant.role;
    const isMe = session?.userId ? user?.id === session.userId : false;

    return {
      id: arg.id,
      content,
      role,
      username: user?.username || 'Opponent',
      isMe,
      isAI: role === 'AI',
      isModerator: role === 'MODERATOR'
    };
  });

  // 5. HELPER: Extract Winner/Loser Data for the Wrapped Card
  const scorecard = round.scorecard as any;
  const winnerName = scorecard?.winner || "Undecided";
  
  // Find the actual participant objects based on the winner name
  const winnerParticipant = currentParticipants.find(p => p.user?.username === winnerName) || currentParticipants[0];
  const loserParticipant = currentParticipants.find(p => p.user?.username !== winnerName && p.role === 'DEBATER');
  
  // Fallback data if user is missing
  const winnerUsername = winnerParticipant?.user?.username || winnerName;
  const winnerAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${winnerUsername}&backgroundColor=bef264`;
  
  const loserUsername = loserParticipant?.user?.username || "The AI";
  const loserAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${loserUsername}&backgroundColor=c026d3`;

  // 6. SERVER ACTION
  const endDebateAction = async () => {
    'use server'
    await endRoundAndJudge(roundId)
  }

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-300 font-sans pb-32 relative overflow-hidden">
      
      {/* Background */}
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
        </div>

        {/* --- DYNAMIC SWITCHER --- */}
        {isWaitingForOpponent && !isCompleted ? (
           <WaitingRoom roundId={roundId} />
        ) : isCompleted && round.scorecard ? (
           // --- UPDATED COMPLETION SECTION ---
           <div className="space-y-16 animate-in fade-in duration-700">
             
             {/* Scorecard */}
             <DebateScorecard data={round.scorecard} />
             
             {/* NEW: Viral Share Card */}
             <div className="max-w-xl mx-auto">
               <div className="flex items-center gap-4 mb-8">
                  <div className="h-px bg-zinc-800 flex-grow"></div>
                  <span className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Victory Card</span>
                  <div className="h-px bg-zinc-800 flex-grow"></div>
               </div>
               
               <DebateWrappedCard 
    topic={round.topic}
    winner={(round.scorecard as any)?.winner || "Undecided"}
    summary={(round.scorecard as any)?.summary || "Debate concluded."}
    // Calculate simple stats or pass dummy data for now
    timeWasted={`${Math.floor((argumentsList.length * 1.5))}m`} // Rough estimate: 1.5 mins per argument
    totalTurns={argumentsList.length}
/>
             </div>

           </div>
           // ----------------------------------
        ) : (
           <>
             <ChatRefresher />
             <LiveDebate 
               initialMessages={initialMessages}
               roundId={roundId}
               currentUserParticipantId={currentUserParticipantId || null}
               onEndDebate={endDebateAction}
             />
           </>
        )}
      </div>
    </div>
  )
}