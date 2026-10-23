import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Filter,
  FileCheck2,
  Database,
  Tag,
  Check,
  X,
} from 'lucide-react';
import { useScrap } from '../context/ScrapContext';
import type { Movimiento } from '../types';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

export const AprobacionesPage: React.FC = () => {
  const { movimientos, razonesCatalogo, aprobarMovimiento, rechazarMovimiento } = useScrap();
  const navigate = useNavigate();
  const descripcionPorRazon = useMemo(
    () => new Map(razonesCatalogo.map((razon) => [razon.idRazon, razon.descripcion])),
    [razonesCatalogo],
  );

  const [filtroCertificacion, setFiltroCertificacion] = useState('');
  const [modalDetalle, setModalDetalle] = useState<Movimiento | null>(null);
  const [dictamenObjetivo, setDictamenObjetivo] = useState<{ movimiento: Movimiento; decision: 1 | 2 } | null>(null);
  const [nombreResponsable, setNombreResponsable] = useState('');
  const [dictamenEnviando, setDictamenEnviando] = useState(false);
  const [errorDictamen, setErrorDictamen] = useState<string | null>(null);

  const pendientes = movimientos.filter((m) => {
    const esPendiente = m.aprobado === 0 || m.estatus === 'Pendiente';
    const coincideCertificacion = filtroCertificacion === '' || String(m.certificacionId) === filtroCertificacion;
    return esPendiente && coincideCertificacion;
  });

  const abrirConfirmacionDictamen = (movimiento: Movimiento, decision: 1 | 2) => {
    setDictamenObjetivo({ movimiento, decision });
    setNombreResponsable('');
    setErrorDictamen(null);
  };

  const cerrarConfirmacionDictamen = () => {
    if (dictamenEnviando) return;
    setDictamenObjetivo(null);
    setErrorDictamen(null);
  };

  const confirmarDictamen = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!dictamenObjetivo) return;

    const responsable = nombreResponsable.trim();
    if (!responsable) {
      setErrorDictamen('Captura el nombre del responsable para continuar.');
      return;
    }

    setDictamenEnviando(true);
    setErrorDictamen(null);
    try {
      if (dictamenObjetivo.decision === 1) {
        await aprobarMovimiento(dictamenObjetivo.movimiento.id, responsable);
      } else {
        await rechazarMovimiento(dictamenObjetivo.movimiento.id, responsable);
      }
      setDictamenObjetivo(null);
    } catch (error) {
      setErrorDictamen(error instanceof Error ? error.message : 'No se pudo guardar el dictamen.');
    } finally {
      setDictamenEnviando(false);
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
      </div>

      <div className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-3 text-xs text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
        Los dictámenes se guardan en SQL Server: se registra el nombre capturado en <code>nvAprobadoPor</code> y la fecha/hora del servidor en <code>dtAprobado</code>. El nombre capturado no verifica por sí mismo la identidad del usuario.
      </div>

      {/* Barra de Filtro de Línea */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Filtrar por Certificación:</span>
          <select
            value={filtroCertificacion}
            onChange={(e) => setFiltroCertificacion(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Todas las certificaciones</option>
            {[...new Set(movimientos.map((movimiento) => movimiento.certificacionId))].map((id) => (
              <option key={id} value={String(id)}>Certificación {id}</option>
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
                <th className="px-4 py-3">ID / Serial</th>
                <th className="px-4 py-3">Número de Parte (MATNR)</th>
                <th className="px-4 py-3">Fecha de emisión</th>
                <th className="px-4 py-3">Razón de Falla</th>
                <th className="px-4 py-3">Tipo Movimiento</th>
                <th className="px-4 py-3 text-right">Cantidad</th>
                <th className="px-4 py-3">Almacén</th>
                <th className="px-4 py-3">Credencial</th>
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
                    className="hover:bg-amber-50/30 dark:hover:bg-slate-800/40 transition-colors"
                  >
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

                    {/* Fecha y hora de emisión desde fecha_hora */}
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      <div>{item.fecha}</div>
                      <div className="text-[10px] text-slate-400">{item.hora}</div>
                    </td>

                    {/* Razón */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {item.razonId}
                        </span>
                        <span className="text-slate-600 dark:text-slate-300 max-w-[160px] truncate">
                          {item.razonId === null
                            ? 'Sin razón'
                            : descripcionPorRazon.get(item.razonId) || 'Descripción no disponible'}
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
                      <div className="font-mono">{item.credencial}</div>
                      <div className="text-[10px] text-slate-400">Empleado pendiente de integración</div>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Ver Detalle */}
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() => setModalDetalle(item)}
                        >
                          Detalle
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          icon={<Check className="w-3.5 h-3.5" />}
                          onClick={() => abrirConfirmacionDictamen(item, 1)}
                        >
                          Aprobar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={<X className="w-3.5 h-3.5" />}
                          onClick={() => abrirConfirmacionDictamen(item, 2)}
                        >
                          Rechazar
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
                  {modalDetalle.razonId === null
                    ? 'Sin razón'
                    : `${modalDetalle.razonId} - ${descripcionPorRazon.get(modalDetalle.razonId) || 'Descripción no disponible'}`}
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

      <Modal
        isOpen={!!dictamenObjetivo}
        onClose={cerrarConfirmacionDictamen}
        title={dictamenObjetivo?.decision === 1 ? 'Confirmar aprobación' : 'Confirmar rechazo'}
        subtitle={`Movimiento #${dictamenObjetivo?.movimiento.id} · ${dictamenObjetivo?.movimiento.matnr}`}
        maxWidth="md"
      >
        {dictamenObjetivo && (
          <form onSubmit={confirmarDictamen} className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {dictamenObjetivo.decision === 1
                ? 'Al confirmar, el movimiento quedará aprobado.'
                : 'Al confirmar, el movimiento quedará rechazado.'}
              {' '}SQL Server guardará la fecha y hora de esta acción.
            </p>
            <div>
              <label htmlFor="nombre-responsable" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Nombre del responsable
              </label>
              <input
                id="nombre-responsable"
                name="nombre-responsable"
                type="text"
                autoComplete="name"
                maxLength={200}
                required
                value={nombreResponsable}
                onChange={(event) => setNombreResponsable(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="Nombre y apellido"
              />
            </div>
            {errorDictamen && (
              <div role="alert" className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
                {errorDictamen}
              </div>
            )}
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <Button type="button" variant="ghost" onClick={cerrarConfirmacionDictamen} disabled={dictamenEnviando}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant={dictamenObjetivo.decision === 1 ? 'success' : 'danger'}
                loading={dictamenEnviando}
                disabled={!nombreResponsable.trim()}
              >
                {dictamenObjetivo.decision === 1 ? 'Confirmar aprobación' : 'Confirmar rechazo'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
