import React from 'react';
import { PRESETS } from '../data/presets';
import { X, Shield, ArrowRight } from 'lucide-react';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (ackNo: string, bankName: string) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-700 relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Sample Notices</h3>
            <p className="text-xs text-slate-400">Select a pre-filled sample to test</p>
          </div>
        </div>

        <div className="space-y-3 my-4">
          {PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => {
                onSelect(preset.ackNo, preset.bankName);
                onClose();
              }}
              className="p-4 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 hover:border-amber-500/50 transition cursor-pointer flex items-center justify-between group"
            >
              <div>
                <p className="font-bold text-sm text-slate-100 group-hover:text-amber-300 transition">
                  {preset.title}
                </p>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Ack: <span className="text-amber-400">{preset.ackNo}</span> | Bank: <span className="text-slate-200">{preset.bankName}</span>
                </p>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
