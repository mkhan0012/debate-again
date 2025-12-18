'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function ChatRefresher() {
  const router = useRouter()

  useEffect(() => {
    // Refresh the page data every 3 seconds to pull new messages
    const interval = setInterval(() => {
      router.refresh()
    }, 3000)

    return () => clearInterval(interval)
  }, [router])

  return null // It renders nothing visibly
}