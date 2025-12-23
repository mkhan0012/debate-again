'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { logActivity } from '@/app/actions/logger';

export default function ActivityTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const startTime = useRef(Date.now());

  // 1. Track Page Views (Where they came from/went)
  useEffect(() => {
    // Log the page view immediately
    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    logActivity({
      eventType: 'PAGE_VIEW',
      pageUrl: url,
      action: `Visited ${pathname}`
    });

    // Reset timer for the new page
    startTime.current = Date.now();

  }, [pathname, searchParams]);

  // 2. Track Tab Closing / Leaving (Where they left)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Calculate time spent on the final page
      const timeSpent = Date.now() - startTime.current;
      
      // We use navigator.sendBeacon if possible for reliability during unload, 
      // but since we are using a Server Action, we can attempt a standard call 
      // or use a specialized endpoint. For simplicity here, we try the action:
      logActivity({
        eventType: 'EXIT',
        pageUrl: pathname,
        action: 'Session Ended / Tab Closed',
        metadata: { timeSpentMs: timeSpent }
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [pathname]);

  return null;
}