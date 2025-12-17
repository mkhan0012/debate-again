import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/encryption'
import { ArgumentForm } from '@/components/ArgumentForm'
import { getSession } from "@/lib/session"

export default async function DebatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: roundId } = await params
  const session = await getSession();

  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: {
      arguments: {
        orderBy: { createdAt: 'asc' },
        include: {
          participant: {
            include: { user: true }
          },
        },
      },
    },
  })

  let currentUserParticipantId = null;
  if (session?.userId) {
    const participantRecord = await prisma.participant.findFirst({
      where: { roundId: roundId, userId: session.userId },
      select: { id: true }
    });
    currentUserParticipantId = participantRecord?.id;
  }

  if (!round) return <div className="min-h-screen grid place-items-center text-zinc-500">Round not found</div>;

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-300 font-sans pb-32 relative overflow-hidden">
      
      {/* --- CSS ANIMATIONS (No Plugin Required) --- */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .msg-enter {
          animation: fadeUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          opacity: 0; /* Hidden by default until animation starts */
        }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 pt-24">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4 msg-enter">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Live Session</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-linear-to-b from-white to-white/60 tracking-tight leading-tight max-w-3xl mx-auto">
            {round.topic}
          </h1>
        </div>

        {/* --- MESSAGES --- */}
        <div className="space-y-10">
          {round.arguments.map((arg, index) => {
            let content = '[Decryption Error]'
            try { content = decrypt(arg.contentEncrypted, arg.iv) } catch {}

            const user = arg.participant.user;
            const isAI = arg.participant.role === 'AI';
            const displayName = user?.name || (isAI ? 'Arguely AI' : 'Opponent');
            const isMe = session?.userId && user?.id === session.userId;
            
            // FIX: Cap the delay at 0.5s max, and make the newest message instant
            const isNewest = index === round.arguments.length - 1;
            const delay = isNewest ? 0 : Math.min(index * 50, 400);

            return (
              <div 
                key={arg.id} 
                className={`flex gap-6 ${isMe ? 'flex-row-reverse' : ''} group msg-enter`}
                style={{ animationDelay: `${delay}ms` }}
              >
                {/* Avatar */}
                <div className="shrink-0 mt-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shadow-lg
                    ${isAI ? 'bg-purple-900/50 text-white ring-1 ring-purple-500/30' : 
                      isMe ? 'bg-cyan-900/50 text-white ring-1 ring-cyan-500/30' : 
                      'bg-zinc-800 border border-zinc-700 text-zinc-400'}`}>
                    {isAI ? 'AI' : displayName.slice(0, 2).toUpperCase()}
                  </div>
                </div>

                {/* Bubble */}
                <div className={`flex flex-col max-w-[85%] md:max-w-2xl ${isMe ? 'items-end' : 'items-start'}`}>
                  
                  <div className="flex items-center gap-3 mb-2 px-1 opacity-60">
                    <span className="text-xs font-bold text-zinc-400">{displayName}</span>
                    <span className="text-[10px] text-zinc-600 font-mono">
                      {new Date(arg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className={`relative px-6 py-5 rounded-2xl text-[15px] md:text-base leading-7 shadow-xl backdrop-blur-sm border
                    ${isMe 
                      ? 'bg-zinc-900/80 border-zinc-800/80 text-zinc-200 rounded-tr-sm' 
                      : isAI 
                        ? 'bg-[#0A0A0A]/90 border-purple-500/20 text-zinc-300 rounded-tl-sm shadow-[0_0_20px_-5px_rgba(147,51,234,0.1)]' 
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 rounded-tl-sm'
                    }`}>
                    {content}
                  </div>

                  {/* AI Analyst Card */}
                  {arg.aiAnalysis && (
                    <div className="mt-3 relative pl-4 ml-2 border-l-2 border-purple-500/30">
                      <div className="bg-purple-900/10 border border-purple-500/10 rounded-r-lg p-3 max-w-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Analysis</span>
                        </div>
                        <p className="text-sm text-purple-200/70 leading-snug">
                          {(arg.aiAnalysis as any)?.feedback || "Analyzing logic..."}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )
          })}
          
          <div className="h-24"></div>
        </div>

        {/* --- INPUT --- */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
           <div className="max-w-3xl mx-auto">
              {currentUserParticipantId ? (
                <ArgumentForm roundId={roundId} participantId={currentUserParticipantId}/>
              ) : (
                <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-center backdrop-blur-xl">
                   <p className="text-sm text-zinc-500">Spectator Mode</p>
                </div>
              )}
           </div>
        </div>

      </div>
    </div>
  )
}