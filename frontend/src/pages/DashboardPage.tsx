import React, { useMemo, useState } from 'react';
import {
  AlertOctagon,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  PlusCircle,
  Download,
  Flame,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { useScrap } from '../context/ScrapContext';
import { StatCard } from '../components/common/StatCard';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { formatearNumero, descargarCSV } from '../utils/formatters';
import { CATEGORIAS_MOTIVOS, LINEAS_PRODUCCION } from '../constants';
import type { CategoriaMotivo } from '../types';

export const DashboardPage: React.FC = () => {
  const { movimientos, movimientosCargando, errorMovimientos, recargarMovimientos, turnoActivo, crearMovimiento } = useScrap();
  const navigate = useNavigate();
  const movimientosDelPeriodo = movimientos;
  const cargandoDashboard = movimientosCargando;
  const errorDashboard = errorMovimientos;
  const etiquetaPeriodo = 'todo 2025';

  // Modal para registro rápido
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [formNuevo, setFormNuevo] = useState({
    matnr: 'MAT-849201',
    matnrFg: 'FG-CX9-FND-LH',
    descripcion: 'Fender Delantero Izq Mod CX-9',
    linea: 'L-01 Estampado Pesado Prensa Transfer',
    movimientoTipoId: 1,
    movimientoTipo: 'Scrap' as CategoriaMotivo,
    razonId: 5001,
    motivoEspecifico: 'Arrugas',
    cantidad: 5,
    costoUnitario: 185,
    empleado: 'Ing. Operador Turno',
    credencial: 'EMP-9012',
    observaciones: 'Falla detectada en inspección de salida de prensa.',
  });

  // Datos para gráficas
  const datosTendenciaHora = Object.values(
    movimientosDelPeriodo.reduce<Record<string, { hora: string; scrapPzas: number }>>((acumulado, movimiento) => {
      if (movimiento.movimientoTipoId === 1) {
        const hora = `${movimiento.fecha} ${movimiento.hora}`;
        acumulado[hora] = acumulado[hora] || { hora, scrapPzas: 0 };
        acumulado[hora].scrapPzas += movimiento.cantidad;
      }
      return acumulado;
    }, {})
  ).sort((a, b) => a.hora.localeCompare(b.hora));

  const incidenciaPorLinea = Object.values(
    movimientosDelPeriodo.reduce<Record<string, { certificacion: string; piezas: number }>>((acumulado, movimiento) => {
      const certificacion = String(movimiento.certificacionId);
      acumulado[certificacion] = acumulado[certificacion] || { certificacion, piezas: 0 };
      acumulado[certificacion].piezas += movimiento.cantidad;
      return acumulado;
    }, {})
  ).sort((a, b) => b.piezas - a.piezas);

  // Top motivos de Scrap
  const motivosMap: Record<string, number> = {};
  movimientosDelPeriodo.forEach((m) => {
    const razon = m.razonId === null ? 'Sin razón' : String(m.razonId);
    motivosMap[razon] = (motivosMap[razon] || 0) + m.cantidad;
  });

  const topMotivosData = Object.entries(motivosMap)
    .map(([nombre, cantidad]) => ({
      name: nombre.length > 25 ? nombre.slice(0, 25) + '...' : nombre,
      nombreCompleto: nombre,
      value: cantidad,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const COLORES_MOTIVOS = ['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#8b5cf6'];
  const scrapPiezasPeriodo = useMemo(
    () => movimientosDelPeriodo
      .filter((movimiento) => movimiento.movimientoTipoId === 1)
      .reduce((total, movimiento) => total + movimiento.cantidad, 0),
    [movimientosDelPeriodo],
  );
  const pendientesPeriodo = movimientosDelPeriodo.filter((movimiento) => movimiento.aprobado === 0).length;
  const aprobadosPeriodo = movimientosDelPeriodo.filter((movimiento) => movimiento.aprobado === 1).length;
  const rechazadosPeriodo = movimientosDelPeriodo.filter((movimiento) => movimiento.aprobado === 2).length;

  const handleCrearSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    crearMovimiento({
      ...formNuevo,
      certificacionId: 101,
      aprobado: 0,
      salida: true,
      retorno: false,
      procesado: 0,
      almacenSalida: 'ALM-02 (WIP)',
      almacenRetorno: formNuevo.movimientoTipo === 'Scrap' ? 'ALM-99 (Scrap Yard)' : 'ALM-12 (Retrabajo)',
      almacen: formNuevo.movimientoTipo === 'Scrap' ? 'ALM-99' : 'ALM-12',
    });
    setModalRegistroAbierto(false);
  };

  return (
    <div className="space-y-6">
      {/* Barra de Título Superior y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Monitoreo y Control de Scrap en Tiempo Real
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
              <Flame className="w-3.5 h-3.5 text-amber-500 animate-bounce" /> {turnoActivo}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Consola central de trazabilidad, contención de defectos y control de inventario no conforme.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-2 text-xs font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
            Datos: 2025
          </span>
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={() => descargarCSV(movimientosDelPeriodo, 'scrap-planta-2025.csv')}
          >
            Exportar CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<PlusCircle className="w-4 h-4" />}
            disabled
            title="El alta de movimientos aún no está integrada con SQL Server."
            onClick={() => setModalRegistroAbierto(true)}
          >
            Registrar Incidencia
          </Button>
        </div>
      </div>

      {errorDashboard && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
          <span>No fue posible cargar datos de dbo.Movimientos: {errorDashboard}</span>
          <button onClick={recargarMovimientos} className="font-semibold underline">
            Reintentar
          </button>
        </div>
      )}
      {cargandoDashboard && <p className="text-xs text-slate-500">Consultando dbo.Movimientos para {etiquetaPeriodo}…</p>}

      {/* Tarjetas Principales de KPIs (Power BI & MES Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          titulo={`Piezas Scrap (${etiquetaPeriodo})`}
          valor={`${formatearNumero(scrapPiezasPeriodo)} Pzas`}
          subvalor="El costo no se calcula: no existe en los campos integrados."
          icono={<AlertOctagon className="w-6 h-6" />}
          colorAccent="rose"
        />

        <StatCard
          titulo="Pendiente de Aprobar"
          valor={`${pendientesPeriodo} Folios`}
          subvalor="Conteo según campo aprobado de la tabla"
          icono={<Clock className="w-6 h-6" />}
          variacion={{
            valor: 'Solo lectura',
            esPositiva: pendientesPeriodo === 0,
            etiqueta: 'Aprobación no integrada',
          }}
          colorAccent="amber"
          onClick={() => navigate('/aprobaciones')}
        />

        <StatCard
          titulo="Scrap aprobado (histórico)"
          valor={`${aprobadosPeriodo} Folios`}
          subvalor="Estado leído desde dbo.Movimientos"
          icono={<CheckCircle2 className="w-6 h-6" />}
          variacion={{
            valor: 'SQL Server',
            esPositiva: true,
            etiqueta: 'Lectura directa',
          }}
          colorAccent="emerald"
        />

        <StatCard
          titulo="Scrap rechazado (histórico)"
          valor={`${rechazadosPeriodo} Folios`}
          subvalor="Estado leído desde dbo.Movimientos"
          icono={<XCircle className="w-6 h-6" />}
          variacion={{
            valor: 'SQL Server',
            esPositiva: true,
            etiqueta: 'Lectura directa',
          }}
          colorAccent="blue"
        />
      </div>

      {/* Gráficas: Tendencia por Hora + distribución de motivos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfica de Tendencia por Hora */}
        <Card
          title="Piezas Scrap por fecha y hora"
          subtitle="Agrupación basada en fecha_hora y cantidad de dbo.Movimientos"
          className="lg:col-span-2"
          action={
            <span className="text-xs font-mono font-medium text-slate-500">Datos SQL</span>
          }
        >
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={datosTendenciaHora} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScrap" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.4} />
                <XAxis dataKey="hora" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="scrapPzas"
                  name="Piezas Scrap"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorScrap)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Distribución de piezas por motivo */}
        <Card
          title="Top razones de Scrap"
          subtitle="Agrupación por RazonId; el catálogo de descripciones no está conectado"
          className="lg:col-span-1"
        >
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topMotivosData}
                layout="vertical"
                margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#cbd5e1" strokeOpacity={0.4} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={76}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: any, name: any, item: any) => [
                    `${value} Pzas`,
                    item.payload.nombreCompleto || name,
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="value" name="Piezas" radius={[0, 6, 6, 0]}>
                  {topMotivosData.map((_, index) => (
                    <Cell key={`motivo-${index}`} fill={COLORES_MOTIVOS[index % COLORES_MOTIVOS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Sección Inferior: Líneas con más incidencias + Incidencias Críticas Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Líneas con más incidencias */}
        <Card
          title="Piezas por certificación"
          subtitle="Agrupación por CertificacionId de dbo.Movimientos"
          className="lg:col-span-2"
        >
          <div className="h-64 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidenciaPorLinea} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.4} />
                <XAxis dataKey="certificacion" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${value} Pzas`, 'Total Piezas']}
                />
                <Bar dataKey="piezas" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                  {incidenciaPorLinea.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={entry.piezas > 20 ? '#ef4444' : entry.piezas > 10 ? '#f59e0b' : '#3b82f6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Lista de Movimientos Recientes / En Espera */}
        <Card
          title="Últimos Movimientos Registrados"
          subtitle="Folios recientes listos para auditoría"
          className="lg:col-span-1"
          action={
            <button
              onClick={() => navigate('/movimientos')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
            >
              Ver todos <ArrowRight className="w-3 h-3" />
            </button>
          }
        >
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {movimientosDelPeriodo.slice(0, 4).map((mov) => (
              <div
                key={mov.id}
                onClick={() => navigate(`/movimientos/${mov.id}`)}
                className="py-3 flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-lg cursor-pointer transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                      {mov.id}
                    </span>
                    <Badge estatus={mov.estatus} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">
                    {mov.matnr}{mov.matnrFg ? ` • ${mov.matnrFg}` : ''}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    Certificación {mov.certificacionId} • {mov.cantidad} pza • {mov.fecha} {mov.hora}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    {mov.serial || 'Sin serial'}
                  </span>
                  <span className="text-[10px] text-slate-400">{mov.movimientoTipo}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Modal para Registro Rápido */}
      <Modal
        isOpen={modalRegistroAbierto}
        onClose={() => setModalRegistroAbierto(false)}
        title="Registro Manual de Movimiento / Scrap MES"
        subtitle="Genera una nueva boleta de movimiento con trazabilidad industrial"
        maxWidth="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalRegistroAbierto(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleCrearSubmit}>
              Registrar Movimiento
            </Button>
          </>
        }
      >
        <form onSubmit={handleCrearSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Número de Parte SAP (MATNR)
              </label>
              <input
                type="text"
                required
                value={formNuevo.matnr}
                onChange={(e) => setFormNuevo({ ...formNuevo, matnr: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Descripción del Componente
              </label>
              <input
                type="text"
                required
                value={formNuevo.descripcion}
                onChange={(e) => setFormNuevo({ ...formNuevo, descripcion: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Línea de Producción
              </label>
              <select
                value={formNuevo.linea}
                onChange={(e) => setFormNuevo({ ...formNuevo, linea: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {LINEAS_PRODUCCION.map((l) => (
                  <option key={l.id} value={l.nombre}>
                    {l.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tipo de Movimiento
              </label>
              <select
                value={formNuevo.movimientoTipo}
                onChange={(e) => setFormNuevo({ ...formNuevo, movimientoTipo: e.target.value as CategoriaMotivo })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {CATEGORIAS_MOTIVOS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Cantidad (Pzas)
              </label>
              <input
                type="number"
                min="1"
                required
                value={formNuevo.cantidad}
                onChange={(e) => setFormNuevo({ ...formNuevo, cantidad: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Costo Unitario ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                required
                value={formNuevo.costoUnitario}
                onChange={(e) => setFormNuevo({ ...formNuevo, costoUnitario: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Credencial Operador
              </label>
              <input
                type="text"
                required
                value={formNuevo.credencial}
                onChange={(e) => setFormNuevo({ ...formNuevo, credencial: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Motivo Específico del Defecto
            </label>
            <input
              type="text"
              required
              value={formNuevo.motivoEspecifico}
              onChange={(e) => setFormNuevo({ ...formNuevo, motivoEspecifico: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Observaciones / Causa Raíz
            </label>
            <textarea
              rows={2}
              value={formNuevo.observaciones}
              onChange={(e) => setFormNuevo({ ...formNuevo, observaciones: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Describa el origen del problema o condición de máquina..."
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
