interface DebateCardProps {
    topic: string;
    position: 'For' | 'Against';
    date: string;
    outcome: string;
  }
  
  export default function DebateCard({ topic, position, date, outcome }: DebateCardProps) {
    return (
      <div className="glass-panel p-6 rounded-lg group glow-hover">
        <div className="flex justify-between items-start mb-4">
          <span className={`text-xs font-mono uppercase px-2 py-1 rounded border ${
            position === 'For' 
              ? 'border-green-900/50 text-green-400 bg-green-900/10' 
              : 'border-red-900/50 text-red-400 bg-red-900/10'
          }`}>
            {position}
          </span>
          <span className="text-xs font-mono text-zinc-500">{date}</span>
        </div>
        
        <h3 className="text-xl font-medium text-white mb-3 group-hover:text-accent transition-colors">
          {topic}
        </h3>
        
        <div className="border-t border-zinc-800 pt-3 mt-4">
          <p className="text-sm text-zinc-400 leading-relaxed">
            <span className="text-zinc-500 uppercase text-xs tracking-wider mr-2">Outcome:</span>
            {outcome}
          </p>
        </div>
      </div>
    );
  }