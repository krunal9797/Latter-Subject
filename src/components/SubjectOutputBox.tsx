import React, { useState } from 'react';
import { Copy, Check, Mail, Scale, FileText, Lock, Plus, Sparkles } from 'lucide-react';
import { SUBJECT_TEMPLATES } from '../types';
import { generateSubject } from '../utils/formatters';

interface SubjectOutputBoxProps {
  ackNo: string;
  bankName: string;
  selectedTemplateId: string;
  onSelectTemplateId: (id: string) => void;
  customPrefix: string;
  setCustomPrefix: (val: string) => void;
}

export const SubjectOutputBox: React.FC<SubjectOutputBoxProps> = ({
  ackNo,
  bankName,
  selectedTemplateId,
  onSelectTemplateId,
  customPrefix,
  setCustomPrefix,
}) => {
  const [copied, setCopied] = useState(false);

  const currentTemplate = SUBJECT_TEMPLATES.find((t) => t.id === selectedTemplateId);
  const activePrefix = selectedTemplateId === 'custom' ? customPrefix : (currentTemplate?.template || SUBJECT_TEMPLATES[0].template);

  const fullSubject = generateSubject(ackNo, bankName, activePrefix);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullSubject);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-slate-900 border-2 border-amber-500/50 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <span className="p-2 bg-amber-500 text-slate-950 font-bold rounded-xl shadow-md">
            <Mail className="w-5 h-5" />
          </span>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-md border border-amber-500/30">
              Copyable Email Subject Line
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              Select type or copy formatted subject for bank email
            </p>
          </div>
        </div>
      </div>

      {/* Template Selector Pills */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Select Subject Type / Request Purpose:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {SUBJECT_TEMPLATES.map((tmpl) => {
            const isSelected = selectedTemplateId === tmpl.id;
            return (
              <button
                key={tmpl.id}
                onClick={() => onSelectTemplateId(tmpl.id)}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg scale-[1.01]'
                    : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  {tmpl.id === 'kyc-request' && <FileText className="w-4 h-4" />}
                  {tmpl.id === 'court-order-info' && <Scale className="w-4 h-4 text-amber-400 group-hover:text-amber-300" />}
                  {tmpl.id === 'lien-freeze' && <Lock className="w-4 h-4 text-amber-400" />}
                  <span className="text-xs font-bold">{tmpl.label}</span>
                </div>
                <span className={`text-[11px] truncate ${isSelected ? 'text-slate-900/90 font-medium' : 'text-slate-400'}`}>
                  "{tmpl.template}"
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Subject Output Box */}
      <div className="bg-slate-950 border border-amber-500/40 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-inner">
        <div className="font-mono text-base sm:text-lg font-bold text-amber-200 break-all leading-relaxed select-all">
          {fullSubject}
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
