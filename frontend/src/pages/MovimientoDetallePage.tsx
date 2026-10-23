import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Printer,
  ShieldCheck,
  User,
  Database,
  Tag,
  Factory,
  Layers,
} from 'lucide-react';
import { useScrap } from '../context/ScrapContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { formatearMoneda, simularImpresionPDF } from '../utils/formatters';

export const MovimientoDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { movimientos, aprobarMovimiento, rechazarMovimiento } = useScrap();

  const [modalAprobarAbierto, setModalAprobarAbierto] = useState(false);
  const [modalRechazarAbierto, setModalRechazarAbierto] = useState(false);
  const [comentarios, setComentarios] = useState('');

  const movimiento = movimientos.find((m) => m.id === id || m.serial === id);

  if (!movimiento) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Movimiento no encontrado
        </h2>
        <p className="text-sm text-slate-500">
          El folio #{id} no existe o no se encuentra registrado en dbo.Movimientos.
        </p>
        <Button variant="primary" onClick={() => navigate('/movimientos')}>
          Volver a Movimientos
        </Button>
      </div>
    );
  }

  const handleAprobar = () => {
    aprobarMovimiento(movimiento.id, comentarios || 'Aprobado en revisión técnica individual');
    setModalAprobarAbierto(false);
    setComentarios('');
  };

  const handleRechazar = () => {
    rechazarMovimiento(movimiento.id, comentarios || 'Rechazado en revisión técnica individual');
    setModalRechazarAbierto(false);
    setComentarios('');
  };

  return (
    <div className="space-y-6">
      {/* Botón Volver y Barra de Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/movimientos')}
            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
            title="Volver al listado"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                Movimiento #{movimiento.id}
              </h1>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Serial: {movimiento.serial}
              </span>
              <Badge estatus={movimiento.estatus} size="md" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Registro sincronizado con tabla <code className="font-mono text-blue-600 dark:text-blue-400">dbo.Movimientos</code> (SSMS) • Trazabilidad 360°
            </p>
          </div>
        </div>

        {/* Acciones del Detalle */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Printer className="w-4 h-4" />}
            onClick={() => simularImpresionPDF(`Marbete_${movimiento.serial || movimiento.id}`)}
          >
            Imprimir Marbete
          </Button>

          {movimiento.aprobado === 0 && (
            <>
              <Button
                variant="success"
                size="sm"
                icon={<CheckCircle className="w-4 h-4" />}
                onClick={() => setModalAprobarAbierto(true)}
              >
                Aprobar (aprobado = 1)
              </Button>

              <Button
                variant="danger"
                size="sm"
                icon={<XCircle className="w-4 h-4" />}
                onClick={() => setModalRechazarAbierto(true)}
              >
                Rechazar (aprobado = 2)
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Banner de Estado de Dictamen */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          movimiento.aprobado === 1
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            : movimiento.aprobado === 2
            ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 shrink-0" />
          <div>
            <h4 className="font-semibold text-xs sm:text-sm">
              Dictamen SSMS: {movimiento.aprobado === 1 ? 'Aprobado (aprobado = 1)' : movimiento.aprobado === 2 ? 'Rechazado (aprobado = 2)' : 'Pendiente (aprobado = 0)'}
            </h4>
            <p className="text-xs opacity-90">
              {movimiento.aprobado === 1 &&
                `Dictaminado por ${movimiento.nvAprobadoPor || 'Supervisor de Calidad'} el ${movimiento.dtAprobado || movimiento.fechaHora}.`}
              {movimiento.aprobado === 2 &&
                `Rechazado por ${movimiento.nvAprobadoPor || 'Supervisor de Calidad'}. Desviado a bahía de retrabajo.`}
              {movimiento.aprobado === 0 &&
                'En espera de firma digital del supervisor de calidad para contabilización en SAP S/4HANA.'}
            </p>
          </div>
        </div>

        {movimiento.comentariosAprobacion && (
          <div className="text-xs italic bg-white/70 dark:bg-black/30 p-2 rounded-lg max-w-sm">
            "{movimiento.comentariosAprobacion}"
          </div>
        )}
      </div>

      {/* Grid de Contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Ficha Técnica + Estructura de Base de Datos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Correspondencia directa con tabla dbo.Movimientos */}
          <Card
            title="Estructura de Base de Datos (dbo.Movimientos)"
            subtitle="Representación exacta de las columnas de SQL Server Management Studio"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">id (PK, int)</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{movimiento.id}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">CertificacionId (FK)</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                  {movimiento.certificacionId}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">{movimiento.certificacionNombre}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">MATNR (varchar 50)</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{movimiento.matnr}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">MATNR_FG (varchar 50)</span>
                <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                  {movimiento.matnrFg || 'N/A'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">fecha_hora (datetime)</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{movimiento.fechaHora}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">credencial (varchar 50)</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{movimiento.credencial}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">MovimientoTipoId (FK)</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {movimiento.movimientoTipoId} ({movimiento.movimientoTipo})
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">cantidad (int)</span>
                <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                  {movimiento.cantidad} {movimiento.unidad}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">RazonId (EtiquetasCI)</span>
                <div className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                  <Tag className="w-3 h-3" />
                  <span>{movimiento.razonId}</span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate">{movimiento.motivoEspecifico}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">almacen (varchar 50)</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{movimiento.almacen}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">serial (varchar 50)</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{movimiento.serial}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">centro_costo (varchar 50)</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{movimiento.centroCosto || 'N/A'}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Empleado (varchar 250)</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium truncate block">{movimiento.empleado}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">aprobado (int)</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {movimiento.aprobado} ({movimiento.estatus})
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">nvAprobadoPor (nvarchar)</span>
                <span className="text-slate-800 dark:text-slate-200 truncate block">
                  {movimiento.nvAprobadoPor || 'Pendiente'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">dtAprobado (datetime)</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {movimiento.dtAprobado || 'Pendiente'}
                </span>
              </div>
            </div>
          </Card>

          {/* Historial y Auditoría Cronológica */}
          <Card title="Trazabilidad y Línea de Vida (IATF 16949)">
            <div className="space-y-4">
              {movimiento.historial?.map((hito, idx) => (
                <div key={hito.id || idx} className="flex gap-3 text-xs">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full mt-1 ${
                        hito.estado === 'completado'
                          ? 'bg-emerald-500'
                          : hito.estado === 'rechazado'
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    {idx < (movimiento.historial?.length || 0) - 1 && (
                      <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-800 my-1" />
                    )}
                  </div>

                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {hito.titulo}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {hito.fechaHora}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      {hito.descripcion}
                    </p>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Responsable: <span className="font-medium text-slate-700 dark:text-slate-300">{hito.usuario}</span> ({hito.rol})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Columna Derecha: Marbete Viajero Físico Simulado */}
        <div className="space-y-6">
          <Card title="Marbete Viajero de Planta (Etiqueta Física)">
            <div className="p-4 bg-amber-50/50 dark:bg-slate-800/80 rounded-xl border border-dashed border-amber-300 dark:border-slate-700 font-mono text-xs space-y-4 shadow-inner">
              {/* Encabezado del Marbete */}
              <div className="text-center border-b border-dashed border-slate-300 dark:border-slate-700 pb-3">
                <span className="text-[10px] tracking-widest uppercase font-bold text-slate-500 block">
                  MAGNA EXTERIORS & STAMPING
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-white block mt-0.5">
                  MATERIAL NO CONFORME / SCRAP
                </span>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold block">
                  SERIAL: {movimiento.serial}
                </span>
              </div>

              {/* Contenido Principal */}
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">ID BD:</span>
                  <span className="font-bold">#{movimiento.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">MATNR (Parte):</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{movimiento.matnr}</span>
                </div>
                {movimiento.matnrFg && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">MATNR_FG:</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{movimiento.matnrFg}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Estación Cert.:</span>
                  <span className="font-bold">ID {movimiento.certificacionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tipo:</span>
                  <span className="font-bold">{movimiento.movimientoTipoId} - {movimiento.movimientoTipo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Razón (Falla):</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {movimiento.razonId} - {movimiento.motivoEspecifico}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cantidad:</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {movimiento.cantidad} {movimiento.unidad}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Almacén Dest.:</span>
                  <span className="font-bold">{movimiento.almacen}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Credencial:</span>
                  <span>{movimiento.credencial} ({movimiento.empleado})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fecha/Hora:</span>
                  <span>{movimiento.fechaHora}</span>
                </div>
              </div>

              {/* Código de Barras Simulado */}
              <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-3 text-center space-y-1">
                <div className="h-10 bg-slate-900 dark:bg-white flex items-center justify-center rounded-xs px-2">
                  <div className="flex items-center gap-0.5 h-7 w-full justify-center overflow-hidden">
                    {Array.from({ length: 42 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-full ${i % 3 === 0 ? 'w-1' : i % 2 === 0 ? 'w-0.5' : 'w-1.5'} ${
                          i % 4 === 0 ? 'bg-transparent' : 'bg-white dark:bg-slate-900'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] tracking-wider text-slate-500 block">
                  *{movimiento.serial}*
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de Aprobación */}
      <Modal
        isOpen={modalAprobarAbierto}
        onClose={() => setModalAprobarAbierto(false)}
        title="Aprobar Movimiento en Base de Datos"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Se registrará en la tabla <code className="font-mono text-blue-600">dbo.Movimientos</code> el valor{' '}
            <strong className="text-emerald-600">aprobado = 1</strong> para el folio serial <strong>{movimiento.serial}</strong>.
          </p>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Observaciones / Justificación de Calidad
            </label>
            <textarea
              rows={3}
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              placeholder="Aprobado conforme a GD&T y disposición de chatarra..."
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModalAprobarAbierto(false)}>
              Cancelar
            </Button>
            <Button variant="success" onClick={handleAprobar}>
              Confirmar y Autorizar (aprobado = 1)
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Rechazo */}
      <Modal
        isOpen={modalRechazarAbierto}
        onClose={() => setModalRechazarAbierto(false)}
        title="Rechazar Solicitud de Scrap"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Se registrará en <code className="font-mono text-blue-600">dbo.Movimientos</code> el valor{' '}
            <strong className="text-rose-600">aprobado = 2</strong> y el material será desviado de scrap contable a retrabajo.
          </p>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Motivo Técnico de Rechazo
            </label>
            <textarea
              rows={3}
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              placeholder="Pieza recuperable con rectificado en bahía de retrabajo ALM-12..."
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModalRechazarAbierto(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleRechazar}>
              Confirmar Rechazo (aprobado = 2)
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
