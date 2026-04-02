'use client';

import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { BrainIcon, ChartLineIcon, CheckCircleIcon } from './icons';

export interface UploadBoxProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  accept: string;
  label: string;
  hint: string;
  variant: 'model' | 'data';
}

export function UploadBox({ file, onFileSelect, accept, label, hint, variant }: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFileSelect(f);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFileSelect(f);
  };

  const isModel = variant === 'model';
  const uploaded = !!file;

  let boxClass =
    'relative flex flex-col items-center justify-center gap-2 h-28 rounded-lg border-2 border-dashed ' +
    'cursor-pointer transition-all duration-200 select-none ';

  if (uploaded) {
    boxClass += 'border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400';
  } else if (isDragging) {
    boxClass += isModel
      ? 'border-blue-500 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
      : 'border-slate-400 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400';
  } else {
    boxClass += isModel
      ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950 hover:border-blue-400'
      : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-400';
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Upload ${label}`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={boxClass}
      >
        {uploaded ? (
          <>
            <CheckCircleIcon className="w-6 h-6" />
            <span className="text-[11px] font-bold text-center px-3 w-full truncate leading-relaxed">
              {file.name}
            </span>
          </>
        ) : (
          <>
            {isModel
              ? <BrainIcon className="w-7 h-7" />
              : <ChartLineIcon className="w-7 h-7" />
            }
            <span className="text-[11px] font-medium text-center leading-relaxed">
              {hint}
              <span className="block text-[10px] opacity-50 mt-0.5">Click or drag &amp; drop</span>
            </span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
