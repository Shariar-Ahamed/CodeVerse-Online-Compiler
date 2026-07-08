import React, { useEffect } from 'react';

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  let icon = <i className="fas fa-info-circle text-indigo-600 dark:text-indigo-400"></i>;
  if (type === 'success') {
    icon = <i className="fas fa-check-circle text-emerald-600 dark:text-emerald-400"></i>;
  } else if (type === 'error') {
    icon = <i className="fas fa-exclamation-circle text-rose-500"></i>;
  }

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2 pointer-events-none">
      <div className="px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 transform transition-all duration-300 pointer-events-auto max-w-sm toast-notification text-sm animate-fade-in-up">
        {icon}
        <span className="text-[var(--text-primary)] font-semibold">{message}</span>
      </div>
    </div>
  );
}
