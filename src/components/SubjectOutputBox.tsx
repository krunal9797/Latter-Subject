import React, { useState } from 'react';
import { Copy, Check, Mail, Sparkles } from 'lucide-react';
import { generateSubject } from '../utils/formatters';

interface SubjectOutputBoxProps {
  ackNo: string;
  bankName: string;
}

export const SubjectOutputBox: React.FC<SubjectOutputBoxProps> = ({ ackNo, bankName }) => {
  const [copied, setCopied] = useState(false);
  const subject = generateSubject(ackNo, bankName);

  const handleCopy = () => {
    navigator.clipboard.writeText(subject);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="p-2 bg-amber-500 text-slate-950 font-bold rounded-xl shadow-md">
            <Mail className="w-5 h-5" />
          </span>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-md border border-amber-500/30">
              Copyable Email Subject Line
            </span>
            <p className="text-xs text-slate-400 mt-1">
              Exact subject required for bank KYC & transaction requests
            </p>
          </div>
        </div>
      </div>

      {/* Main Subject Box */}
      <div className="bg-slate-950 border border-amber-500/40 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-inner">
        <div className="font-mono text-base sm:text-lg font-bold text-amber-200 break-all leading-relaxed select-all">
          {subject}
        </div>

        <button
          onClick={handleCopy}
          className={`flex-shrink-0 flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 cursor-pointer shadow-lg ${
            copied
              ? 'bg-emerald-500 text-slate-950 scale-105'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 hover:shadow-amber-500/25 active:scale-95'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              <span>COPIED!</span>
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              <span>COPY SUBJECT</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
