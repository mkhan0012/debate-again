import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { HistoryInterface } from "@/components/HistoryInterface"; 

export const metadata = {
  title: "Debate History | Arguely",
};

export default async function HistoryPage() {
  const session = await getSession();
  
  // Guard clause: Redirect if not logged in
  if (!session || !session.userId) {
    redirect("/login");
  }

  // 1. Fetch All Rounds for User
  // Note: We cast session.userId as string here too for safety
  const myRounds = await prisma.round.findMany({
    where: {
      participants: {
        some: { userId: session.userId as string },
      },
    },
    include: {
      participants: {
        include: { user: true } // Get opponent names
      }, 
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // 2. Separate Data based on Mode
  const aiRounds = myRounds.filter(r => r.mode === 'GENERAL');
  const pvpRounds = myRounds.filter(r => r.mode === 'PVP');

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-300 font-sans pb-20 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-900/5 blur-[100px] rounded-full mix-blend-screen"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24">
        
        {/* Page Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
            Battle Archives
          </h1>
          <p className="text-zinc-500 text-lg max-w-lg mx-auto">
            Review your past logic duels and track your performance.
          </p>
        </div>

        {/* --- INTERACTIVE CLIENT COMPONENT --- */}
        {/* FIX: Cast userId to string to resolve the type error */}
        <HistoryInterface 
          aiRounds={aiRounds} 
          pvpRounds={pvpRounds} 
          userId={session.userId as string} 
        />

      </div>
    </div>
  );
}