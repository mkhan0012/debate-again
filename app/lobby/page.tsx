import Link from 'next/link'
import { getOpenChambers } from '@/app/actions/lobby'
import { Users, Sword, Clock, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export const dynamic = 'force-dynamic' // Ensure list is always fresh

export default async function LobbyPage() {
  const chambers = await getOpenChambers();

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-300 font-sans p-6 pt-24">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Open Chambers</h1>
            <p className="text-zinc-500">Select a topic to enter the arena.</p>
          </div>
          <Link href="/create">
            <button className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2">
              <Sword className="w-4 h-4" />
              Create Your Own
            </button>
          </Link>
        </div>

        {/* List of Rooms */}
        {chambers.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-zinc-800 border-dashed">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Active Duels</h3>
            <p className="text-zinc-500 mb-6">Be the first to start a controversy.</p>
            <Link href="/create">
              <button className="text-cyan-400 hover:text-cyan-300 font-bold">Start a Debate &rarr;</button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chambers.map((room) => {
              const host = room.participants[0]?.user?.username || 'Anonymous';
              
              return (
                <Link key={room.id} href={`/debate/${room.id}`}>
                  <div className="group relative bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl hover:border-cyan-500/50 hover:bg-zinc-900 transition-all cursor-pointer">
                    
                    {/* Status Dot */}
                    <div className="absolute top-6 right-6 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Open</span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-4 pr-16 group-hover:text-cyan-400 transition-colors truncate">
                      {room.topic}
                    </h3>

                    <div className="flex items-center gap-6 text-sm text-zinc-500">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>vs {host}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatDistanceToNow(new Date(room.createdAt))} ago</span>
                      </div>
                    </div>

                    {/* Hover Arrow */}
                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                      <ArrowRight className="w-5 h-5 text-cyan-400" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}