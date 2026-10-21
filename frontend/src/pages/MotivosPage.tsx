import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Tag,
  RotateCcw,
} from 'lucide-react';
import { useScrap } from '../context/ScrapContext';
import type { Motivo, CategoriaMotivo, SeveridadMotivo } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { CATEGORIAS_MOTIVOS } from '../constants';
import { formatearMoneda } from '../utils/formatters';

export const MotivosPage: React.FC = () => {
  const { motivos, crearMotivo, actualizarMotivo, eliminarMotivo } = useScrap();

  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroSeveridad, setFiltroSeveridad] = useState('');

  // Modales
  const [modalAbierto, setModalAbierto] = useState(false);
  const [motivoEditando, setMotivoEditando] = useState<Motivo | null>(null);

  // Formulario
  const [formData, setFormData] = useState<Omit<Motivo, 'id'>>({
    codigo: '',
    nombre: '',
    categoria: 'Scrap',
    descripcion: '',
    severidad: 'Media',
    activo: true,
    costoDefectoPromedio: 100,
  });

  const motivosFiltrados = useMemo(() => {
    return motivos.filter((m) => {
      const coincideBusqueda =
        busqueda === '' ||
        m.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.descripcion.toLowerCase().includes(busqueda.toLowerCase());

      const coincideCategoria = filtroCategoria === '' || m.categoria === filtroCategoria;
      const coincideSeveridad = filtroSeveridad === '' || m.severidad === filtroSeveridad;

      return coincideBusqueda && coincideCategoria && coincideSeveridad;
    });
  }, [motivos, busqueda, filtroCategoria, filtroSeveridad]);

  const abrirModalCrear = () => {
    setMotivoEditando(null);
    setFormData({
      codigo: `MOT-${Math.floor(100 + Math.random() * 900)}`,
      nombre: '',
      categoria: 'Scrap',
      descripcion: '',
      severidad: 'Media',
      activo: true,
      costoDefectoPromedio: 120,
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (motivo: Motivo) => {
    setMotivoEditando(motivo);
    setFormData({
      codigo: motivo.codigo,
      nombre: motivo.nombre,
      categoria: motivo.categoria,
      descripcion: motivo.descripcion,
      severidad: motivo.severidad,
      activo: motivo.activo,
      costoDefectoPromedio: motivo.costoDefectoPromedio || 0,
    });
    setModalAbierto(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (motivoEditando) {
      actualizarMotivo(motivoEditando.id, formData);
    } else {
      crearMotivo(formData);
    }
    setModalAbierto(false);
  };

  const alternarEstadoActivo = (motivo: Motivo) => {
    actualizarMotivo(motivo.id, { activo: !motivo.activo });
  };

  return (
    <div className="space-y-5">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Catálogo de Motivos de Movimiento
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Estandarización de clasificaciones y causas raíz para scrap, retrabajos, calidad y cuarentenas.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={abrirModalCrear}
        >
          Nuevo Motivo
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código, nombre o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full md:w-auto">
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="px-2.5 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Todas las Categorías</option>
            {CATEGORIAS_MOTIVOS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={filtroSeveridad}
            onChange={(e) => setFiltroSeveridad(e.target.value)}
            className="px-2.5 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Severidad</option>
            <option value="Crítica">Crítica</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>

          <button
            onClick={() => {
              setBusqueda('');
              setFiltroCategoria('');
              setFiltroSeveridad('');
            }}
            className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer</span>
          </button>
        </div>
      </div>

      {/* Grid de Tarjetas de Motivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {motivosFiltrados.map((motivo) => (
          <div
            key={motivo.id}
            className={`bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between ${
              motivo.activo
                ? 'border-slate-200 dark:border-slate-800'
                : 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50/50'
            }`}
          >
            <div>
              {/* Header de la tarjeta */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                  {motivo.codigo}
                </span>
                <div className="flex items-center gap-1.5">
                  <Badge severidad={motivo.severidad} size="sm" />
                  <span
                    className={`w-2 h-2 rounded-full ${
                      motivo.activo ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                    title={motivo.activo ? 'Activo' : 'Inactivo'}
                  />
                </div>
              </div>

              {/* Nombre y Categoría */}
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">
                {motivo.nombre}
              </h3>

              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {motivo.categoria}
                </span>
              </div>

              {/* Descripción */}
              <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                {motivo.descripcion}
              </p>
            </div>

            {/* Costo y Botones de Acción */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Costo Ref.
                </span>
                <span className="font-mono font-semibold text-xs text-slate-800 dark:text-slate-200">
                  {motivo.costoDefectoPromedio ? formatearMoneda(motivo.costoDefectoPromedio) : 'N/A'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => alternarEstadoActivo(motivo)}
                  className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                    motivo.activo
                      ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                      : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={motivo.activo ? 'Desactivar motivo' : 'Activar motivo'}
                >
                  {motivo.activo ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => abrirModalEditar(motivo)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                  title="Editar Motivo"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => eliminarMotivo(motivo.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Eliminar Motivo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Crear / Editar Motivo */}
      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={motivoEditando ? 'Editar Motivo de Movimiento' : 'Registrar Nuevo Motivo'}
        subtitle="Mantenimiento del catálogo maestro de defectos de manufactura"
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {motivoEditando ? 'Guardar Cambios' : 'Registrar Motivo'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Código Estandarizado *
              </label>
              <input
                type="text"
                required
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Categoría *
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value as CategoriaMotivo })}
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

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nombre / Título del Motivo *
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Ej. Deformación por sobrepresión de pisador"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Severidad
              </label>
              <select
                value={formData.severidad}
                onChange={(e) => setFormData({ ...formData, severidad: e.target.value as SeveridadMotivo })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Crítica">Crítica</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Costo Estimado ($)
              </label>
              <input
                type="number"
                min="0"
                value={formData.costoDefectoPromedio}
                onChange={(e) => setFormData({ ...formData, costoDefectoPromedio: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Descripción Técnica y Criterio de Falla
            </label>
            <textarea
              rows={3}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Detalle los límites de tolerancia o condiciones del defecto..."
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="motivoActivo"
              checked={formData.activo}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="motivoActivo" className="text-slate-700 dark:text-slate-300 select-none">
              Motivo habilitado para captura en terminales de línea
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};
