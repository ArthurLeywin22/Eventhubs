import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ message = 'An unexpected error occurred.', onRetry }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-rose-800 flex items-start gap-3 my-4">
      <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-rose-900">Action Failed</h4>
        <p className="text-sm text-rose-700 mt-0.5">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-rose-300 hover:bg-rose-100 text-rose-800 text-xs font-semibold rounded-lg transition-colors shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      )}
    </div>
  );
}
