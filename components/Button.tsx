import React from 'react';
import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary';
  className?: string;
  onClick?: () => void;
}

export default function Button({ children, href, variant = 'primary', className = '', onClick }: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 text-sm font-medium tracking-wide transition-all duration-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent";
  
  const variants = {
    primary: "bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.25)]",
    secondary: "bg-transparent text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-600"
  };

  const combinedClasses = `${baseStyles} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} onClick={onClick}>
      {children}
    </button>
  );
}