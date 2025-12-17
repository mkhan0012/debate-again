interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string[];
  }
  
  export default function AuthInput({ label, error, ...props }: AuthInputProps) {
    return (
      <div className="space-y-2">
        <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
          {label}
        </label>
        <input
          {...props}
          className="w-full bg-black/40 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all"
        />
        {error && <p className="text-red-400 text-xs">{error[0]}</p>}
      </div>
    );
  }