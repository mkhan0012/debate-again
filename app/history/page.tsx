import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { HistoryInterface } from "@/components/HistoryInterface"; // <--- Import logic

export const metadata = {
  title: "Debate History | Arguely",
};

export default async function HistoryPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  // 1. Fetch Real Data
  const myRounds = await prisma.round.findMany({
    where: {
      participants: {
        some: { userId: session.userId },
      },
    },
    include: {
      participants: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // 2. Separate Data (Server Side)
  const aiRounds = [];
  const humanRounds = [];

  for (const round of myRounds) {
    const hasAiOpponent = round.participants.some(p => p.role === 'AI');
    if (hasAiOpponent) {
      aiRounds.push(round);
    } else {
      humanRounds.push(round);
    }
  }

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-300 font-sans pb-20 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-900/5 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24">
        
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
            Battle Archives
          </h1>
          <p className="text-zinc-500 text-lg max-w-lg mx-auto">
            Analyze your past performances and track your win rates.
          </p>
        </div>

        {/* --- INTERACTIVE CLIENT COMPONENT --- */}
        <HistoryInterface aiRounds={aiRounds} humanRounds={humanRounds} />

      </div>
    </div>
  );
}