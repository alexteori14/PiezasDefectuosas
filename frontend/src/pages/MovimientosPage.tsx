import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowUpDown,
  Eye,
  Check,
  X,
  FileSpreadsheet,
  RotateCcw,
  Plus,
} from 'lucide-react';
import { useScrap } from '../context/ScrapContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Pagination } from '../components/common/Pagination';
import { descargarCSV } from '../utils/formatters';
import { CATEGORIAS_MOTIVOS, LINEAS_PRODUCCION } from '../constants';

type CampoOrden = 'id' | 'fecha' | 'matnr' | 'cantidad' | 'estatus' | 'linea';

export const MovimientosPage: React.FC = () => {
  const { movimientos, aprobarMovimiento, rechazarMovimiento } = useScrap();
  const navigate = useNavigate();

  // Estados de filtros y búsqueda
  const [busqueda, setBusqueda] = useState('');
  const [filtroLinea, setFiltroLinea] = useState('');
  const [filtroEstatus, setFiltroEstatus] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroTurno, setFiltroTurno] = useState('');

  // Ordenamiento
  const [ordenCampo, setOrdenCampo] = useState<CampoOrden>('id');
  const [ordenAsc, setOrdenAsc] = useState(false);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(10);

  // Filtrado reactivo
  const movimientosFiltrados = useMemo(() => {
    return movimientos.filter((m) => {
      const coincideBusqueda =
        busqueda === '' ||
        m.id.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.matnr.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.empleado.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.credencial.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.linea.toLowerCase().includes(busqueda.toLowerCase());

      const coincideLinea = filtroLinea === '' || m.linea.includes(filtroLinea);
      const coincideEstatus = filtroEstatus === '' || m.estatus === filtroEstatus;
      const coincideTipo = filtroTipo === '' || m.movimientoTipo === filtroTipo;
      const coincideTurno = filtroTurno === '' || m.turno === filtroTurno;

      return coincideBusqueda && coincideLinea && coincideEstatus && coincideTipo && coincideTurno;
    });
  }, [movimientos, busqueda, filtroLinea, filtroEstatus, filtroTipo, filtroTurno]);

  // Ordenar resultados
  const movimientosOrdenados = useMemo(() => {
    return [...movimientosFiltrados].sort((a, b) => {
      let valorA: any = a[ordenCampo];
      let valorB: any = b[ordenCampo];

      if (ordenCampo === 'fecha') {
        valorA = `${a.fecha} ${a.hora}`;
        valorB = `${b.fecha} ${b.hora}`;
      }

      if (typeof valorA === 'string') {
        return ordenAsc ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
      }
      return ordenAsc ? valorA - valorB : valorB - valorA;
    });
  }, [movimientosFiltrados, ordenCampo, ordenAsc]);

  // Elementos paginados
  const totalPaginas = Math.ceil(movimientosOrdenados.length / elementosPorPagina);
  const movimientosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * elementosPorPagina;
    return movimientosOrdenados.slice(inicio, inicio + elementosPorPagina);
  }, [movimientosOrdenados, paginaActual, elementosPorPagina]);

  const alternarOrden = (campo: CampoOrden) => {
    if (ordenCampo === campo) {
      setOrdenAsc(!ordenAsc);
    } else {
      setOrdenCampo(campo);
      setOrdenAsc(true);
    }
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroLinea('');
    setFiltroEstatus('');
    setFiltroTipo('');
    setFiltroTurno('');
    setPaginaActual(1);
  };

  return (
    <div className="space-y-5">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Registro General de Movimientos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Auditoría integral de movimientos, salidas de almacén, devoluciones y desecho de materiales.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
            onClick={() => descargarCSV(movimientosFiltrados, `movimientos-filtrados-${new Date().toISOString().slice(0, 10)}.csv`)}
          >
            Descargar ({movimientosFiltrados.length})
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/dashboard')}
          >
            Nuevo Registro
          </Button>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Búsqueda Global */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por ID, MATNR, Empleado, Credencial, Pieza..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtros Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
            {/* Filtro Línea */}
            <select
              value={filtroLinea}
              onChange={(e) => {
                setFiltroLinea(e.target.value);
                setPaginaActual(1);
              }}
              className="px-2.5 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todas las Líneas</option>
              {LINEAS_PRODUCCION.map((l) => (
                <option key={l.id} value={l.codigo}>
                  {l.codigo}
                </option>
              ))}
            </select>

            {/* Filtro Estatus */}
            <select
              value={filtroEstatus}
              onChange={(e) => {
                setFiltroEstatus(e.target.value);
                setPaginaActual(1);
              }}
              className="px-2.5 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos los Estatus</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Rechazado">Rechazado</option>
              <option value="En Cuarentena">En Cuarentena</option>
              <option value="Retrabajo">Retrabajo</option>
            </select>

            {/* Filtro Tipo */}
            <select
              value={filtroTipo}
              onChange={(e) => {
                setFiltroTipo(e.target.value);
                setPaginaActual(1);
              }}
              className="px-2.5 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Tipo Movimiento</option>
              {CATEGORIAS_MOTIVOS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Limpiar */}
            <button
              onClick={limpiarFiltros}
              className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
              title="Restablecer filtros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabla Principal de Movimientos */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th
                  onClick={() => alternarOrden('id')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => alternarOrden('matnr')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>MATNR</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => alternarOrden('fecha')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Fecha / Hora</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3">Credencial</th>
                <th className="px-4 py-3">Movimiento</th>
                <th
                  onClick={() => alternarOrden('cantidad')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Cantidad</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3">Salida</th>
                <th className="px-4 py-3">Retorno</th>
                <th className="px-4 py-3">Empleado</th>
                <th
                  onClick={() => alternarOrden('linea')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Línea</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3">Almacén</th>
                <th
                  onClick={() => alternarOrden('estatus')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Estatus</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-normal">
              {movimientosPaginados.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-10 text-center text-slate-500">
                    No se encontraron movimientos con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                movimientosPaginados.map((mov) => (
                  <tr
                    key={mov.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* ID */}
                    <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                      <button
                        onClick={() => navigate(`/movimientos/${mov.id}`)}
                        className="hover:underline flex items-center gap-1"
                      >
                        {mov.id}
                      </button>
                    </td>

                    {/* MATNR */}
                    <td className="px-4 py-3">
                      <div className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {mov.matnr}
                      </div>
                      <div className="text-[11px] text-slate-400 max-w-[160px] truncate">
                        {mov.descripcion}
                      </div>
                    </td>

                    {/* Fecha */}
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      <div>{mov.fecha}</div>
                      <div className="text-[10px] text-slate-400">{mov.hora} • {mov.turno}</div>
                    </td>

                    {/* Credencial */}
                    <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400">
                      {mov.credencial}
                    </td>

                    {/* Movimiento */}
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                        {mov.movimientoTipo}
                      </span>
                    </td>

                    {/* Cantidad */}
                    <td className="px-4 py-3 font-mono font-bold text-right text-slate-800 dark:text-slate-100">
                      {mov.cantidad} <span className="text-[10px] text-slate-400 font-normal">{mov.unidad}</span>
                    </td>

                    {/* Salida */}
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-[11px]">
                      {mov.almacenSalida}
                    </td>

                    {/* Retorno */}
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-[11px]">
                      {mov.almacenRetorno}
                    </td>

                    {/* Empleado */}
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {mov.empleado}
                    </td>

                    {/* Línea */}
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      <span className="font-semibold">{mov.linea.split(' ')[0]}</span>{' '}
                      <span className="text-[10px] text-slate-400 hidden xl:inline">
                        {mov.linea.split(' ').slice(1, 3).join(' ')}
                      </span>
                    </td>

                    {/* Almacén */}
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      {mov.almacen}
                    </td>

                    {/* Estatus */}
                    <td className="px-4 py-3">
                      <Badge estatus={mov.estatus} size="sm" />
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => navigate(`/movimientos/${mov.id}`)}
                          className="p-1 rounded text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Ver Detalle y Trazabilidad"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {mov.estatus === 'Pendiente' && (
                          <>
                            <button
                              onClick={() => aprobarMovimiento(mov.id)}
                              className="p-1 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                              title="Aprobar Movimiento"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => rechazarMovimiento(mov.id)}
                              className="p-1 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                              title="Rechazar Movimiento"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <Pagination
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          totalElementos={movimientosOrdenados.length}
          elementosPorPagina={elementosPorPagina}
          onCambiarPagina={(pag) => setPaginaActual(pag)}
          onCambiarElementosPorPagina={(cant) => {
            setElementosPorPagina(cant);
            setPaginaActual(1);
          }}
        />
      </div>
    </div>
  );
};
