'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { checkOpponentJoined } from '@/app/actions/check-status'
import { UserPlus, Copy, Loader2, CheckCircle2 } from 'lucide-react'

export function WaitingRoom({ roundId }: { roundId: string }) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [inviteLink, setInviteLink] = useState("Loading...") // Default state matches server

  useEffect(() => {
    // 1. Set the correct URL now that we are on the client
    if (typeof window !== 'undefined') {
      setInviteLink(`${window.location.origin}/debate/${roundId}`)
    }

    // 2. Poll the server every 3 seconds
    const interval = setInterval(async () => {
      const opponentHasJoined = await checkOpponentJoined(roundId)
      
      if (opponentHasJoined) {
        setIsReady(true)
        router.refresh() 
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [roundId, router])

  const copyLink = () => {
    if (typeof window === 'undefined') return
    const url = `${window.location.origin}/debate/${roundId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isReady) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 border border-green-500/20">
           <CheckCircle2 className="w-8 h-8 text-green-500 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-white">Opponent Connected!</h2>
        <p className="text-zinc-500">Entering arena...</p>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl text-center max-w-md mx-auto my-20 animate-fade-in-up">
      <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl relative">
        <UserPlus className="w-8 h-8 text-zinc-400" />
        <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-1 border border-zinc-800">
          <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-2">Waiting for Opponent</h3>
      <p className="text-zinc-500 text-sm mb-8">
        Share this link. The game will start <b>automatically</b> when they join.
      </p>
      
      <button 
        onClick={copyLink}
        className="group relative w-full flex gap-3 bg-black/50 p-4 rounded-xl border border-zinc-800 hover:border-zinc-600 transition-all text-left items-center hover:bg-zinc-900/80 cursor-pointer"
      >
        <div className="flex-1 overflow-hidden">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">
            Secure Invite Link
          </p>
          <code className="text-xs text-cyan-400 font-mono truncate block opacity-80 group-hover:opacity-100">
            {inviteLink}
          </code>
        </div>
        
        <div className={`p-2 rounded-lg border transition-all ${copied ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-zinc-800 border-zinc-700 text-zinc-400 group-hover:text-white'}`}>
           {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        </div>
      </button>
    </div>
  )
}