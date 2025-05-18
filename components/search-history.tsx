"use client";

import { useState, useEffect } from 'react';
import { History, Eye, Edit2, X, Download, RefreshCw } from 'lucide-react';
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  const [editedModel, setEditedModel] = useState<SearchHistoryItem | null>(null);

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
    setEditedModel({ ...item });
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

  const handleSaveEdit = async () => {
    if (!editedModel) return;

    try {
      const response = await fetch('/api/history', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedModel),
      });

      if (!response.ok) {
        throw new Error('Failed to update history item');
      }

      // Refresh the history
      fetchHistory();
      setIsEditDialogOpen(false);
    } catch (err) {
      console.error('Error updating history item:', err);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 bg-black/50 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
          >
            <History className="h-5 w-5 text-white" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl" align="end">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-lg bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Search History
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchHistory()}
                className="h-8 px-3 bg-white/5 hover:bg-white/10 transition-all duration-300"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            <ScrollArea className="h-[400px] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : error ? (
                <p className="text-sm text-red-400 text-center py-4">
                  {error}
                </p>
              ) : searchHistory.length === 0 ? (
                <p className="text-sm text-white/60 text-center py-4">
                  No search history yet
                </p>
              ) : (
                <div className="space-y-4">
                  {searchHistory.map((item, index) => (
                    <div 
                      key={index} 
                      className="border border-white/10 rounded-lg p-4 space-y-3 bg-white/5 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-white">{item.modelType}</p>
                        <div className="flex gap-2">
                          {item.downloadUrl && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 bg-white/5 hover:bg-white/10 transition-all duration-300"
                              onClick={() => handleDownload(item)}
                            >
                              <Download className="h-4 w-4 text-white" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-white/5 hover:bg-white/10 transition-all duration-300"
                            onClick={() => handleViewModel(item)}
                          >
                            <Eye className="h-4 w-4 text-white" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-white/5 hover:bg-white/10 transition-all duration-300"
                            onClick={() => handleEditModel(item)}
                          >
                            <Edit2 className="h-4 w-4 text-white" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-white/5 hover:bg-white/10 transition-all duration-300"
                            onClick={() => handleDeleteHistory(item)}
                          >
                            <X className="h-4 w-4 text-white" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-white/60">
                        Keywords: {item.keywords.join(', ')}
                      </p>
                      <p className="text-xs text-white/60 line-clamp-2">
                        Prompt: {item.prompt}
                      </p>
                      <p className="text-xs text-white/40">
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
        <DialogContent className="max-w-3xl bg-black/90 backdrop-blur-md border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              View Model
            </DialogTitle>
          </DialogHeader>
          {selectedModel && (
            <div className="space-y-6">
              {selectedModel.modelUrl && (
                <div className="aspect-video bg-black/50 rounded-lg flex items-center justify-center border border-white/10">
                  <iframe
                    src={selectedModel.modelUrl}
                    title={selectedModel.prompt}
                    className="w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <p className="font-medium text-lg text-white">{selectedModel.modelType}</p>
                    <p className="text-sm text-white/60">
                      Keywords: {selectedModel.keywords.join(', ')}
                    </p>
                    <p className="text-sm text-white/80">{selectedModel.prompt}</p>
                  </div>
                  {selectedModel.downloadUrl && (
                    <div className="flex flex-col items-end gap-3">
                      <Button
                        onClick={() => handleDownload(selectedModel)}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all duration-300"
                        size="lg"
                      >
                        <Download className="h-5 w-5 mr-2" />
                        Download Model
                      </Button>
                      <div className="text-xs text-white/40">
                        <p>Generated: {formatTimestamp(selectedModel.timestamp)}</p>
                        <p>Click to download the 3D model file</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {selectedModel.downloadUrl && (
                  <div className="border border-white/10 rounded-lg p-6 bg-white/5">
                    <h4 className="font-medium mb-4 text-lg bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                      Download Information
                    </h4>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <p className="text-white/40">Model Type</p>
                        <p className="font-medium text-white">{selectedModel.modelType}</p>
                      </div>
                      <div>
                        <p className="text-white/40">Format</p>
                        <p className="font-medium text-white">GLB/GLTF</p>
                      </div>
                      <div>
                        <p className="text-white/40">Generated From</p>
                        <p className="font-medium text-white">{selectedModel.prompt}</p>
                      </div>
                      <div>
                        <p className="text-white/40">Keywords</p>
                        <p className="font-medium text-white">{selectedModel.keywords.join(', ')}</p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Button
                        onClick={() => handleDownload(selectedModel)}
                        variant="outline"
                        className="w-full border-white/20 hover:bg-white/10 transition-all duration-300"
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
        <DialogContent className="max-w-2xl bg-black/90 backdrop-blur-md border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Edit Model
            </DialogTitle>
          </DialogHeader>
          {editedModel && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-white">Model Type</label>
                <Input
                  type="text"
                  value={editedModel.modelType}
                  onChange={(e) => setEditedModel({ ...editedModel, modelType: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium text-white">Prompt</label>
                <Textarea
                  value={editedModel.prompt}
                  onChange={(e) => setEditedModel({ ...editedModel, prompt: e.target.value })}
                  className="h-24 bg-white/5 border-white/20 text-white"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium text-white">Keywords</label>
                <div className="flex flex-wrap gap-2">
                  {editedModel.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/10 rounded-full text-sm text-white"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              {editedModel.downloadUrl && (
                <div className="pt-2">
                  <Button
                    onClick={() => handleDownload(editedModel)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all duration-300"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Model
                  </Button>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-white/20 hover:bg-white/10 transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all duration-300"
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