import { useState, useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateImageFile, formatFileSize } from '@/lib/imageUtils';

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxFiles?: number;
}

export function ImageUpload({ images, onImagesChange, maxFiles = 2 }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [images, maxFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  }, [images, maxFiles]);

  const handleFiles = (files: File[]) => {
    if (images.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`);
      return;
    }

    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }
    }

    onImagesChange([...images, ...files]);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    setError('');
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          dragActive ? 'border-primary bg-primary/10' : 'border-gray-700 hover:border-gray-600',
          images.length >= maxFiles && 'opacity-50 cursor-not-allowed'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileInput}
          disabled={images.length >= maxFiles}
        />
        
        <label
          htmlFor="file-upload"
          className={cn(
            'cursor-pointer',
            images.length >= maxFiles && 'cursor-not-allowed'
          )}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">
            {images.length >= maxFiles
              ? 'Maximum files reached'
              : 'Drop images here or click to upload'
            }
          </p>
          <p className="text-sm text-gray-400">
            JPG or PNG • Max 10MB • {images.length}/{maxFiles} files
          </p>
        </label>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative card">
              <img
                src={URL.createObjectURL(image)}
                alt={`Upload ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg mb-2"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300 truncate flex-1">{image.name}</span>
                <span className="text-gray-400 ml-2">{formatFileSize(image.size)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
