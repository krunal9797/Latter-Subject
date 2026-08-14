import React, { useState, useRef } from 'react';
import { Upload, Loader2, FileText, AlertCircle, Sparkles, Clipboard, CheckCircle2, ShieldCheck } from 'lucide-react';
import { extractTextFromPdf, parseNoticeText } from '../utils/pdfParser';

interface UploadZoneProps {
  onExtractSuccess: (ackNo: string, bankName: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onExtractSuccess, isLoading, setIsLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [activeMode, setActiveMode] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handlePastedTextExtract = () => {
    if (!pastedText.trim()) {
      setErrorMsg('Please paste notice text first.');
      return;
    }
    setErrorMsg(null);
    setSuccessInfo(null);

    const { ackNo, bankName } = parseNoticeText(pastedText);

    if (ackNo || bankName) {
      onExtractSuccess(ackNo, bankName);
      setSuccessInfo(
        `Successfully extracted: ${ackNo ? `Ack: ${ackNo}` : 'Ack not found'} ${bankName ? `| Bank: ${bankName}` : ''}`
      );
    } else {
      setErrorMsg('Could not find Ack No or Bank name in the pasted text. Please enter them manually below.');
    }
  };

  const processFile = async (file: File) => {
    if (!file) return;

    setErrorMsg(null);
    setSuccessInfo(null);
    setIsLoading(true);
    setStatusMsg('Reading notice document...');

    try {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

      // 1. If it's a PDF, try ultra-fast 100% client-side parsing first (Works on GitHub Pages & offline!)
      if (isPdf) {
        setStatusMsg('Analyzing PDF text in browser...');
        try {
          const rawText = await extractTextFromPdf(file);
          if (rawText && rawText.trim().length > 20) {
            const { ackNo, bankName } = parseNoticeText(rawText);
            if (ackNo || bankName) {
              onExtractSuccess(ackNo, bankName);
              setSuccessInfo(`Browser OCR: Found Ack: ${ackNo || 'N/A'}, Bank: ${bankName || 'N/A'}`);
              setIsLoading(false);
              return;
            }
          }
        } catch (pdfErr) {
          console.warn('Client-side PDF parse fallback to AI:', pdfErr);
        }
      }

      // 2. If client-side didn't extract or if it's an image scan, call server AI OCR
      setStatusMsg('Extracting with AI OCR...');
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const resultStr = e.target?.result as string;
          const base64Data = resultStr.split(',')[1] || resultStr;

          const response = await fetch('/api/extract-notice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileBase64: base64Data,
              mimeType: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
            }),
          });

          const rawResponseText = await response.text();

          // Check if response is HTML (like 404 from GitHub Pages / proxy / web server error)
          if (!rawResponseText.trim().startsWith('{')) {
            // Server returned HTML or non-JSON error
            if (rawResponseText.includes('cannot') || response.status === 404 || rawResponseText.includes('<html')) {
              throw new Error(
                'Static hosting detected (GitHub Pages does not run node server). Please use digital PDF, paste notice text in the "Paste Text" tab, or enter ACK & Bank below.'
              );
            }
            throw new Error(`Server returned non-JSON response (${response.status})`);
          }

          const resData = JSON.parse(rawResponseText);

          if (!response.ok || !resData.success) {
            throw new Error(resData.error || resData.details || 'Failed to extract notice data');
          }

          const ext = resData.data;
          onExtractSuccess(ext.ackNo || '', ext.bankName || '');
          setSuccessInfo(`AI OCR: Found Ack: ${ext.ackNo || 'N/A'}, Bank: ${ext.bankName || 'N/A'}`);
        } catch (err: any) {
          console.error(err);
          setErrorMsg(err.message || 'Error parsing notice file');
        } finally {
          setIsLoading(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMsg('Failed to read file from disk');
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
      {/* Mode Switcher Tabs: Upload File vs Paste Text */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-bold text-slate-200">
            Notice Input (Auto-Extract ACK & Bank)
          </span>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl text-xs font-semibold border border-slate-800">
          <button
            onClick={() => setActiveMode('upload')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'upload'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload PDF / Image</span>
          </button>

          <button
            onClick={() => setActiveMode('paste')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'paste'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Paste Notice Text</span>
          </button>
        </div>
      </div>

      {activeMode === 'upload' ? (
        /* Upload Area */
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150 ${
            dragActive
              ? 'border-amber-500 bg-amber-500/10'
              : 'border-slate-700 hover:border-amber-400 bg-slate-950/60 hover:bg-slate-950'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
            onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
            className="hidden"
          />

          {isLoading ? (
            <div className="py-2 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-sm font-semibold text-amber-300">{statusMsg}</p>
            </div>
          ) : (
            <div className="py-2 flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 bg-amber-500/10 rounded-full border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Upload className="w-6 h-6" />
              </div>

              <div>
                <p className="text-base font-bold text-slate-100">
                  Click to browse or Drag & Drop Notice PDF / Image
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Works offline & in-browser on GitHub Pages. Extracts <span className="text-amber-400 font-semibold">Ack No</span> & <span className="text-amber-400 font-semibold">Bank Name</span>
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Paste Notice Text Area */
        <div className="space-y-3">
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste your police notice text, email, or OCR copy here (e.g. Acknowledgement No. 31108260188320 ... To, Airtel Payments Bank ...)"
            rows={4}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none font-mono"
          />

          <div className="flex justify-end">
            <button
              onClick={handlePastedTextExtract}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Extract ACK & Bank from Text</span>
            </button>
          </div>
        </div>
      )}

      {/* Success Info Message */}
      {successInfo && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded-xl flex items-center space-x-2 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successInfo}</span>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3 bg-red-950/50 border border-red-800 rounded-xl flex items-center space-x-2 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="leading-relaxed">{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
