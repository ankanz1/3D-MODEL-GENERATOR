"use client";

import { useState, useEffect } from 'react';
import { History, Eye, Edit2, X, Download, RefreshCw } from 'lucide-react';
import dynamic from 'next/dynamic';
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

// Dynamically import heavy components
const ViewModelDialog = dynamic(() => import('./dialogs/view-model-dialog'), {
  loading: () => <div>Loading...</div>
});

const EditModelDialog = dynamic(() => import('./dialogs/edit-model-dialog'), {
  loading: () => <div>Loading...</div>
});

const HistoryList = dynamic(() => import('./history-list'), {
  loading: () => <div>Loading...</div>
});

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
    <div className="fixed right-20 top-0 h-full z-50">
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 mt-4 ml-4 bg-black/50 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
          >
            <History className="h-5 w-5 text-white" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 h-screen p-0 bg-[#202123] border-r border-white/10 rounded-none shadow-2xl" 
          align="start"
          side="right"
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-white/10">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-lg text-white">
                  Search History
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchHistory()}
                  className="h-8 px-3 hover:bg-white/10 transition-all duration-300"
                >
                  <RefreshCw className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
            <HistoryList
              isLoading={isLoading}
              error={error}
              searchHistory={searchHistory}
              onViewModel={handleViewModel}
              onEditModel={handleEditModel}
              onDeleteHistory={handleDeleteHistory}
              onDownload={handleDownload}
            />
          </div>
        </PopoverContent>
      </Popover>

      {selectedModel && (
        <ViewModelDialog
          isOpen={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          model={selectedModel}
          onDownload={handleDownload}
        />
      )}

      {editedModel && (
        <EditModelDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          model={editedModel}
          onSave={handleSaveEdit}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
} 