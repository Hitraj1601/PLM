import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[90vw]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizeClasses[size]} max-h-[90vh] bg-navy-800 border border-navy-600 rounded-2xl shadow-2xl animate-scale-in flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-600">
          <h3 className="text-lg font-semibold text-gainsboro-100">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gainsboro-400 hover:text-gainsboro-200 hover:bg-navy-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
