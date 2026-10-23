import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  Eye,
  ShieldCheck,
  Filter,
  CheckCheck,
  FileCheck2,
  Database,
  Tag,
} from 'lucide-react';
import { useScrap } from '../context/ScrapContext';
import type { Movimiento } from '../types';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { formatearMoneda } from '../utils/formatters';
import { LINEAS_PRODUCCION } from '../constants';

export const AprobacionesPage: React.FC = () => {
  const { movimientos, aprobarMovimiento, rechazarMovimiento } = useScrap();
  const navigate = useNavigate();

  const [filtroLinea, setFiltroLinea] = useState('');
  const [modalAprobar, setModalAprobar] = useState<Movimiento | null>(null);
  const [modalRechazar, setModalRechazar] = useState<Movimiento | null>(null);
  const [modalDetalle, setModalDetalle] = useState<Movimiento | null>(null);

  const [comentarios, setComentarios] = useState('');
  const [seleccionados, setSeleccionados] = useState<string[]>([]);

  // Filtrar solo los movimientos pendientes (aprobado = 0 o estatus Pendiente)
  const pendientes = movimientos.filter((m) => {
    const esPendiente = m.aprobado === 0 || m.estatus === 'Pendiente';
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
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
              <Database className="w-3 h-3" />
              {pendientes.length} Pendientes (aprobado = 0)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Validación técnica y dictamen en <code className="font-mono text-blue-600 dark:text-blue-400">dbo.Movimientos</code> para autorización de scrap y contabilización contable.
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
            className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Todas las Líneas de Planta</option>
            {LINEAS_PRODUCCION.map((l) => (
              <option key={l.id} value={l.codigo}>
                {l.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Tabla destino: <strong className="text-slate-700 dark:text-slate-300">dbo.Movimientos (SSMS)</strong>
        </div>
      </div>

      {/* TABLA DE SOLICITUDES PENDIENTES */}
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
                <th className="px-4 py-3">ID / Serial</th>
                <th className="px-4 py-3">Número de Parte (MATNR)</th>
                <th className="px-4 py-3">Razón de Falla</th>
                <th className="px-4 py-3">Tipo Movimiento</th>
                <th className="px-4 py-3 text-right">Cantidad</th>
                <th className="px-4 py-3">Almacén</th>
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
                        ¡Todo al día! No hay registros con aprobado = 0 pendientes.
                      </p>
                      <p className="text-xs text-slate-500">
                        Todas las solicitudes de este turno han sido autorizadas o canalizadas a retrabajo.
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

                    {/* ID y Serial */}
                    <td className="px-4 py-3 font-mono">
                      <div className="font-bold text-blue-600 dark:text-blue-400">#{item.id}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{item.serial}</div>
                    </td>

                    {/* Número de Parte */}
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {item.matnr}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[180px] truncate">
                        {item.descripcion}
                      </div>
                      {item.matnrFg && (
                        <div className="text-[10px] text-indigo-500 font-mono">FG: {item.matnrFg}</div>
                      )}
                    </td>

                    {/* Razón */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {item.razonId}
                        </span>
                        <span className="text-slate-600 dark:text-slate-300 max-w-[160px] truncate">
                          {item.motivoEspecifico}
                        </span>
                      </div>
                    </td>

                    {/* Tipo Movimiento */}
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                        {item.movimientoTipoId} - {item.movimientoTipo}
                      </span>
                    </td>

                    {/* Cantidad */}
                    <td className="px-4 py-3 font-mono font-bold text-right text-rose-600 dark:text-rose-400">
                      {item.cantidad} <span className="text-[10px] text-slate-400 font-normal">{item.unidad}</span>
                    </td>

                    {/* Almacén */}
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold">
                        {item.almacen}
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
                            setComentarios('Aprobado conforme a auditoría de scrap para disposición final en ALM-99.');
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
                            setComentarios('Rechazado: Material califica para retrabajo en línea en ALM-12.');
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

      {/* MODAL DE CONFIRMACIÓN: APROBAR (aprobado = 1) */}
      <Modal
        isOpen={!!modalAprobar}
        onClose={() => setModalAprobar(null)}
        title="Confirmar Aprobación (aprobado = 1)"
        subtitle={`Folio #${modalAprobar?.id} • Serial ${modalAprobar?.serial}`}
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalAprobar(null)}>
              Cancelar
            </Button>
            <Button variant="success" icon={<CheckCircle className="w-4 h-4" />} onClick={handleConfirmarAprobacion}>
              Autorizar y Firmar (aprobado = 1)
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
                  Actualización en tabla dbo.Movimientos
                </p>
                <p className="text-emerald-700 dark:text-emerald-300 mt-0.5">
                  Se actualizará <strong className="font-mono">aprobado = 1</strong> y{' '}
                  <strong className="font-mono">nvAprobadoPor = 'Ing. Carlos Mendoza'</strong> para{' '}
                  <strong className="font-mono">{modalAprobar.cantidad} {modalAprobar.unidad}</strong>{' '}
                  (Costo: {formatearMoneda(modalAprobar.costoTotal)}).
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
                placeholder="Indique condiciones de entrega al patio de chatarra..."
              />
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL DE CONFIRMACIÓN: RECHAZAR (aprobado = 2) */}
      <Modal
        isOpen={!!modalRechazar}
        onClose={() => setModalRechazar(null)}
        title="Rechazar Solicitud de Scrap (aprobado = 2)"
        subtitle={`Folio #${modalRechazar?.id} • Serial ${modalRechazar?.serial}`}
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalRechazar(null)}>
              Cancelar
            </Button>
            <Button variant="danger" icon={<XCircle className="w-4 h-4" />} onClick={handleConfirmarRechazo}>
              Confirmar Rechazo (aprobado = 2)
            </Button>
          </>
        }
      >
        {modalRechazar && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-900 dark:text-rose-200">
                  Desvío a Retrabajo Técnico
                </p>
                <p className="text-rose-700 dark:text-rose-300 mt-0.5">
                  El registro se marcará con <strong className="font-mono">aprobado = 2</strong> y será transferido al almacén de retrabajo <strong className="font-mono">ALM-12</strong>.
                </p>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Justificación Técnica de Rechazo
              </label>
              <textarea
                rows={3}
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                placeholder="Indique por qué la pieza es recuperable..."
              />
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL DETALLE RÁPIDO */}
      <Modal
        isOpen={!!modalDetalle}
        onClose={() => setModalDetalle(null)}
        title={`Detalle de Solicitud • Folio #${modalDetalle?.id}`}
        subtitle={`Serial: ${modalDetalle?.serial} • MATNR: ${modalDetalle?.matnr}`}
        maxWidth="lg"
      >
        {modalDetalle && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 block">Certificación (Estación)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">ID {modalDetalle.certificacionId}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 block">Tipo Movimiento</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {modalDetalle.movimientoTipoId} - {modalDetalle.movimientoTipo}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 block">Razón (EtiquetasCI)</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {modalDetalle.razonId} - {modalDetalle.motivoEspecifico}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 block">Almacén Destino</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{modalDetalle.almacen}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 block">Cantidad</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {modalDetalle.cantidad} {modalDetalle.unidad}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 block">Costo Total Estimado</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {formatearMoneda(modalDetalle.costoTotal)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setModalDetalle(null);
                  navigate(`/movimientos/${modalDetalle.id}`);
                }}
              >
                Abrir Ficha Técnica Completa 360°
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setModalDetalle(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
