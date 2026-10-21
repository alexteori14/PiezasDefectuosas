import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Printer,
  ShieldCheck,
  User,
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

  const movimiento = movimientos.find((m) => m.id === id);

  if (!movimiento) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Movimiento no encontrado
        </h2>
        <p className="text-sm text-slate-500">
          El folio {id} no existe o fue retirado del sistema.
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
                {movimiento.id}
              </h1>
              <Badge estatus={movimiento.estatus} size="md" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Trazabilidad 360° • Registro en Terminal MES & SAP S/4HANA
            </p>
          </div>
        </div>

        {/* Acciones del Detalle */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Printer className="w-4 h-4" />}
            onClick={() => simularImpresionPDF(`Marbete_${movimiento.id}`)}
          >
            Imprimir Marbete
          </Button>

          {movimiento.estatus === 'Pendiente' && (
            <>
              <Button
                variant="success"
                size="sm"
                icon={<CheckCircle className="w-4 h-4" />}
                onClick={() => setModalAprobarAbierto(true)}
              >
                Aprobar Scrap
              </Button>

              <Button
                variant="danger"
                size="sm"
                icon={<XCircle className="w-4 h-4" />}
                onClick={() => setModalRechazarAbierto(true)}
              >
                Rechazar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Banner de Estado Actual */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          movimiento.estatus === 'Aprobado'
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            : movimiento.estatus === 'Rechazado'
            ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 shrink-0" />
          <div>
            <h4 className="font-semibold text-xs sm:text-sm">
              Estatus Actual: {movimiento.estatus}
            </h4>
            <p className="text-xs opacity-90">
              {movimiento.estatus === 'Aprobado' &&
                `Autorizado por ${movimiento.aprobadoPor || 'Supervisor de Calidad'} el ${movimiento.fechaAprobacion || movimiento.fecha}.`}
              {movimiento.estatus === 'Rechazado' &&
                `Rechazado por ${movimiento.aprobadoPor || 'Supervisor de Calidad'}. Material recuperable.`}
              {movimiento.estatus === 'Pendiente' &&
                'En espera de firma digital del supervisor de calidad para ajuste de inventario en SAP.'}
            </p>
          </div>
        </div>

        {movimiento.comentariosAprobacion && (
          <div className="text-xs italic bg-white/70 dark:bg-black/30 p-2 rounded-lg max-w-sm">
            "{movimiento.comentariosAprobacion}"
          </div>
        )}
      </div>

      {/* Grid de Contenido: Ficha Técnica + Marbete Viajero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ficha Técnica y Datos Maestros */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Ficha Técnica del Material & Registro de Defecto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">
                  Número de Parte SAP (MATNR)
                </span>
                <span className="text-base font-bold font-mono text-blue-600 dark:text-blue-400 mt-1 block">
                  {movimiento.matnr}
                </span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5 block">
                  {movimiento.descripcion}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">
                  Volumen & Costo Total
                </span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1 block">
                  {movimiento.cantidad} {movimiento.unidad}
                </span>
                <span className="text-xs font-mono text-rose-600 dark:text-rose-400 mt-0.5 block font-semibold">
                  Costo: {formatearMoneda(movimiento.costoTotal)} ({formatearMoneda(movimiento.costoUnitario)} / u)
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">
                  Origen y Línea
                </span>
                <span className="text-xs font-semibold text-slate-900 dark:text-white mt-1 block">
                  {movimiento.linea}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Turno: {movimiento.turno} • Fecha: {movimiento.fecha} {movimiento.hora}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">
                  Logística de Almacenes
                </span>
                <span className="text-xs font-semibold text-slate-900 dark:text-white mt-1 block">
                  Salida: {movimiento.almacenSalida}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Destino: {movimiento.almacenRetorno} ({movimiento.almacen})
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">
                  Orden de Producción (OP)
                </span>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                  {movimiento.ordenProduccion || 'OP-S4HANA-GEN'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                  Lote: {movimiento.lote || 'N/A'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">
                  Personal Operativo Responsable
                </span>
                <span className="text-xs font-semibold text-slate-900 dark:text-white mt-1 block">
                  {movimiento.empleado}
                </span>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                  Credencial: {movimiento.credencial}
                </span>
              </div>
            </div>

            {/* Clasificación de Causa Raíz */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div>
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Tipo de Movimiento & Motivo Específico
                </h4>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium text-xs">
                    {movimiento.movimientoTipo}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {movimiento.motivoEspecifico}
                  </span>
                </div>
              </div>

              {movimiento.observaciones && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Observaciones Detalladas en Piso
                  </h4>
                  <p className="mt-1 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {movimiento.observaciones}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Historial Visual / Timeline Cronológico */}
          <Card
            title="Timeline de Trazabilidad e Historial del Movimiento"
            subtitle="Registro inmutable de eventos conforme a norma IATF 16949"
          >
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {movimiento.historial && movimiento.historial.length > 0 ? (
                movimiento.historial.map((hito, idx) => {
                  const esCompletado = hito.estado === 'completado';
                  const esActual = hito.estado === 'actual';
                  const esRechazado = hito.estado === 'rechazado';

                  return (
                    <div key={hito.id || idx} className="relative group">
                      {/* Nodo del timeline */}
                      <span
                        className={`absolute -left-[27px] top-1 w-4 h-4 rounded-full border-2 bg-white dark:bg-slate-900 transition-colors ${
                          esCompletado
                            ? 'border-emerald-500 bg-emerald-500'
                            : esRechazado
                            ? 'border-rose-500 bg-rose-500'
                            : esActual
                            ? 'border-blue-500 bg-blue-500 animate-pulse'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}
                      />

                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {hito.titulo}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400">
                            {hito.fechaHora}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {hito.descripcion}
                        </p>

                        <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>
                            {hito.usuario} ({hito.rol})
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400">
                  Sin eventos adicionales registrados.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Marbete Viajero / Etiqueta de Contención Física */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">
                MAGNA EXTERIORS & BODY
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wider uppercase mt-0.5">
                MARBETE DE SCRAP / NO CONFORME
              </h3>
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 tracking-widest block mt-0.5">
                BLOQUEO DE CALIDAD MES
              </span>
            </div>

            {/* Código de barras simulado de alta fidelidad */}
            <div className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="flex items-center gap-0.5 h-12 w-full justify-center">
                {[2, 4, 1, 3, 5, 2, 1, 4, 2, 3, 1, 4, 2, 5, 1, 3, 2, 4, 1, 3, 5, 2, 1, 3].map((w, i) => (
                  <div
                    key={i}
                    style={{ width: `${w * 1.5}px` }}
                    className="h-full bg-slate-900 dark:bg-slate-200"
                  />
                ))}
              </div>
              <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1 tracking-widest">
                *{movimiento.id}*
              </span>
            </div>

            {/* Resumen del Marbete */}
            <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              <div className="flex justify-between pt-1">
                <span className="text-slate-400 font-sans">MATNR:</span>
                <span className="font-bold text-slate-900 dark:text-white">{movimiento.matnr}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400 font-sans">CANTIDAD:</span>
                <span className="font-bold text-rose-600">{movimiento.cantidad} {movimiento.unidad}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400 font-sans">LÍNEA:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{movimiento.linea.split(' ')[0]}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400 font-sans">TURNO:</span>
                <span className="text-slate-700 dark:text-slate-300">{movimiento.turno}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400 font-sans">MOTIVO:</span>
                <span className="text-right text-[11px] font-sans truncate max-w-[150px]">{movimiento.motivoEspecifico}</span>
              </div>
            </div>

            {/* Firma digital */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
              <div className="h-10 flex items-center justify-center italic text-blue-600 dark:text-blue-400 font-serif text-sm">
                {movimiento.aprobadoPor || 'Pendiente de Firma'}
              </div>
              <div className="border-t border-slate-300 dark:border-slate-700 pt-1 text-[10px] text-slate-400 font-sans">
                Firma Autorizada Auditor / Supervisor
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE APROBACIÓN */}
      <Modal
        isOpen={modalAprobarAbierto}
        onClose={() => setModalAprobarAbierto(false)}
        title="Autorizar Scrap y Registro Contable"
        subtitle={`Folio ${movimiento.id}`}
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalAprobarAbierto(false)}>
              Cancelar
            </Button>
            <Button variant="success" icon={<CheckCircle className="w-4 h-4" />} onClick={handleAprobar}>
              Aprobar Definitivo
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Está a punto de autorizar la salida contable de <strong>{movimiento.cantidad} {movimiento.unidad}</strong> de <strong>{movimiento.matnr}</strong> hacia el patio de scrap.
          </p>
          <textarea
            rows={3}
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="Comentarios u observaciones de calidad..."
          />
        </div>
      </Modal>

      {/* MODAL DE RECHAZO */}
      <Modal
        isOpen={modalRechazarAbierto}
        onClose={() => setModalRechazarAbierto(false)}
        title="Rechazar Declaración de Scrap"
        subtitle={`Folio ${movimiento.id}`}
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalRechazarAbierto(false)}>
              Cancelar
            </Button>
            <Button variant="danger" icon={<XCircle className="w-4 h-4" />} onClick={handleRechazar}>
              Rechazar Solicitud
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Indique la justificación técnica por la cual no se autoriza la destrucción de estas piezas.
          </p>
          <textarea
            rows={3}
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
            placeholder="Ej. Pieza salvable mediante estirado térmico..."
          />
        </div>
      </Modal>
    </div>
  );
};
