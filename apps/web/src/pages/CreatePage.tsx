import { useState, useEffect } from 'react';
import { GenerateOptions } from '@rapper-toon-sheet/shared';
import { ImageUpload } from '@/components/ImageUpload';
import { OptionsForm } from '@/components/OptionsForm';
import { ResultViewer } from '@/components/ResultViewer';
import { Stepper } from '@/components/Stepper';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { generateSheet, getGeneration } from '@/lib/api';
import { compressImage } from '@/lib/imageUtils';
import { saveToLocalStorage } from '@/lib/storage';
import { AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

export function CreatePage() {
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [options, setOptions] = useState<GenerateOptions>({
    stylePreset: 'cartoon_realism',
    layout: 'single_poster',
    background: 'neon_city_blur',
    includeTurnaround: true,
    includeActionPoses: true,
    faceConsistencyLock: false
  });
  const [generationId, setGenerationId] = useState<string>('');
  const [outputUrl, setOutputUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleNext = () => {
    if (step === 0 && images.length === 0) {
      setError('Please upload at least one image');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(Math.max(0, step - 1));
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError('');
      setStatusMessage('Compressing images...');

      // Compress images
      const compressedImages = await Promise.all(
        images.map(img => compressImage(img))
      );

      setStatusMessage('Uploading to server...');
      const response = await generateSheet(compressedImages, options);
      setGenerationId(response.id);

      setStatusMessage('Generation in progress...');
      setStep(2);

      // Poll for completion
      pollGeneration(response.id);
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to generate sheet');
      setIsGenerating(false);
    }
  };

  const pollGeneration = async (id: string) => {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    const poll = async () => {
      try {
        const result = await getGeneration(id);

        if (result.status === 'completed') {
          setOutputUrl(result.outputUrl || '');
          setIsGenerating(false);
          setStep(3);
          setStatusMessage('');

          // Save to local storage
          saveToLocalStorage({
            id: result.id,
            status: result.status,
            outputUrl: result.outputUrl,
            options,
            createdAt: result.createdAt
          });
        } else if (result.status === 'failed') {
          setError(result.error || 'Generation failed');
          setIsGenerating(false);
          setStatusMessage('');
        } else if (attempts < maxAttempts) {
          attempts++;
          setStatusMessage(`Generating... (${Math.round((attempts / maxAttempts) * 100)}%)`);
          setTimeout(poll, 5000);
        } else {
          setError('Generation timeout. Please try again.');
          setIsGenerating(false);
          setStatusMessage('');
        }
      } catch (err) {
        console.error('Polling error:', err);
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 5000);
        } else {
          setError('Failed to check generation status');
          setIsGenerating(false);
        }
      }
    };

    poll();
  };

  const handleDownload = () => {
    if (outputUrl) {
      const link = document.createElement('a');
      link.href = outputUrl;
      link.download = `character-sheet-${generationId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setStep(0);
    setImages([]);
    setGenerationId('');
    setOutputUrl('');
    setError('');
    setStatusMessage('');
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-4xl font-bold mb-2 text-center">Create Your Character Sheet</h1>
      <p className="text-gray-400 text-center mb-8">
        Upload your photos and customize your character reference sheet
      </p>

      <Stepper currentStep={step} />

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6 flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 0: Upload */}
      {step === 0 && (
        <div className="card">
          <h2 className="text-2xl font-semibold mb-6">Upload Photos</h2>
          <ImageUpload images={images} onImagesChange={setImages} maxFiles={2} />
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleNext}
              disabled={images.length === 0}
              className="btn-primary"
            >
              Next: Options
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Options */}
      {step === 1 && (
        <div className="card">
          <h2 className="text-2xl font-semibold mb-6">Customize Options</h2>
          <OptionsForm options={options} onOptionsChange={setOptions} />
          
          <div className="mt-6 p-4 bg-primary/10 border border-primary rounded-lg">
            <p className="text-sm">
              <strong>Estimated Credit Cost:</strong> 1 credit per generation
            </p>
          </div>

          <div className="mt-6 flex justify-between">
            <button onClick={handleBack} className="btn-secondary">
              Back
            </button>
            <button onClick={handleNext} className="btn-primary">
              Next: Review
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Generate */}
      {step === 2 && !isGenerating && (
        <div className="card">
          <h2 className="text-2xl font-semibold mb-6">Ready to Generate</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <h3 className="font-semibold text-gray-300 mb-2">Images:</h3>
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={URL.createObjectURL(img)}
                    alt={`Upload ${i + 1}`}
                    className="w-24 h-24 object-cover rounded"
                  />
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-300 mb-2">Options:</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>Style: {options.stylePreset.replace('_', ' ')}</li>
                <li>Layout: {options.layout.replace('_', ' ')}</li>
                <li>Background: {options.background.replace('_', ' ')}</li>
                {options.nickname && <li>Character Name: {options.nickname}</li>}
              </ul>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={handleBack} className="btn-secondary">
              Back
            </button>
            <button onClick={handleGenerate} className="btn-primary">
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Sheet
            </button>
          </div>
        </div>
      )}

      {/* Generating */}
      {isGenerating && (
        <div className="card text-center py-12">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Generating Your Character Sheet</h2>
          <p className="text-gray-400 mb-4">{statusMessage}</p>
          <p className="text-sm text-gray-500">This may take 2-5 minutes. Please don't close this page.</p>
        </div>
      )}

      {/* Step 3: Result */}
      {step === 3 && outputUrl && (
        <div>
          <ResultViewer imageUrl={outputUrl} onDownload={handleDownload} />
          
          <div className="mt-6 flex justify-center gap-4">
            <button onClick={handleReset} className="btn-secondary">
              <RefreshCw className="w-5 h-5 mr-2" />
              Create Another
            </button>
            <button onClick={handleGenerate} className="btn-primary">
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Variation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
