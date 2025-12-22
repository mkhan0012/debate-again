import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// Define the shape of the data we want to fetch
type RecentRound = {
  id: string;
  topic: string;
  status: string;
  createdAt: Date;
};

export default async function ProfilePage() {
  // 1. Verify Session
  const session = await getSession();
  if (!session?.userId) redirect('/login');

  let user;
  // Explicitly type the array so TypeScript knows what it contains
  let recentRounds: RecentRound[] = [];

  try {
    // 2. Fetch User Data
    user = await prisma.user.findUnique({
      where: { id: String(session.userId) },
    });

    // 3. Fetch Recent 3 Rounds
    if (user) {
      recentRounds = await prisma.round.findMany({
        where: {
          participants: {
            some: { userId: user.id }
          }
        },
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          topic: true,
          status: true,
          createdAt: true
        }
      });
    }

  } catch (error) {
    console.error("Database connection error:", error);
    return (
      <div className="min-h-screen bg-[#0B0C10] text-slate-300 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-red-400 mb-2">Unable to load profile</h2>
        <Link href="/" className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700 transition-colors">Return Home</Link>
      </div>
    );
  }

  // 4. Handle Missing User
  if (!user) {
    redirect('/login');
  }

  const debateCount = recentRounds.length; 

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0B0C10] text-slate-300 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 border-b border-zinc-800 pb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-3xl text-white font-bold shadow-2xl shadow-cyan-900/20">
              {user.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">{user.username || "Debater"}</h1>
              <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
                Level 1 • Novice Logician
              </p>
            </div>
          </div>
          
          <div className="mt-6 md:mt-0 flex gap-4">
            <Link href="/create" className="px-6 py-3 bg-white text-black font-bold text-sm uppercase tracking-wider rounded hover:bg-zinc-200 transition-colors">
              + New Argument
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Recent Debates", value: debateCount, color: "text-white" },
            { label: "Win Rate", value: "N/A", color: "text-zinc-500" }, 
            { label: "AI Analysis Score", value: "8.5", color: "text-cyan-400" }, 
          ].map((stat, i) => (
            <div key={i} className="glass-panel p-6 rounded-xl border border-white/5 bg-zinc-900/30">
              <div className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-2">
                {stat.label}
              </div>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
            Recent Rounds
          </h2>
          
          <div className="grid gap-4">
            {recentRounds.length > 0 ? (
               recentRounds.map((round) => (
                // FIX: Updated link to /debate/
                <Link key={round.id} href={`/debate/${round.id}`} className="block">
                  <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors group cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                          {round.topic}
                        </div>
                        <div className="text-zinc-600 text-xs mt-1">
                          {new Date(round.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        round.status === 'ACTIVE' 
                          ? 'bg-green-900/30 text-green-400 border border-green-900' 
                          : 'bg-zinc-800 text-zinc-500'
                      }`}>
                        {round.status}
                      </div>
                    </div>
                  </div>
                </Link>
               ))
            ) : (
              <div className="text-zinc-600 text-center py-12 border border-dashed border-zinc-800 rounded-xl">
                No active debates found. Start your first argument.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}