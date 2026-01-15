'use client';

import { motion } from 'framer-motion';
import { Search, AlertCircle, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export function LoadingSpinner({ size = 'md', message = 'Loading...' }: LoadingSpinnerProps) {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }[size];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center gap-3"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      >
        <Search className={clsx(sizeClass, 'text-brand-500')} />
      </motion.div>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </motion.div>
  );
}

export interface AlertProps {
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
  title?: string;
}

export function Alert({ type, message, title }: AlertProps) {
  const typeConfig = {
    error: {
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
    },
    success: {
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
    },
    warning: {
      icon: AlertCircle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
    },
    info: {
      icon: Search,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={clsx('rounded-lg border p-4', config.bg, config.border)}
    >
      <div className="flex gap-3">
        <Icon className={clsx('h-5 w-5 flex-shrink-0', config.color)} />
        <div>
          {title && <p className="font-semibold text-gray-900">{title}</p>}
          <p className="text-sm text-gray-700">{message}</p>
        </div>
      </div>
    </motion.div>
  );
}
