import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, RefreshCw, Copy } from 'lucide-react';

interface ResumeUploadProps {
  onUploadSuccess: (fileName: string, rawText: string) => void;
  id?: string;
}

// Preset resume profiles to let the viewer test easily!
const MOCK_PROFILES = [
  {
    name: '🌟 Senior Front-End template',
    fileName: 'sarah_react_developer.pdf',
    skills: 'Expert in React, TypeScript, Tailwind CSS, Vite, State Management and Cypress testing engines. Over 6 years leading frontend systems.'
  },
  {
    name: '🐍 Pure Backend template',
    fileName: 'jacob_django_postgres.pdf',
    skills: 'Passionate Python developer skilled in FastAPI, SQL Postgres databases and Redis memory stores. Deep Docker and API engineering.'
  },
  {
    name: '🎨 Product Designer template',
    fileName: 'sophia_figma_ux.pdf',
    skills: 'UX Researcher and UI Designer. Fluent in Figma design systems, prototyping, wireframes, and validating design tokens.'
  }
];

export const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUploadSuccess, id }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [currentFile, setCurrentFile] = useState<{ name: string; size: string } | null>(null);
  const [customText, setCustomText] = useState('');
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'analyzing' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    setCurrentFile({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
    });
    startUploadFlow(file.name);
  };

  const selectPresetProfile = (preset: typeof MOCK_PROFILES[0]) => {
    setCurrentFile({ name: preset.fileName, size: '420 KB' });
    setCustomText(preset.skills);
    startUploadFlow(preset.fileName, preset.skills);
  };

  const startUploadFlow = (filename: string, textToAnalyze?: string) => {
    setUploadState('uploading');
    setProgress(0);

    // Simulate upload timer
    const uploadInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(uploadInterval);
          // Transition to analysis
          setUploadState('analyzing');
          startAnalysisFlow(filename, textToAnalyze || customText);
          return 100;
        }
        return p + 20;
      });
    }, 150);
  };

  const startAnalysisFlow = (filename: string, text: string) => {
    // Simulate AI parsing
    setTimeout(() => {
      setUploadState('completed');
      onUploadSuccess(filename, text || `Raw text content of ${filename}. Expert React developer skilled in Tailwind CSS, TypeScript, and local layouts.`);
    }, 1400);
  };

  const resetUpload = () => {
    setUploadState('idle');
    setCurrentFile(null);
    setProgress(0);
    setCustomText('');
  };

  return (
    <div id={id || "resume-upload-wrapper"} className="space-y-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => uploadState === 'idle' && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[220px] ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20'
            : uploadState === 'idle'
            ? 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/10 hover:bg-zinc-50/40 dark:hover:bg-[#121214]'
            : 'border-zinc-150 dark:border-zinc-805 bg-white dark:bg-zinc-900'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.txt"
          className="hidden"
        />

        {uploadState === 'idle' && (
          <div className="space-y-1.5 max-w-sm">
            <div className="p-3.5 rounded-full bg-zinc-100 dark:bg-zinc-850/70 text-zinc-500 dark:text-zinc-400 inline-block mb-2 ring-6 ring-zinc-50 dark:ring-zinc-900/30">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
              Drag and drop your resume file
            </h4>
            <p className="text-xs text-zinc-400 leading-normal font-medium">
              Supports PDF, DOCX, DOC, or TXT (Max 5MB)
            </p>
            <div className="pt-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 text-indigo-600 dark:text-indigo-400">
                Browse Files
              </span>
            </div>
          </div>
        )}

        {uploadState === 'uploading' && (
          <div className="w-full max-w-xs space-y-4">
            <FileText className="w-10 h-10 text-indigo-500 mx-auto animate-bounce" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100 truncate">
                Uploading {currentFile?.name}
              </p>
              <p className="text-[10px] text-zinc-400">{currentFile?.size}</p>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {uploadState === 'analyzing' && (
          <div className="w-full max-w-xs space-y-3.5 py-4">
            <RefreshCw className="w-10 h-10 text-indigo-500 mx-auto animate-spin" />
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100 flex items-center justify-center gap-1.5">
                AI Parser scan active...
              </p>
              <div className="text-[10px] text-zinc-400 font-medium space-y-0.5 animate-pulse">
                <p>🔍 Locating background sections</p>
                <p>🏷️ Extracting framework credentials</p>
                <p>📈 Correlating relative skill weight</p>
              </div>
            </div>
          </div>
        )}

        {uploadState === 'completed' && (
          <div className="w-full max-w-xs space-y-3">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-55 truncate">
                Analysis complete!
              </p>
              <p className="text-[10px] text-zinc-400">{currentFile?.name}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetUpload();
              }}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 underline cursor-pointer"
            >
              Upload another file
            </button>
          </div>
        )}
      </div>

      {uploadState === 'idle' && (
        <div className="border border-zinc-150 dark:border-zinc-805 rounded-2xl p-5 bg-white dark:bg-zinc-900/60 shadow-xs">
          <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-3">
            Quick Testing Tools
          </span>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-normal">
            No real resume file around? Click our pre-packaged profiles below to see the platform match automatically!
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {MOCK_PROFILES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectPresetProfile(preset)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block">
              Or, type/paste custom resume text details:
            </label>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="E.g., Senior designer with 4 years Figma layout experience drafting custom prototypes and setting wireframes."
              rows={3}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 text-xs bg-zinc-50/50 dark:bg-zinc-950/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      )}
    </div>
  );
};
