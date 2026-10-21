import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Filter,
} from 'lucide-react';
import { useScrap } from '../context/ScrapContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { formatearMoneda, formatearNumero, descargarCSV, simularImpresionPDF } from '../utils/formatters';
import { LINEAS_PRODUCCION, TURNOS_PLANTA } from '../constants';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const ReportesPage: React.FC = () => {
  const { movimientos, motivos } = useScrap();

  // Filtros de reporte
  const [fechaInicio, setFechaInicio] = useState('2026-10-18');
  const [fechaFin, setFechaFin] = useState('2026-10-20');
  const [filtroLinea, setFiltroLinea] = useState('');
  const [filtroTurno, setFiltroTurno] = useState('');
  const [filtroMotivo, setFiltroMotivo] = useState('');

  // Filtrado de movimientos para el reporte
  const datosReporte = useMemo(() => {
    return movimientos.filter((m) => {
      const dentroDeFecha =
        (!fechaInicio || m.fecha >= fechaInicio) &&
        (!fechaFin || m.fecha <= fechaFin);
      const coincideLinea = filtroLinea === '' || m.linea.includes(filtroLinea);
      const coincideTurno = filtroTurno === '' || m.turno === filtroTurno;
      const coincideMotivo = filtroMotivo === '' || m.motivoEspecifico === filtroMotivo;

      return dentroDeFecha && coincideLinea && coincideTurno && coincideMotivo;
    });
  }, [movimientos, fechaInicio, fechaFin, filtroLinea, filtroTurno, filtroMotivo]);

  // Resumen de Métricas del Reporte
  const totalPiezas = datosReporte.reduce((sum, m) => sum + m.cantidad, 0);
  const totalCosto = datosReporte.reduce((sum, m) => sum + m.costoTotal, 0);
  const piezasScrap = datosReporte
    .filter((m) => m.movimientoTipo === 'Scrap')
    .reduce((sum, m) => sum + m.cantidad, 0);
  const costoScrap = datosReporte
    .filter((m) => m.movimientoTipo === 'Scrap')
    .reduce((sum, m) => sum + m.costoTotal, 0);

  // Agrupado por Número de Parte (MATNR)
  const resumenPorParte = useMemo(() => {
    const mapa: Record<string, { matnr: string; descripcion: string; cantidad: number; costo: number; incidencias: number }> = {};

    datosReporte.forEach((m) => {
      if (!mapa[m.matnr]) {
        mapa[m.matnr] = {
          matnr: m.matnr,
          descripcion: m.descripcion,
          cantidad: 0,
          costo: 0,
          incidencias: 0,
        };
      }
      mapa[m.matnr].cantidad += m.cantidad;
      mapa[m.matnr].costo += m.costoTotal;
      mapa[m.matnr].incidencias += 1;
    });

    return Object.values(mapa).sort((a, b) => b.costo - a.costo);
  }, [datosReporte]);

  // Gráfica de Costo por Línea
  const costoPorLineaData = useMemo(() => {
    const mapa: Record<string, number> = {};
    datosReporte.forEach((m) => {
      const codigo = m.linea.split(' ')[0];
      mapa[codigo] = (mapa[codigo] || 0) + m.costoTotal;
    });

    return Object.entries(mapa).map(([linea, costo]) => ({
      linea,
      costo,
    })).sort((a, b) => b.costo - a.costo);
  }, [datosReporte]);

  const limpiarFiltros = () => {
    setFechaInicio('2026-10-18');
    setFechaFin('2026-10-20');
    setFiltroLinea('');
    setFiltroTurno('');
    setFiltroMotivo('');
  };

  return (
    <div className="space-y-6">
      {/* Cabecera y Exportación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Módulo de Reportes & Análisis de Desperdicio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Consolidado gerencial de scrap, costos operativos y causas de fallo para juntas de mejora continua.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
            onClick={() => descargarCSV(datosReporte, `reporte-gerencial-scrap-${fechaFin}.csv`)}
          >
            Exportar Excel
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Printer className="w-4 h-4" />}
            onClick={() => simularImpresionPDF('Reporte_Oficial_Scrap_Magna')}
          >
            Imprimir / Guardar PDF
          </Button>
        </div>
      </div>

      {/* Panel de Filtros Avanzados */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Parámetros de Auditoría y Filtros</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Fecha Inicio */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Fecha Desde
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Línea */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Línea de Producción
            </label>
            <select
              value={filtroLinea}
              onChange={(e) => setFiltroLinea(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todas las Líneas</option>
              {LINEAS_PRODUCCION.map((l) => (
                <option key={l.id} value={l.codigo}>
                  {l.codigo}
                </option>
              ))}
            </select>
          </div>

          {/* Turno */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Turno
            </label>
            <select
              value={filtroTurno}
              onChange={(e) => setFiltroTurno(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos los Turnos</option>
              {TURNOS_PLANTA.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id}
                </option>
              ))}
            </select>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Motivo
            </label>
            <select
              value={filtroMotivo}
              onChange={(e) => setFiltroMotivo(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos los Motivos</option>
              {motivos.map((m) => (
                <option key={m.id} value={m.nombre}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPIs Consolidados del Periodo Seleccionado */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">
            Piezas Totales Afectadas
          </span>
          <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">
            {formatearNumero(totalPiezas)} Pzas
          </span>
          <span className="text-xs text-slate-400 mt-0.5 block">
            {datosReporte.length} boletas registradas
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">
            Costo Total de No Conformidad
          </span>
          <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1 block">
            {formatearMoneda(totalCosto)}
          </span>
          <span className="text-xs text-slate-400 mt-0.5 block">
            Impacto directo de materiales
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">
            Piezas Scrap Definitivo
          </span>
          <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">
            {formatearNumero(piezasScrap)} Pzas
          </span>
          <span className="text-xs text-slate-400 mt-0.5 block">
            Costo desecho: {formatearMoneda(costoScrap)}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">
            Piezas Retrabajo / Recuperadas
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
            {formatearNumero(totalPiezas - piezasScrap)} Pzas
          </span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 block font-medium">
            Valor salvado: {formatearMoneda(totalCosto - costoScrap)}
          </span>
        </div>
      </div>

      {/* Gráfica de Costo por Línea en el Reporte */}
      <Card
        title="Distribución de Costo por Línea en el Periodo"
        subtitle="Identificación de centros de costo con mayor impacto financiero"
      >
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costoPorLineaData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.4} />
              <XAxis dataKey="linea" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                formatter={(val: any) => [formatearMoneda(val), 'Costo Total']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="costo" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Tabla Avanzada: Desglose por Número de Parte (MATNR) */}
      <Card
        title="Desglose Consolidado por Número de Parte (MATNR)"
        subtitle="Agrupación de pérdidas acumuladas ordenadas por impacto en dólares"
      >
        <div className="overflow-x-auto -mx-5 -mb-5">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold text-[11px] border-y border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Número de Parte (MATNR)</th>
                <th className="px-5 py-3">Descripción Componente</th>
                <th className="px-5 py-3 text-right">Boletas</th>
                <th className="px-5 py-3 text-right">Piezas No Conformes</th>
                <th className="px-5 py-3 text-right">Costo Acumulado</th>
                <th className="px-5 py-3 text-right">% del Total</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-normal">
              {resumenPorParte.map((parte) => {
                const porcentaje = totalCosto > 0 ? ((parte.costo / totalCosto) * 100).toFixed(1) : '0';
                return (
                  <tr key={parte.matnr} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {parte.matnr}
                    </td>
                    <td className="px-5 py-3 text-slate-800 dark:text-slate-200 font-medium">
                      {parte.descripcion}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-slate-600 dark:text-slate-300">
                      {parte.incidencias}
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatearNumero(parte.cantidad)} pz
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                      {formatearMoneda(parte.costo)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-semibold text-slate-600 dark:text-slate-300">
                      {porcentaje}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
