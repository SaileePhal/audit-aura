import React from 'react';
import { Loader2 } from 'lucide-react';
import { theme } from '@/config/theme';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  message = 'Loading...',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse"></div>
        
        {/* Spinning loader */}
        <Loader2 className={`${sizeClasses[size]} text-cyan-400 animate-spin relative z-10`} />
        
        {/* Inner pulse */}
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-ping"></div>
      </div>
      
      {message && (
        <div className="text-center">
          <p className={`${theme.text.primary} font-medium`}>{message}</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></div>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 ${theme.bg.primary} flex items-center justify-center z-50`}>
        <div className={`${theme.bg.card} p-8 rounded-2xl border ${theme.border.primary}`}>
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
};

// Made with Bob
