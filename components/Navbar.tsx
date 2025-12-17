import Link from 'next/link';
import { getSession } from '@/lib/session';
import { logout } from '@/app/actions/auth';

export default async function Navbar() {
  // Safe session check
  const session = await getSession();
  const isLoggedIn = !!session?.userId;

  // Initial (User letter or fallback)
  const userInitial = session?.userId ? 'U' : 'G'; 

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight text-white hover:text-cyan-400 transition-colors">
          ARGUELY
        </Link>
        
        <div className="flex items-center gap-6">
          {/* Main Nav Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            {isLoggedIn && (
              <>
                <Link href="/start" className="hover:text-white transition-colors">New Debate</Link>
                <Link href="/history" className="hover:text-white transition-colors">History</Link>
              </>
            )}
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
          </div>
          
          <div className="h-4 w-px bg-zinc-800 hidden md:block"></div>

          {/* Dynamic Auth Section */}
          <div className="flex items-center gap-4 text-sm font-medium">
            {isLoggedIn ? (
              // --- STATE: LOGGED IN ---
              <div className="flex items-center gap-4">
                <Link href="/profile">
                  <div className="w-8 h-8 rounded-full bg-linear-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-cyan-900/20 hover:scale-105 transition-transform">
                    {userInitial}
                  </div>
                </Link>
                
                <form action={logout}>
                  <button className="text-zinc-500 hover:text-red-400 text-xs uppercase tracking-wider transition-colors">
                    Log Out
                  </button>
                </form>
              </div>
            ) : (
              // --- STATE: LOGGED OUT ---
              <>
                <Link href="/login" className="text-zinc-400 hover:text-white transition-colors">
                  Log in
                </Link>
                <Link 
                  href="/signup" 
                  className="px-4 py-2 bg-cyan-900/30 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-800/50 transition-all text-xs uppercase tracking-widest font-bold"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}