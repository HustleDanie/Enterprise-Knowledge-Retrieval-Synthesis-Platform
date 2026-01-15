'use client';

import { motion } from 'framer-motion';
import { Clock, Filter, BookOpen, Zap } from 'lucide-react';
import { QueryResponse } from '@/lib/api-client';

export interface QueryResultsProps {
  response: QueryResponse | null;
  loading: boolean;
  error: string | null;
}

export function QueryResults({ response, loading, error }: QueryResultsProps) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <div className="h-32 glass-effect card-shadow rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-16 glass-effect card-shadow rounded-xl animate-pulse" />
          <div className="h-16 glass-effect card-shadow rounded-xl animate-pulse" />
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect card-shadow rounded-2xl p-6 border border-red-200 bg-red-50"
      >
        <h3 className="font-semibold text-red-900 mb-2">Error</h3>
        <p className="text-red-800">{error}</p>
      </motion.div>
    );
  }

  if (!response) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Main Response */}
      <div className="glass-effect card-shadow rounded-2xl p-6 border border-brand-100">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-semibold text-lg text-gray-900">Answer</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              <Zap className="h-3 w-3" />
              Generated
            </span>
          </div>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {response.response}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect card-shadow rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-brand-600" />
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Retrieved</p>
              <p className="text-2xl font-bold text-gray-900">
                {response.retrieved_count}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect card-shadow rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-brand-600" />
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Reranked</p>
              <p className="text-2xl font-bold text-gray-900">
                {response.reranked_count}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect card-shadow rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-brand-600" />
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Response</p>
              <p className="text-2xl font-bold text-gray-900">
                {response.processing_time_ms.toFixed(0)}ms
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Citations */}
      {response.citations && response.citations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-effect card-shadow rounded-2xl p-6 border border-brand-100"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-brand-600" />
            Sources
          </h3>
          <div className="space-y-3">
            {response.citations.map((citation, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-brand-50 transition-colors"
              >
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-brand-600 text-white text-xs font-semibold flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 break-words">
                    {citation.metadata?.file_name || citation.id}
                  </p>
                  {citation.score !== undefined && (
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-gray-200 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(citation.score || 0) * 100}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-brand-500 to-brand-600"
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {((citation.score || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Confidence Score */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-effect card-shadow rounded-xl p-4"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">Overall Confidence</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-32 rounded-full bg-gray-200 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${response.confidence_score * 100}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-brand-500 to-brand-600"
              />
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {(response.confidence_score * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
