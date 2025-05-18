"use client";

import { useState, useEffect } from 'react';
import { History, Eye, Edit2, X, Download } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SearchHistoryItem {
  id?: string;
  modelType: string;
  keywords: string[];
  prompt: string;
  modelUrl?: string;
  downloadUrl?: string;
  timestamp: string;
}

export function SearchHistory() {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<SearchHistoryItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/history');
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      const data = await response.json();
      setSearchHistory(data);
      setError(null);
    } catch (err) {
      setError('Failed to load search history');
      console.error('Error fetching history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchHistory();
    }
  }, [mounted]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleViewModel = (item: SearchHistoryItem) => {
    setSelectedModel(item);
    setIsViewDialogOpen(true);
  };

  const handleEditModel = (item: SearchHistoryItem) => {
    setSelectedModel(item);
    setIsEditDialogOpen(true);
  };

  const handleDeleteHistory = async (item: SearchHistoryItem) => {
    try {
      const response = await fetch('/api/history', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: item.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete history item');
      }

      // Refresh the history
      fetchHistory();
    } catch (err) {
      console.error('Error deleting history item:', err);
    }
  };

  const handleDownload = (item: SearchHistoryItem) => {
    if (item.downloadUrl) {
      window.open(item.downloadUrl, '_blank');
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <History className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="end">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Search History</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchHistory()}
                className="h-6 px-2"
              >
                Refresh
              </Button>
            </div>
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Loading history...
                </p>
              ) : error ? (
                <p className="text-sm text-red-500 text-center py-4">
                  {error}
                </p>
              ) : searchHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No search history yet
                </p>
              ) : (
                <div className="space-y-4">
                  {searchHistory.map((item, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium">{item.modelType}</p>
                        <div className="flex gap-2">
                          {item.downloadUrl && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleDownload(item)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleViewModel(item)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleEditModel(item)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleDeleteHistory(item)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Keywords: {item.keywords.join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        Prompt: {item.prompt}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(item.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>

      {/* View Model Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>View Model</DialogTitle>
          </DialogHeader>
          {selectedModel && (
            <div className="space-y-4">
              {selectedModel.modelUrl && (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <iframe
                    src={selectedModel.modelUrl}
                    title={selectedModel.prompt}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="font-medium">{selectedModel.modelType}</p>
                    <p className="text-sm text-muted-foreground">
                      Keywords: {selectedModel.keywords.join(', ')}
                    </p>
                    <p className="text-sm">{selectedModel.prompt}</p>
                  </div>
                  {selectedModel.downloadUrl && (
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        onClick={() => handleDownload(selectedModel)}
                        className="w-full"
                        size="lg"
                      >
                        <Download className="h-5 w-5 mr-2" />
                        Download Model
                      </Button>
                      <div className="text-xs text-muted-foreground">
                        <p>Generated: {formatTimestamp(selectedModel.timestamp)}</p>
                        <p>Click to download the 3D model file</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {selectedModel.downloadUrl && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-2">Download Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Model Type</p>
                        <p className="font-medium">{selectedModel.modelType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Format</p>
                        <p className="font-medium">GLB/GLTF</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Generated From</p>
                        <p className="font-medium">{selectedModel.prompt}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Keywords</p>
                        <p className="font-medium">{selectedModel.keywords.join(', ')}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button
                        onClick={() => handleDownload(selectedModel)}
                        variant="outline"
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download 3D Model
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Model Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Model</DialogTitle>
          </DialogHeader>
          {selectedModel && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Model Type</label>
                <input
                  type="text"
                  value={selectedModel.modelType}
                  className="w-full p-2 border rounded-md"
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prompt</label>
                <textarea
                  value={selectedModel.prompt}
                  className="w-full p-2 border rounded-md h-24"
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Keywords</label>
                <div className="flex flex-wrap gap-2">
                  {selectedModel.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 rounded-md text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              {selectedModel.downloadUrl && (
                <div className="pt-2">
                  <Button
                    onClick={() => handleDownload(selectedModel)}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Model
                  </Button>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    // Here you would implement the edit functionality
                    setIsEditDialogOpen(false);
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 