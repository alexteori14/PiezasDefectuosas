import React, { useState } from 'react';
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
  PieChart,
  Pie,
} from 'recharts';
import { useScrap } from '../context/ScrapContext';
import { StatCard } from '../components/common/StatCard';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { formatearMoneda, formatearNumero, descargarCSV } from '../utils/formatters';
import { CATEGORIAS_MOTIVOS, LINEAS_PRODUCCION } from '../constants';
import type { CategoriaMotivo } from '../types';

export const DashboardPage: React.FC = () => {
  const { movimientos, resumenKPIs, turnoActivo, crearMovimiento, razonesCatalogo } = useScrap();
  const navigate = useNavigate();

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
  const datosTendenciaHora = [
    { hora: '06:00', scrapPzas: 4, limiteAlerta: 10 },
    { hora: '07:00', scrapPzas: 14, limiteAlerta: 10 },
    { hora: '08:00', scrapPzas: 8, limiteAlerta: 10 },
    { hora: '09:00', scrapPzas: 12, limiteAlerta: 10 },
    { hora: '10:00', scrapPzas: 5, limiteAlerta: 10 },
    { hora: '11:00', scrapPzas: 9, limiteAlerta: 10 },
    { hora: '12:00', scrapPzas: 18, limiteAlerta: 10 },
    { hora: '13:00', scrapPzas: 7, limiteAlerta: 10 },
  ];

  // Agrupar por líneas
  const incidenciaPorLinea = LINEAS_PRODUCCION.map((linea) => {
    const totalPzas = movimientos
      .filter((m) => m.linea.includes(linea.codigo))
      .reduce((sum, m) => sum + m.cantidad, 0);

    return {
      codigo: linea.codigo,
      nombre: linea.nombre.split(' ')[1] || linea.codigo,
      piezas: totalPzas,
      metaMax: linea.metaScrapMaximo * 20,
    };
  }).sort((a, b) => b.piezas - a.piezas);

  // Top motivos de Scrap
  const motivosMap: Record<string, number> = {};
  movimientos.forEach((m) => {
    motivosMap[m.motivoEspecifico] = (motivosMap[m.motivoEspecifico] || 0) + m.cantidad;
  });

  const topMotivosData = Object.entries(motivosMap)
    .map(([nombre, cantidad]) => ({
      name: nombre.length > 25 ? nombre.slice(0, 25) + '...' : nombre,
      nombreCompleto: nombre,
      value: cantidad,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const COLORES_PIE = ['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#8b5cf6'];

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
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={() => descargarCSV(movimientos, `scrap-planta-${new Date().toISOString().slice(0, 10)}.csv`)}
          >
            Exportar CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<PlusCircle className="w-4 h-4" />}
            onClick={() => setModalRegistroAbierto(true)}
          >
            Registrar Incidencia
          </Button>
        </div>
      </div>

      {/* Tarjetas Principales de KPIs (Power BI & MES Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          titulo="Scrap Generado Hoy"
          valor={`${formatearNumero(resumenKPIs.scrapHoyPzas)} Pzas`}
          subvalor={`Costo estimado: ${formatearMoneda(resumenKPIs.scrapHoyCosto)}`}
          icono={<AlertOctagon className="w-6 h-6" />}
          variacion={{
            valor: `${resumenKPIs.tasaScrapGeneral}% OEE Loss`,
            esPositiva: false,
            etiqueta: 'vs meta de planta (1.0%)',
          }}
          colorAccent="rose"
        />

        <StatCard
          titulo="Pendiente de Aprobar"
          valor={`${resumenKPIs.pendientesAprobar} Folios`}
          subvalor="Requiere firma de supervisor"
          icono={<Clock className="w-6 h-6" />}
          variacion={{
            valor: 'Atención Requerida',
            esPositiva: resumenKPIs.pendientesAprobar === 0,
            etiqueta: 'Bandeja activa',
          }}
          colorAccent="amber"
          onClick={() => navigate('/aprobaciones')}
        />

        <StatCard
          titulo="Scrap Aprobado Hoy"
          valor={`${resumenKPIs.aprobadosHoy} Folios`}
          subvalor="Transferido a ALM-99 / SAP 551"
          icono={<CheckCircle2 className="w-6 h-6" />}
          variacion={{
            valor: '100% Trazable',
            esPositiva: true,
            etiqueta: 'Contabilizado',
          }}
          colorAccent="emerald"
        />

        <StatCard
          titulo="Scrap Rechazado / Recuperado"
          valor={`${resumenKPIs.rechazadosHoy} Folios`}
          subvalor="Canalizado a Retrabajo / NDT"
          icono={<XCircle className="w-6 h-6" />}
          variacion={{
            valor: 'Material Salvado',
            esPositiva: true,
            etiqueta: 'Ahorro de chatarra',
          }}
          colorAccent="blue"
        />
      </div>

      {/* Gráficas: Tendencia por Hora + Pareto Top Motivos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfica de Tendencia por Hora */}
        <Card
          title="Tendencia de Generación de Scrap por Hora (Turno Activo)"
          subtitle="Comportamiento horario contra límite admisible por estación"
          className="lg:col-span-2"
          action={
            <span className="text-xs font-mono font-medium text-slate-500">
              Límite admisible: 10 pz/h
            </span>
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

        {/* Top Motivos de Scrap (Donut Pareto) */}
        <Card
          title="Top Motivos de Scrap"
          subtitle="Pareto de defectos registrados en planta"
          className="lg:col-span-1"
        >
          <div className="h-72 w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="75%">
              <PieChart>
                <Pie
                  data={topMotivosData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {topMotivosData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORES_PIE[index % COLORES_PIE.length]} />
                  ))}
                </Pie>
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
              </PieChart>
            </ResponsiveContainer>

            {/* Leyenda personalizada compacta */}
            <div className="w-full space-y-1.5 px-2">
              {topMotivosData.slice(0, 3).map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLORES_PIE[i % COLORES_PIE.length] }}
                    />
                    <span className="truncate text-slate-600 dark:text-slate-300">
                      {item.nombreCompleto}
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 ml-2">
                    {item.value} pz
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Sección Inferior: Líneas con más incidencias + Incidencias Críticas Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Líneas con más incidencias */}
        <Card
          title="Líneas con Mayor Incidencia de Defectos"
          subtitle="Piezas acumuladas durante el periodo operativo"
          className="lg:col-span-2"
        >
          <div className="h-64 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidenciaPorLinea} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.4} />
                <XAxis dataKey="codigo" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
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
            {movimientos.slice(0, 4).map((mov) => (
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
                    {mov.matnr} - {mov.descripcion}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {mov.linea.split(' ')[0]} • {mov.cantidad} {mov.unidad} • {mov.hora}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    {formatearMoneda(mov.costoTotal)}
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
