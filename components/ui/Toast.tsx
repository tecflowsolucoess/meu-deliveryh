'use client';

import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
}

export function Toast({ message, type }: ToastProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold text-sm text-white ${type === 'success' ? 'bg-gray-900' : 'bg-red-600'}`}
    >
      {type === 'success' ? (
        <CheckCircle2 size={18} className="text-green-400" />
      ) : (
        <AlertCircle size={18} className="text-white" />
      )}
      {message}
    </motion.div>
  );
}
