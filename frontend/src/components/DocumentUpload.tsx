'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, CheckCircle, AlertCircle, Loader, Zap } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import clsx from 'clsx';

interface UploadedDocument {
  id: string;
  name: string;
  status: 'uploading' | 'extracted' | 'embedding' | 'success' | 'error';
  error?: string;
  progress: number;
  textLength?: number;
  preview?: string;
  docId?: string;
}

export function DocumentUpload() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadedDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    setIsDragging(false);
    setIsUploading(true);

    const newUploads: UploadedDocument[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadId = `${Date.now()}-${i}`;

      // Only accept PDF, DOCX, TXT, MD
      if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown'].includes(file.type) && !file.name.endsWith('.md')) {
        newUploads.push({
          id: uploadId,
          name: file.name,
          status: 'error',
          error: 'Only PDF, DOCX, TXT, and MD files are supported',
          progress: 0,
        });
        continue;
      }

      newUploads.push({
        id: uploadId,
        name: file.name,
        status: 'uploading',
        progress: 10,
      });

      setUploads((prev) => [...prev, newUploads[i]]);

      try {
        // Upload file - Extract text and return immediately
        const response = await apiClient.uploadDocument(file);

        // Check if document is ready (no embedding phase needed with current backend)
        if (response.status === 'ready' || response.status === 'completed') {
          // Document is immediately ready for search
          setUploads((prev) =>
            prev.map((u) =>
              u.id === uploadId
                ? { 
                    ...u, 
                    status: 'success',
                    progress: 100,
                    docId: response.doc_id,
                    textLength: response.text_length,
                    preview: response.preview
                  }
                : u
            )
          );
        } else if (response.doc_id) {
          // Phase 2: Monitor embedding progress in background (for future embedding support)
          let embeddingComplete = false;
          let attempts = 0;
          const maxAttempts = 30; // Max 30 seconds polling
          
          while (!embeddingComplete && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
            
            try {
              const statusResp = await apiClient.get(`/documents/${response.doc_id}/status`);
              const newProgress = 50 + (statusResp.progress * 0.5); // 50-100%
              
              const isComplete = statusResp.status === 'completed' || statusResp.status === 'ready';
              const isError = statusResp.status === 'error';
              
              setUploads((prev) =>
                prev.map((u) =>
                  u.id === uploadId
                    ? { 
                        ...u, 
                        status: isComplete ? 'success' : isError ? 'error' : 'embedding',
                        progress: isComplete ? 100 : Math.min(newProgress, 99)
                      }
                    : u
                )
              );

              if (isComplete || isError) {
                embeddingComplete = true;
              }
            } catch (err) {
              // Continue polling even if status check fails
            }
          }
          
          // Timeout - assume success since upload completed
          if (!embeddingComplete) {
            setUploads((prev) =>
              prev.map((u) =>
                u.id === uploadId
                  ? { ...u, status: 'success', progress: 100 }
                  : u
              )
            );
          }
        }
      } catch (error: any) {
        setUploads((prev) =>
          prev.map((u) =>
            u.id === uploadId
              ? {
                  ...u,
                  status: 'error',
                  error: error?.message || 'Upload failed',
                  progress: 0,
                }
              : u
          )
        );
      }
    }

    setIsUploading(false);
  };

  const clearUploads = () => {
    setUploads([]);
  };

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <>
      {/* Upload Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 p-4 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-lg hover:shadow-xl transition-all z-40"
        title="Upload documents"
      >
        <Upload size={24} />
      </motion.button>

      {/* Modal Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !isUploading && setIsOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Upload size={20} />
                Upload Documents
              </h2>
              <button
                onClick={() => !isUploading && setIsOpen(false)}
                disabled={isUploading}
                className="p-1 hover:bg-brand-500 rounded-lg transition-colors disabled:opacity-50"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {uploads.length === 0 && !isUploading ? (
                <>
                  {/* Drag and Drop Area */}
                  <label
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={clsx(
                      'block p-8 border-2 border-dashed rounded-lg cursor-pointer transition-all',
                      isDragging
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-brand-200 hover:border-brand-400'
                    )}
                  >
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.docx,.txt,.md"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <div className="text-center">
                      <motion.div
                        animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                        className="inline-block p-3 bg-brand-100 rounded-full mb-3"
                      >
                        <Upload className="text-brand-600" size={28} />
                      </motion.div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        Drop documents here or click
                      </p>
                      <p className="text-xs text-gray-600">
                        Supports PDF, DOCX, TXT, Markdown
                      </p>
                    </div>
                  </label>

                  {/* Information */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                    💡 Upload documents to add them to the knowledge base.
                    They will be processed and indexed for retrieval.
                  </div>
                </>
              ) : null}

              {/* Upload List */}
              {uploads.map((upload) => (
                <motion.div
                  key={upload.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-gray-50 rounded-lg p-3 space-y-2"
                >
                  {/* File Info */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <div className="mt-1 flex-shrink-0">
                        {(upload.status === 'uploading' || upload.status === 'embedding') && (
                          <Loader size={16} className="text-brand-600 animate-spin" />
                        )}
                        {upload.status === 'extracted' && (
                          <Zap size={16} className="text-orange-600 animate-pulse" />
                        )}
                        {upload.status === 'success' && (
                          <CheckCircle size={16} className="text-green-600" />
                        )}
                        {upload.status === 'error' && (
                          <AlertCircle size={16} className="text-red-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {upload.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {upload.status === 'uploading' && 'Uploading...'}
                          {upload.status === 'extracted' && `Text extracted (${upload.textLength?.toLocaleString()} chars) - Embedding in background...`}
                          {upload.status === 'embedding' && 'Generating embeddings...'}
                          {upload.status === 'success' && 'Ready for search!'}
                          {upload.status === 'error' && upload.error}
                        </p>
                        {upload.preview && upload.status === 'extracted' && (
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                            {upload.preview}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeUpload(upload.id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                      title="Remove"
                    >
                      <X size={14} className="text-gray-600" />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  {(upload.status === 'uploading' || upload.status === 'embedding') && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${upload.progress}%` }}
                        className="h-full bg-gradient-to-r from-brand-500 to-brand-600"
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            {uploads.length > 0 && (
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
                <button
                  onClick={clearUploads}
                  disabled={isUploading}
                  className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 transition-colors"
                >
                  Clear All
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => !isUploading && setIsOpen(false)}
                  disabled={isUploading}
                  className={clsx(
                    'px-4 py-2 rounded-lg font-medium text-sm transition-all',
                    isUploading
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-brand-600 hover:bg-brand-700 text-white'
                  )}
                >
                  {isUploading ? (
                    <span className="flex items-center gap-2">
                      <Loader size={16} className="animate-spin" />
                      Uploading...
                    </span>
                  ) : (
                    'Done'
                  )}
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
