import React from 'react';
import { Mail, RefreshCw } from 'lucide-react';

interface NavbarProps {
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onReset }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-amber-500 p-2 rounded-xl text-slate-950 font-bold shadow-sm">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100">
              Notice Subject Line Generator
            </h1>
            <p className="text-xs text-slate-400">
              Upload PDF → Extract ACK & Bank → Copy Email Subject
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Sample</span>
        </button>
      </div>
    </header>
  );
};
