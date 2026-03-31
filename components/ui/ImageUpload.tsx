import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { uploadImage, deleteImage } from '../../utils/uploadImage';

interface ImageUploadProps {
  currentUrl?: string;
  onUpload: (url: string) => void;
  onMultiUpload?: (urls: string[]) => void; // For multiple file upload
  onDelete?: () => void;
  folder: 'logos' | 'menus' | 'profiles';
  label?: string;
  className?: string;
  compact?: boolean;
  multiple?: boolean; // Allow selecting multiple files
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentUrl,
  onUpload,
  onMultiUpload,
  onDelete,
  folder,
  label = 'Upload Image',
  className = '',
  compact = false,
  multiple = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB.');
      return;
    }

    setError(null);
    setUploading(true);

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      const url = await uploadImage(file, folder);

      // Delete old image if replacing
      if (currentUrl) {
        await deleteImage(currentUrl);
      }

      onUpload(url);
      setPreview(null);
      URL.revokeObjectURL(localPreview);
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
      setPreview(null);
      URL.revokeObjectURL(localPreview);
    } finally {
      setUploading(false);
    }
  }, [folder, currentUrl, onUpload]);

  const handleMultipleFiles = useCallback(async (files: File[]) => {
    const validFiles = files.filter(f => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024);
    if (validFiles.length === 0) {
      setError('No valid image files selected.');
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(`Uploading 0/${validFiles.length}...`);

    const uploadedUrls: string[] = [];
    try {
      for (let i = 0; i < validFiles.length; i++) {
        setUploadProgress(`Uploading ${i + 1}/${validFiles.length}...`);
        const url = await uploadImage(validFiles[i], folder);
        uploadedUrls.push(url);
      }
      onMultiUpload?.(uploadedUrls);
    } catch (err: any) {
      setError(`Upload failed after ${uploadedUrls.length}/${validFiles.length}: ${err.message}`);
      // Still report any that succeeded
      if (uploadedUrls.length > 0) onMultiUpload?.(uploadedUrls);
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }, [folder, onMultiUpload]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (multiple && files.length > 1) {
      handleMultipleFiles(Array.from(files));
    } else {
      handleFile(files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    if (multiple && files.length > 1) {
      handleMultipleFiles(Array.from(files));
    } else {
      handleFile(files[0]);
    }
  }, [handleFile, handleMultipleFiles, multiple]);

  const handleRemove = async () => {
    if (currentUrl) {
      await deleteImage(currentUrl);
    }
    onDelete?.();
    setPreview(null);
    setError(null);
  };

  const displayUrl = preview || currentUrl;

  // Compact variant for inline use
  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Preview thumbnail */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 flex-shrink-0">
          {displayUrl ? (
            <>
              <img src={displayUrl} alt="" className="w-full h-full object-cover" />
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 size={18} className="animate-spin text-white" />
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon size={20} className="text-gray-400" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : currentUrl ? 'Replace' : 'Upload'}
          </button>
          {currentUrl && onDelete && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="px-3 py-1.5 text-xs font-bold rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  // Full variant with drag & drop
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      <div
        className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${
          dragOver
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-slate-600 hover:border-primary-400'
        } ${uploading ? 'pointer-events-none opacity-70' : 'cursor-pointer'}`}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {displayUrl ? (
          // Preview state
          <div className="relative p-3">
            <img
              src={displayUrl}
              alt="Preview"
              className="w-full h-40 object-contain rounded-lg"
            />

            {/* Upload overlay */}
            {uploading && (
              <div className="absolute inset-3 flex items-center justify-center bg-black/50 rounded-lg">
                <div className="text-center text-white">
                  <Loader2 size={28} className="animate-spin mx-auto mb-2" />
                  <p className="text-sm font-medium">{uploadProgress || 'Compressing & uploading...'}</p>
                </div>
              </div>
            )}

            {/* Remove button */}
            {!uploading && currentUrl && onDelete && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                className="absolute top-5 right-5 w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ) : (
          // Empty state
          <div className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
              <Upload size={22} className={`${dragOver ? 'text-primary-500' : 'text-gray-400'}`} />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {uploading ? (uploadProgress || 'Uploading...') : dragOver ? 'Drop image(s) here' : multiple ? 'Click or drag & drop multiple images' : 'Click or drag & drop'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              JPG, PNG up to 10MB • Auto-compressed{multiple ? ' • Select multiple' : ''}
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
      />

      {error && (
        <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
          <X size={14} /> {error}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
