import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { UploadZone } from './components/UploadZone';
import { SubjectOutputBox } from './components/SubjectOutputBox';
import { PresetsModal } from './components/PresetsModal';
import { Building, Hash, Sparkles, ShieldAlert } from 'lucide-react';

export default function App() {
  const [ackNo, setAckNo] = useState<string>('31108260188320');
  const [bankName, setBankName] = useState<string>('Airtel Payments Bank');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('kyc-request');
  const [customPrefix, setCustomPrefix] = useState<string>('');
  const [isPresetsOpen, setIsPresetsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleExtractSuccess = (extractedAck: string, extractedBank: string) => {
    if (extractedAck) setAckNo(extractedAck);
    if (extractedBank) setBankName(extractedBank);
  };

  const handleReset = () => {
    setAckNo('31108260188320');
    setBankName('Airtel Payments Bank');
    setSelectedTemplateId('kyc-request');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <Navbar onReset={handleReset} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        <UploadZone
          onExtractSuccess={handleExtractSuccess}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />

        <SubjectOutputBox
          ackNo={ackNo}
          bankName={bankName}
          selectedTemplateId={selectedTemplateId}
          onSelectTemplateId={setSelectedTemplateId}
          customPrefix={customPrefix}
          setCustomPrefix={setCustomPrefix}
        />

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Notice Details (ACK & Bank Name)
            </h2>

            <button
              onClick={() => setIsPresetsOpen(true)}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Preset Samples</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-amber-400" />
                <span>Acknowledgement / Case No (ACK)</span>
              </label>
              <input
                type="text"
                value={ackNo}
                onChange={(e) => setAckNo(e.target.value)}
                placeholder="e.g. 31108260188320"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-base font-mono font-bold text-amber-300 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-amber-400" />
                <span>Bank Name</span>
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. Airtel Payments Bank"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-base font-semibold text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center space-x-1.5">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <span>Notice Subject Line Generator (KYC, Court Order & Lien)</span>
        </div>
      </footer>

      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelect={(ack, bank) => {
          setAckNo(ack);
          setBankName(bank);
        }}
      />
    </div>
  );
}
