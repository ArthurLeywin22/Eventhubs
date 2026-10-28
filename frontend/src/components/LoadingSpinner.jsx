import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading...', size = 'default' }) {
  const sizeClasses = {
    small: 'w-5 h-5',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-3 text-slate-500">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.default} animate-spin text-indigo-600`} />
      {text && <p className="text-sm font-medium tracking-wide text-slate-600 animate-pulse">{text}</p>}
    </div>
  );
}
