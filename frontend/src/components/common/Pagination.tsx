import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
  elementosPorPagina: number;
  onCambiarPagina: (pagina: number) => void;
  onCambiarElementosPorPagina?: (cantidad: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  paginaActual,
  totalPaginas,
  totalElementos,
  elementosPorPagina,
  onCambiarPagina,
  onCambiarElementosPorPagina,
}) => {
  const inicio = Math.min((paginaActual - 1) * elementosPorPagina + 1, totalElementos);
  const fin = Math.min(paginaActual * elementosPorPagina, totalElementos);

  if (totalElementos === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
      <div className="flex items-center gap-3">
        <span>
          Mostrando <strong className="font-semibold text-slate-800 dark:text-slate-200">{inicio}</strong> a{' '}
          <strong className="font-semibold text-slate-800 dark:text-slate-200">{fin}</strong> de{' '}
          <strong className="font-semibold text-slate-800 dark:text-slate-200">{totalElementos}</strong> registros
        </span>

        {onCambiarElementosPorPagina && (
          <div className="flex items-center gap-1.5 ml-2">
            <span>Por página:</span>
            <select
              value={elementosPorPagina}
              onChange={(e) => onCambiarElementosPorPagina(Number(e.target.value))}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-0.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={paginaActual <= 1}
          onClick={() => onCambiarPagina(paginaActual - 1)}
          icon={<ChevronLeft className="w-3.5 h-3.5" />}
        >
          Anterior
        </Button>

        <span className="px-2.5 py-1 font-mono font-medium text-slate-700 dark:text-slate-300">
          {paginaActual} / {Math.max(1, totalPaginas)}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={paginaActual >= totalPaginas}
          onClick={() => onCambiarPagina(paginaActual + 1)}
          icon={<ChevronRight className="w-3.5 h-3.5" />}
          iconPosition="right"
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};
