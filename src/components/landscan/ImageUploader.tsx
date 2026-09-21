import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import {
  Upload,
  Image as ImageIcon,
  AlertCircle,
  FileCheck,
  X,
  Sparkles,
  Loader2,
  HardDrive,
  CheckCircle2,
} from 'lucide-react';

interface ImageUploaderProps {
  onAnalyze: (file: File) => void;
  isLoading: boolean;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  error: string | null;
  setError: (err: string | null) => void;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onAnalyze,
  isLoading,
  selectedFile,
  setSelectedFile,
  previewUrl,
  setPreviewUrl,
  error,
  setError,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const validateAndSelectFile = (file: File) => {
    setError(null);

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setError(`Unsupported file format. Please upload a .jpg, .jpeg, .png, or .webp image.`);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File size exceeds 10 MB limit (${formatFileSize(file.size)}). Please choose a smaller image.`);
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyzeClick = () => {
    if (!selectedFile) {
      setError('Please select or upload a terrain image first.');
      return;
    }
    onAnalyze(selectedFile);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm space-y-5">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Upload className="w-4 h-4 text-orange-600" />
            <span>Upload Land / Terrain Image</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select high-resolution satellite imagery, drone photography, or hill terrain aerial captures.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
          <HardDrive className="w-3.5 h-3.5 text-slate-400" />
          <span>Max: 10 MB (.jpg, .jpeg, .png, .webp)</span>
        </div>
      </div>

      {/* Error message banner */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-700 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Drag and drop upload area */}
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
            isDragOver
              ? 'border-orange-500 bg-orange-50/60 scale-[1.01]'
              : 'border-slate-300 hover:border-orange-400 bg-slate-50/70 hover:bg-orange-50/20'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-inner">
            <ImageIcon className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-800">
              Drag and drop your terrain image here, or{' '}
              <span className="text-orange-600 hover:underline">Browse Files</span>
            </p>
            <p className="text-xs text-slate-400">
              Supports RGB Optical Satellite Images, Drone Orthophotos, and High-Altitude Hill Surveys
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-500">
              .JPG
            </span>
            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-500">
              .PNG
            </span>
            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-500">
              .WEBP
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Up to 10 MB</span>
          </div>
        </div>
      ) : (
        /* Image Preview Area */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start p-4 rounded-2xl bg-slate-50 border border-slate-200">
          {/* Preview image */}
          <div className="md:col-span-1 relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 aspect-video flex items-center justify-center shadow-sm">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Selected terrain preview"
                className="w-full h-full object-contain"
              />
            )}
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono font-bold">
              Ready for Analysis
            </span>
          </div>

          {/* Details & Actions */}
          <div className="md:col-span-2 flex flex-col justify-between h-full space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 truncate" title={selectedFile.name}>
                    {selectedFile.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isLoading}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 hover:underline disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" /> Remove Image
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600">
                  <span className="text-slate-400 block text-[10px]">File Size</span>
                  <span className="font-mono font-bold text-slate-800">{formatFileSize(selectedFile.size)}</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600">
                  <span className="text-slate-400 block text-[10px]">Model Pipeline</span>
                  <span className="font-mono font-bold text-orange-600">14-Band U-Net</span>
                </div>
              </div>
            </div>

            {/* Analyze Button */}
            <div>
              <button
                type="button"
                onClick={handleAnalyzeClick}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:opacity-60 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-orange-900/20 transition-all active:scale-[0.98] cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing terrain image with U-Net...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Image for Landslide Risk</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
