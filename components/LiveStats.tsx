'use client';

import { useEffect, useState } from 'react';

export default function LiveStats() {
  const [stats, setStats] = useState({ online: 0, active: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to fetch fresh data
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch stats");
      }
    };

    // 1. Fetch immediately
    fetchStats();

    // 2. Refresh every 5 seconds
    const interval = setInterval(fetchStats, 5000);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono mb-8 opacity-50">
        <span className="w-2 h-2 rounded-full bg-slate-600"></span>
        <span>Connecting to Network...</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono mb-8 animate-fade-in transition-all duration-500">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      
      <span className="text-slate-400 font-bold tabular-nums">
        {stats.online}
      </span>
      <span className="text-slate-500">Thinkers Registered</span>
      
      <span className="text-slate-700 mx-1">|</span>
      
      <span className="text-blue-400 font-bold tabular-nums">
        {stats.active}
      </span>
      <span className="text-blue-500/80">Active Debates</span>
    </div>
  );
}