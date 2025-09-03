
import React, { useState, useEffect, useCallback } from 'react';
import { PalmistryInputData } from '../types';

interface PalmistryInputProps {
  onChange: (data: PalmistryInputData) => void;
  initialData?: PalmistryInputData;
}

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const PalmistryInput: React.FC<PalmistryInputProps> = ({ onChange, initialData }) => {
  const [imageBase64, setImageBase64] = useState<string | undefined>(initialData?.imageData);
  const [fileName, setFileName] = useState<string | undefined>(initialData?.fileName);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(initialData?.imageData ? `data:image/unknown;base64,${initialData.imageData}` : undefined);


  useEffect(() => {
    // If initialData provides imageData, set the preview.
    // This assumes initialData.imageData is a valid base64 string for an image.
    if (initialData?.imageData && !previewUrl) {
      setPreviewUrl(`data:image/jpeg;base64,${initialData.imageData}`); // Assuming jpeg or png, type might not be known
    }
  }, [initialData, previewUrl]);


  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
        setImageBase64(undefined);
        setFileName(undefined);
        setPreviewUrl(undefined);
        onChange({ imageData: undefined, fileName: undefined });
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Invalid file type. Please upload an image (JPEG, PNG, GIF, WEBP).');
        setImageBase64(undefined);
        setFileName(undefined);
        setPreviewUrl(undefined);
        onChange({ imageData: undefined, fileName: undefined });
        return;
      }
      
      setError(null);
      setFileName(file.name);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImageBase64(base64String);
        setPreviewUrl(reader.result as string);
        onChange({ imageData: base64String, fileName: file.name });
      };
      reader.onerror = () => {
        setError("Failed to read file.");
        onChange({ imageData: undefined, fileName: undefined });
      }
      reader.readAsDataURL(file);
    } else {
      // No file selected or selection cancelled
      setImageBase64(undefined);
      setFileName(undefined);
      setPreviewUrl(undefined);
      onChange({ imageData: undefined, fileName: undefined });
    }
  }, [onChange]);
  
  return (
    <div>
      <label htmlFor="palm-image-upload" className="block text-sm font-medium text-slate-300 mb-1">
        Upload Image of Your Dominant Palm
      </label>
      <input
        type="file"
        id="palm-image-upload"
        accept="image/jpeg, image/png, image/gif, image/webp"
        onChange={handleFileChange}
        className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
        aria-describedby="palm-image-hint"
      />
      <p id="palm-image-hint" className="text-xs text-slate-400 mt-1">
        Provide a clear, well-lit image of your dominant hand's palm. Max {MAX_FILE_SIZE_MB}MB.
      </p>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      {previewUrl && (
        <div className="mt-4">
          <p className="text-sm text-slate-300 mb-1">Image Preview ({fileName}):</p>
          <img 
            src={previewUrl} 
            alt="Palm preview" 
            className="max-w-full h-auto max-h-48 rounded-lg border border-slate-500 object-contain" 
          />
        </div>
      )}
    </div>
  );
};
