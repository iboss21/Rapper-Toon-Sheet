import { useState } from 'react';
import { Download, ZoomIn, ZoomOut, X } from 'lucide-react';

interface ResultViewerProps {
  imageUrl: string;
  onDownload: () => void;
}

export function ResultViewer({ imageUrl, onDownload }: ResultViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const handleZoomIn = () => setZoom(Math.min(zoom + 25, 200));
  const handleZoomOut = () => setZoom(Math.max(zoom - 25, 50));

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Generated Character Sheet</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-dark-light rounded-lg transition-colors"
            disabled={zoom <= 50}
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-400 w-12 text-center">{zoom}%</span>
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-dark-light rounded-lg transition-colors"
            disabled={zoom >= 200}
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={onDownload}
            className="btn-primary ml-4"
          >
            <Download className="w-5 h-5 mr-2" />
            Download PNG
          </button>
        </div>
      </div>

      <div className="relative bg-dark-light rounded-lg overflow-auto max-h-[600px]">
        <img
          src={imageUrl}
          alt="Generated character sheet"
          className="mx-auto cursor-pointer transition-transform"
          style={{ width: `${zoom}%` }}
          onClick={() => setShowFullscreen(true)}
        />
      </div>

      <p className="text-sm text-gray-400 mt-2 text-center">
        Click image to view fullscreen
      </p>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullscreen(false)}
        >
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-4 right-4 p-2 bg-dark-lighter rounded-full hover:bg-dark-light transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={imageUrl}
            alt="Generated character sheet"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
