import { useState, useEffect } from 'react';
import { Trash2, Eye, Download, Image as ImageIcon } from 'lucide-react';
import { HistoryItem } from '@rapper-toon-sheet/shared';
import { getHistory } from '@/lib/api';
import { getLocalHistory, deleteFromLocalHistory } from '@/lib/storage';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Try to load from backend first
      try {
        const backendHistory = await getHistory();
        setHistory(backendHistory);
      } catch (err) {
        // Fallback to local storage
        console.warn('Failed to load from backend, using local storage');
        const localHistory = getLocalHistory();
        setHistory(localHistory);
      }
    } catch (err: any) {
      console.error('Failed to load history:', err);
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteFromLocalHistory(id);
      setHistory(history.filter(item => item.id !== id));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    }
  };

  const handleDownload = (item: HistoryItem) => {
    if (item.outputUrl) {
      const link = document.createElement('a');
      link.href = item.outputUrl;
      link.download = `character-sheet-${item.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <LoadingSpinner size="lg" className="mx-auto" />
        <p className="text-gray-400 mt-4">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <h1 className="text-4xl font-bold mb-2">Generation History</h1>
      <p className="text-gray-400 mb-8">View and manage your previous character sheets</p>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      {history.length === 0 ? (
        <div className="card text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Generations Yet</h2>
          <p className="text-gray-400 mb-6">
            Start creating character sheets to see them here
          </p>
          <a href="/create" className="btn-primary inline-block">
            Create Your First Sheet
          </a>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* History List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">
              All Generations ({history.length})
            </h2>
            {history.map((item) => (
              <div
                key={item.id}
                className="card cursor-pointer hover:border-primary transition-colors"
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex items-start gap-4">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt="Thumbnail"
                      className="w-24 h-32 object-cover rounded"
                    />
                  ) : (
                    <div className="w-24 h-32 bg-dark-light rounded flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-600" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">
                          {item.options.nickname || 'Character Sheet'}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          item.status === 'completed'
                            ? 'bg-green-500/20 text-green-500'
                            : item.status === 'failed'
                            ? 'bg-red-500/20 text-red-500'
                            : 'bg-yellow-500/20 text-yellow-500'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>Style: {item.options.stylePreset.replace('_', ' ')}</p>
                      <p>Layout: {item.options.layout.replace('_', ' ')}</p>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                        className="text-sm px-3 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded transition-colors"
                      >
                        <Eye className="w-4 h-4 inline mr-1" />
                        View
                      </button>
                      {item.status === 'completed' && item.outputUrl && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(item);
                          }}
                          className="text-sm px-3 py-1 bg-dark-light hover:bg-dark rounded transition-colors"
                        >
                          <Download className="w-4 h-4 inline mr-1" />
                          Download
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="text-sm px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 inline mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {selectedItem ? (
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Preview</h2>
                {selectedItem.status === 'completed' && selectedItem.outputUrl ? (
                  <div>
                    <img
                      src={selectedItem.outputUrl}
                      alt="Character sheet"
                      className="w-full rounded-lg mb-4"
                    />
                    <button
                      onClick={() => handleDownload(selectedItem)}
                      className="btn-primary w-full"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Full Resolution
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    {selectedItem.status === 'failed' ? (
                      <p>Generation failed</p>
                    ) : (
                      <p>Generation in progress...</p>
                    )}
                  </div>
                )}
                
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <h3 className="font-semibold mb-3">Details</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Status:</dt>
                      <dd className="capitalize">{selectedItem.status}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Created:</dt>
                      <dd>{new Date(selectedItem.createdAt).toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Style:</dt>
                      <dd className="capitalize">{selectedItem.options.stylePreset.replace('_', ' ')}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Layout:</dt>
                      <dd className="capitalize">{selectedItem.options.layout.replace('_', ' ')}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Background:</dt>
                      <dd className="capitalize">{selectedItem.options.background.replace('_', ' ')}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            ) : (
              <div className="card text-center py-12">
                <Eye className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">
                  Select an item to preview
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
