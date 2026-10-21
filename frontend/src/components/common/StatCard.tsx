import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  titulo: string;
  valor: string | number;
  subvalor?: string;
  icono: React.ReactNode;
  variacion?: {
    valor: string;
    esPositiva: boolean;
    etiqueta?: string;
  };
  colorAccent?: 'blue' | 'amber' | 'emerald' | 'rose' | 'purple';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  titulo,
  valor,
  subvalor,
  icono,
  variacion,
  colorAccent = 'blue',
  onClick,
}) => {
  const accentBorders = {
    blue: 'border-l-4 border-l-blue-500',
    amber: 'border-l-4 border-l-amber-500',
    emerald: 'border-l-4 border-l-emerald-500',
    rose: 'border-l-4 border-l-rose-500',
    purple: 'border-l-4 border-l-purple-500',
  }[colorAccent];

  const iconBg = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400',
  }[colorAccent];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-md ${accentBorders} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
            {titulo}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
              {valor}
            </span>
          </div>
          {subvalor && (
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              {subvalor}
            </p>
          )}
        </div>

        <div className={`p-3 rounded-xl ${iconBg} shrink-0`}>
          {icono}
        </div>
      </div>

      {variacion && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs">
          <span
            className={`inline-flex items-center font-semibold ${
              variacion.esPositiva
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {variacion.esPositiva ? '↑' : '↓'} {variacion.valor}
          </span>
          {variacion.etiqueta && (
            <span className="ml-1.5 text-slate-400 dark:text-slate-500">
              {variacion.etiqueta}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};
