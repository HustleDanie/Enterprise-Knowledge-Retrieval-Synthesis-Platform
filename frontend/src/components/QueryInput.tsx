'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Lightbulb } from 'lucide-react';
import clsx from 'clsx';

export interface QueryInputProps {
  onSubmit: (query: string) => Promise<void>;
  loading?: boolean;
  placeholder?: string;
}

const suggestedQueries = [
  'What are the main features of this platform?',
  'How do I set up the development environment?',
  'What technologies are used in the RAG pipeline?',
  'How is the data secured in this system?',
  'What monitoring tools are integrated?',
];

export function QueryInput({
  onSubmit,
  loading = false,
  placeholder = 'Ask a question about the platform...',
}: QueryInputProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    try {
      await onSubmit(query);
      setQuery('');
    } catch (error) {
      console.error('Error submitting query:', error);
    }
  };

  const handleSuggestedQuery = async (suggestedQuery: string) => {
    try {
      await onSubmit(suggestedQuery);
    } catch (error) {
      console.error('Error submitting query:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full"
    >
      {/* Main Query Input */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="glass-effect card-shadow rounded-2xl p-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              disabled={loading}
              className={clsx(
                'flex-1 bg-transparent px-4 py-3 outline-none',
                'placeholder-gray-500 text-gray-900',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className={clsx(
                'px-6 py-3 rounded-xl font-medium',
                'flex items-center gap-2 whitespace-nowrap',
                'transition-all duration-200',
                loading || !query.trim()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:shadow-lg hover:shadow-brand-500/30 active:scale-95'
              )}
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </div>
      </form>

      {/* Suggested Queries */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            Try asking:
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {suggestedQueries.slice(0, 4).map((suggested, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                onClick={() => handleSuggestedQuery(suggested)}
                className={clsx(
                  'text-left px-3 py-2 rounded-lg text-sm',
                  'glass-effect hover:bg-brand-50 border-0 hover:border-brand-200',
                  'cursor-pointer transition-all duration-200',
                  'hover:shadow-md'
                )}
              >
                <p className="line-clamp-2 text-gray-700 hover:text-brand-700">
                  {suggested}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
