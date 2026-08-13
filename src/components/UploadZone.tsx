import React, { useState, useRef } from 'react';
import { Upload, Loader2, FileText, Image as ImageIcon, AlertCircle, Sparkles } from 'lucide-react';

interface UploadZoneProps {
  onExtractSuccess: (ackNo: string, bankName: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onExtractSuccess, isLoading, setIsLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>('');
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

  const processFile = async (file: File) => {
    if (!file) return;

    setErrorMsg(null);
    setIsLoading(true);
    setStatusMsg('Reading notice PDF / image...');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const resultStr = e.target?.result as string;
          const base64Data = resultStr.split(',')[1] || resultStr;

          setStatusMsg('Extracting Ack No & Bank Name with AI...');

          const response = await fetch('/api/extract-notice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileBase64: base64Data,
              mimeType: file.type,
            }),
          });

          const resData = await response.json();

          if (!response.ok || !resData.success) {
            throw new Error(resData.error || resData.details || 'Failed to extract notice data');
          }

          const ext = resData.data;
          onExtractSuccess(ext.ackNo || '', ext.bankName || '');
          setStatusMsg('Extracted successfully!');
        } catch (err: any) {
          console.error(err);
          setErrorMsg(err.message || 'Error parsing document');
        } finally {
          setIsLoading(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMsg('Failed to read file');
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
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150 ${
          dragActive
            ? 'border-amber-500 bg-amber-500/10'
            : 'border-slate-600 hover:border-amber-400 bg-slate-900/50 hover:bg-slate-900/80'
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
                Upload police notice to automatically fetch <span className="text-amber-400 font-semibold">Ack No</span> & <span className="text-amber-400 font-semibold">Bank Name</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="mt-3 p-3 bg-red-950/50 border border-red-800 rounded-xl flex items-center space-x-2 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
