import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  Eye,
  ShieldCheck,
  AlertCircle,
  Filter,
  CheckCheck,
  Clock,
  FileCheck2,
} from 'lucide-react';
import { useScrap } from '../context/ScrapContext';
import type { Movimiento } from '../types';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { formatearMoneda } from '../utils/formatters';
import { LINEAS_PRODUCCION } from '../constants';

export const AprobacionesPage: React.FC = () => {
  const { movimientos, aprobarMovimiento, rechazarMovimiento, turnoActivo } = useScrap();
  const navigate = useNavigate();

  const [filtroLinea, setFiltroLinea] = useState('');
  const [modalAprobar, setModalAprobar] = useState<Movimiento | null>(null);
  const [modalRechazar, setModalRechazar] = useState<Movimiento | null>(null);
  const [modalDetalle, setModalDetalle] = useState<Movimiento | null>(null);

  const [comentarios, setComentarios] = useState('');
  const [seleccionados, setSeleccionados] = useState<string[]>([]);

  // Filtrar solo los movimientos pendientes
  const pendientes = movimientos.filter((m) => {
    const esPendiente = m.estatus === 'Pendiente';
    const coincideLinea = filtroLinea === '' || m.linea.includes(filtroLinea);
    return esPendiente && coincideLinea;
  });

  const handleConfirmarAprobacion = () => {
    if (modalAprobar) {
      aprobarMovimiento(modalAprobar.id, comentarios || 'Aprobado conforme a auditoría de scrap');
      setModalAprobar(null);
      setComentarios('');
    }
  };

  const handleConfirmarRechazo = () => {
    if (modalRechazar) {
      rechazarMovimiento(modalRechazar.id, comentarios || 'Rechazado por posibilidad de retrabajo o error');
      setModalRechazar(null);
      setComentarios('');
    }
  };

  const handleAprobarTodosSeleccionados = () => {
    seleccionados.forEach((id) => {
      aprobarMovimiento(id, 'Aprobación masiva por supervisor de turno');
    });
    setSeleccionados([]);
  };

  const alternarSeleccion = (id: string) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const alternarSeleccionarTodos = () => {
    if (seleccionados.length === pendientes.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados(pendientes.map((p) => p.id));
    }
  };

  return (
    <div className="space-y-5">
      {/* Cabecera y Resumen de Mesa de Aprobación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Bandeja de Aprobaciones de Scrap
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
              {pendientes.length} Pendientes
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Validación técnica y autorización de disposición de materiales para contabilización en SAP.
          </p>
        </div>

        {/* Acciones Globales */}
        {seleccionados.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="success"
              size="sm"
              icon={<CheckCheck className="w-4 h-4" />}
              onClick={handleAprobarTodosSeleccionados}
            >
              Aprobar Seleccionados ({seleccionados.length})
            </Button>
          </div>
        )}
      </div>

      {/* Barra de Filtro de Línea */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Filtrar por Línea:</span>
          <select
            value={filtroLinea}
            onChange={(e) => setFiltroLinea(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Todas las líneas de manufactura</option>
            {LINEAS_PRODUCCION.map((l) => (
              <option key={l.id} value={l.codigo}>
                {l.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Filtro activo: {turnoActivo}</span>
        </div>
      </div>

      {/* Tabla de Aprobaciones (Inspirada en el layout exacto pedido) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={pendientes.length > 0 && seleccionados.length === pendientes.length}
                    onChange={alternarSeleccionarTodos}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3">Línea</th>
                <th className="px-4 py-3">Número de Parte</th>
                <th className="px-4 py-3">Hora</th>
                <th className="px-4 py-3">Turno</th>
                <th className="px-4 py-3 text-right">Cantidad</th>
                <th className="px-4 py-3">Motivo</th>
                <th className="px-4 py-3">Reporta</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {pendientes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                      <FileCheck2 className="w-10 h-10 text-emerald-500/70" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                        ¡Todo al día! No hay solicitudes pendientes de aprobación.
                      </p>
                      <p className="text-xs text-slate-500">
                        Todas las boletas de scrap de este turno han sido auditadas y firmadas.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                pendientes.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-amber-50/30 dark:hover:bg-slate-800/40 transition-colors ${
                      seleccionados.includes(item.id) ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={seleccionados.includes(item.id)}
                        onChange={() => alternarSeleccion(item.id)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                    </td>

                    {/* Línea */}
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                        {item.linea.split(' ')[0]}
                      </span>
                    </td>

                    {/* Número de Parte */}
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {item.matnr}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                        {item.descripcion}
                      </div>
                    </td>

                    {/* Hora */}
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                      {item.hora}
                    </td>

                    {/* Turno */}
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {item.turno}
                    </td>

                    {/* Cantidad */}
                    <td className="px-4 py-3 font-mono font-bold text-right text-rose-600 dark:text-rose-400">
                      {item.cantidad} <span className="text-[10px] text-slate-400 font-normal">{item.unidad}</span>
                    </td>

                    {/* Motivo */}
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200 max-w-[220px] truncate">
                      <span title={item.motivoEspecifico}>
                        {item.motivoEspecifico}
                      </span>
                    </td>

                    {/* Reporta */}
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      <div className="font-medium">{item.empleado}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.credencial}</div>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Aprobar */}
                        <Button
                          variant="success"
                          size="sm"
                          icon={<CheckCircle className="w-3.5 h-3.5" />}
                          onClick={() => {
                            setModalAprobar(item);
                            setComentarios('Aprobado para destrucción y desecho final en ALM-99.');
                          }}
                        >
                          Aprobar
                        </Button>

                        {/* Rechazar */}
                        <Button
                          variant="danger"
                          size="sm"
                          icon={<XCircle className="w-3.5 h-3.5" />}
                          onClick={() => {
                            setModalRechazar(item);
                            setComentarios('Rechazado: Material califica para retrabajo en línea.');
                          }}
                        >
                          Rechazar
                        </Button>

                        {/* Ver Detalle */}
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() => setModalDetalle(item)}
                        >
                          Detalle
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN: APROBAR */}
      <Modal
        isOpen={!!modalAprobar}
        onClose={() => setModalAprobar(null)}
        title="Confirmar Aprobación de Scrap"
        subtitle={`Folio ${modalAprobar?.id} • Parte ${modalAprobar?.matnr}`}
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalAprobar(null)}>
              Cancelar
            </Button>
            <Button variant="success" icon={<CheckCircle className="w-4 h-4" />} onClick={handleConfirmarAprobacion}>
              Autorizar y Firmar Digitalmente
            </Button>
          </>
        }
      >
        {modalAprobar && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                  Impacto Contable en Inventario
                </p>
                <p className="text-emerald-700 dark:text-emerald-300 mt-0.5">
                  Se dará de baja <strong className="font-mono">{modalAprobar.cantidad} {modalAprobar.unidad}</strong>{' '}
                  con un costo total de{' '}
                  <strong className="font-mono">{formatearMoneda(modalAprobar.costoTotal)}</strong> imputado al centro de costos de {modalAprobar.linea}.
                </p>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Comentarios de Aprobación / Instrucción para Disposición
              </label>
              <textarea
                rows={3}
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Indique destino final o condiciones..."
              />
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL DE CONFIRMACIÓN: RECHAZAR */}
      <Modal
        isOpen={!!modalRechazar}
        onClose={() => setModalRechazar(null)}
        title="Rechazar Solicitud de Scrap"
        subtitle={`Folio ${modalRechazar?.id} • Parte ${modalRechazar?.matnr}`}
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalRechazar(null)}>
              Cancelar
            </Button>
            <Button variant="danger" icon={<XCircle className="w-4 h-4" />} onClick={handleConfirmarRechazo}>
              Confirmar Rechazo
            </Button>
          </>
        }
      >
        {modalRechazar && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-900 dark:text-rose-200">
                  Acción Correctiva Obligatoria
                </p>
                <p className="text-rose-700 dark:text-rose-300 mt-0.5">
                  El material no será enviado a chatarra. Indique la justificación para reubicarlo en retrabajo o inspección NDT.
                </p>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Motivo / Justificación del Rechazo *
              </label>
              <textarea
                rows={3}
                required
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                placeholder="Explique por qué no procede como scrap..."
              />
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL DETALLE RÁPIDO */}
      <Modal
        isOpen={!!modalDetalle}
        onClose={() => setModalDetalle(null)}
        title="Ficha Rápida del Movimiento"
        subtitle={`Folio: ${modalDetalle?.id}`}
        maxWidth="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalDetalle(null)}>
              Cerrar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const id = modalDetalle?.id;
                setModalDetalle(null);
                if (id) navigate(`/movimientos/${id}`);
              }}
            >
              Abrir Pantalla Completa
            </Button>
          </>
        }
      >
        {modalDetalle && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <div>
                <span className="text-slate-400 block">Número de Parte (MATNR):</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {modalDetalle.matnr}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Descripción:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {modalDetalle.descripcion}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Línea de Producción:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {modalDetalle.linea}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Cantidad & Costo:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {modalDetalle.cantidad} {modalDetalle.unidad} ({formatearMoneda(modalDetalle.costoTotal)})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Orden de Producción:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {modalDetalle.ordenProduccion}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Lote de Material:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {modalDetalle.lote}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block font-medium mb-1">Motivo Específico:</span>
              <p className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                {modalDetalle.motivoEspecifico}
              </p>
            </div>

            {modalDetalle.observaciones && (
              <div>
                <span className="text-slate-400 block font-medium mb-1">Observaciones del Operador:</span>
                <p className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 italic">
                  "{modalDetalle.observaciones}"
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
