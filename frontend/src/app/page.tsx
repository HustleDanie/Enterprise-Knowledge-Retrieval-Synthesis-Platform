'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { QueryInput } from '@/components/QueryInput';
import { QueryResults } from '@/components/QueryResults';
import { Alert, LoadingSpinner } from '@/components/Common';
import { useQuery } from '@/lib/hooks';
import { apiClient } from '@/lib/api-client';
import clsx from 'clsx';

interface BackendStatusProps {
  backendAvailable: boolean | null;
}

function BackendStatus({ backendAvailable }: BackendStatusProps) {
  return (
    <div className="flex items-center gap-2 justify-end mb-4">
      <div
        className={clsx(
          'h-3 w-3 rounded-full',
          backendAvailable === true
            ? 'bg-green-500 animate-pulse-soft'
            : backendAvailable === false
              ? 'bg-red-500'
              : 'bg-gray-400 animate-pulse-soft'
        )}
      />
      <span className="text-xs font-medium text-gray-600">
        {backendAvailable === true
          ? 'Connected'
          : backendAvailable === false
            ? 'Offline'
            : 'Checking...'}
      </span>
    </div>
  );
}

export default function Home() {
  const { response, loading, error, query: submitQuery } = useQuery();
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [hasDocuments, setHasDocuments] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, status: string}[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Check backend availability on mount and periodically
  // Skip checks while a query is loading (backend is busy with Ollama)
  useEffect(() => {
    let cancelled = false;

    const checkBackend = async () => {
      if (loading) return; // Don't health-check during active query
      const available = await apiClient.isBackendAvailable();
      if (!cancelled) setBackendAvailable(available);
    };

    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [loading]);

  const handleQuery = async (question: string) => {
    try {
      setShowResults(true);
      await submitQuery(question);
    } catch (err) {
      console.error('Query error:', err);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsDragging(false);
    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Add file to list with uploading status
      setUploadedFiles(prev => [...prev, { name: file.name, status: 'uploading' }]);
      
      try {
        await apiClient.uploadDocument(file);
        // Update status to success
        setUploadedFiles(prev => 
          prev.map(f => f.name === file.name ? { ...f, status: 'success' } : f)
        );
      } catch (err) {
        // Update status to error
        setUploadedFiles(prev => 
          prev.map(f => f.name === file.name ? { ...f, status: 'error' } : f)
        );
      }
    }
    
    setIsUploading(false);
    setHasDocuments(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <main className="flex-1 overflow-auto">
      {/* Background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 via-white to-brand-100/30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-100/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-100/20 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative">
        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <BackendStatus backendAvailable={backendAvailable} />
            {/* Backend Warning - suppress while a query is actively loading */}
            {backendAvailable === false && !loading && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <Alert
                  type="error"
                  title="Backend Unavailable"
                  message="The backend service is not responding. Make sure the FastAPI server is running on port 8000."
                />
              </motion.div>
            )}

            {!hasDocuments ? (
              /* Step 1: Upload Documents */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Knowledge Search
                  </h1>
                  <p className="text-lg text-gray-600">
                    Upload your documents to get started
                  </p>
                </div>

                {/* Upload Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={clsx(
                    'border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer',
                    isDragging
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50'
                  )}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept=".pdf,.docx,.txt,.md"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                  
                  <div className="flex flex-col items-center gap-4">
                    <div className={clsx(
                      'h-16 w-16 rounded-full flex items-center justify-center transition-colors',
                      isDragging ? 'bg-brand-100' : 'bg-gray-100'
                    )}>
                      <Upload className={clsx(
                        'h-8 w-8 transition-colors',
                        isDragging ? 'text-brand-600' : 'text-gray-400'
                      )} />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {isDragging ? 'Drop files here' : 'Drag & drop files here'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        or click to browse • PDF, DOCX, TXT, MD
                      </p>
                    </div>
                  </div>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-6 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                      >
                        <FileText className="h-5 w-5 text-brand-600" />
                        <span className="flex-1 text-left text-sm font-medium text-gray-700 truncate">
                          {file.name}
                        </span>
                        {file.status === 'uploading' && (
                          <div className="h-4 w-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                        )}
                        {file.status === 'success' && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                        {file.status === 'error' && (
                          <span className="text-xs text-red-600">Failed</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Continue Button */}
                {uploadedFiles.some(f => f.status === 'success') && !isUploading && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setHasDocuments(true)}
                    className="mt-8 px-8 py-3 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700 transition-colors"
                  >
                    Continue to Search →
                  </motion.button>
                )}
              </motion.div>
            ) : !showResults ? (
              /* Step 2: Ask Questions */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Ask Your Questions
                  </h1>
                  <p className="text-lg text-gray-600">
                    Search through {uploadedFiles.filter(f => f.status === 'success').length} uploaded document{uploadedFiles.filter(f => f.status === 'success').length !== 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={() => setHasDocuments(false)}
                    className="mt-2 text-sm text-brand-600 hover:text-brand-700"
                  >
                    ← Upload more documents
                  </button>
                </div>
                
                <QueryInput
                  onSubmit={handleQuery}
                  loading={loading}
                  placeholder="Ask a question about your documents..."
                />
              </motion.div>
            ) : (
              /* Step 3: Show Results */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="sticky top-20 z-30 glass-effect border-b border-brand-100 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 backdrop-blur-xl">
                  <button
                    onClick={() => setShowResults(false)}
                    className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    ← New Search
                  </button>
                </div>

                <div className="glass-effect card-shadow rounded-2xl p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask a follow-up question..."
                      disabled={loading}
                      className={clsx(
                        'flex-1 bg-transparent outline-none',
                        'placeholder-gray-500 text-gray-900 text-sm',
                        'disabled:opacity-50'
                      )}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !loading) {
                          const input = e.currentTarget;
                          if (input.value.trim()) {
                            handleQuery(input.value);
                            input.value = '';
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {loading && <LoadingSpinner message="Searching documents..." />}
                <QueryResults response={response} loading={loading} error={error} />
              </motion.div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
