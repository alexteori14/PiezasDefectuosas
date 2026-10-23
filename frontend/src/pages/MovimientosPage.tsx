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
  Database,
  Tag,
} from 'lucide-react';
import { useScrap } from '../context/ScrapContext';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { descargarCSV } from '../utils/formatters';
import { CATEGORIAS_MOTIVOS, LINEAS_PRODUCCION } from '../constants';

type CampoOrden = 'id' | 'fecha' | 'matnr' | 'cantidad' | 'estatus' | 'linea' | 'serial' | 'razonId';

export const MovimientosPage: React.FC = () => {
  const { movimientos, razonesCatalogo, aprobarMovimiento, rechazarMovimiento } = useScrap();
  const navigate = useNavigate();

  // Estados de filtros y búsqueda
  const [busqueda, setBusqueda] = useState('');
  const [filtroLinea, setFiltroLinea] = useState('');
  const [filtroEstatus, setFiltroEstatus] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroRazon, setFiltroRazon] = useState('');
  const [filtroTurno, setFiltroTurno] = useState('');

  // Ordenamiento
  const [ordenCampo, setOrdenCampo] = useState<CampoOrden>('id');
  const [ordenAsc, setOrdenAsc] = useState(false);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(10);

  // Filtrado reactivo con soporte para campos de dbo.Movimientos
  const movimientosFiltrados = useMemo(() => {
    return movimientos.filter((m) => {
      const q = busqueda.toLowerCase().trim();
      const coincideBusqueda =
        q === '' ||
        m.id.toString().includes(q) ||
        (m.serial && m.serial.toLowerCase().includes(q)) ||
        m.matnr.toLowerCase().includes(q) ||
        (m.matnrFg && m.matnrFg.toLowerCase().includes(q)) ||
        m.descripcion.toLowerCase().includes(q) ||
        m.empleado.toLowerCase().includes(q) ||
        m.credencial.toLowerCase().includes(q) ||
        (m.motivoEspecifico && m.motivoEspecifico.toLowerCase().includes(q)) ||
        (m.razonId && m.razonId.toString().includes(q)) ||
        m.linea.toLowerCase().includes(q);

      const coincideLinea = filtroLinea === '' || m.linea.includes(filtroLinea);
      const coincideEstatus = filtroEstatus === '' || m.estatus === filtroEstatus;
      const coincideTipo = filtroTipo === '' || m.movimientoTipo === filtroTipo;
      const coincideRazon = filtroRazon === '' || (m.razonId && m.razonId.toString() === filtroRazon);
      const coincideTurno = filtroTurno === '' || m.turno === filtroTurno;

      return coincideBusqueda && coincideLinea && coincideEstatus && coincideTipo && coincideRazon && coincideTurno;
    });
  }, [movimientos, busqueda, filtroLinea, filtroEstatus, filtroTipo, filtroRazon, filtroTurno]);

  // Ordenar resultados
  const movimientosOrdenados = useMemo(() => {
    return [...movimientosFiltrados].sort((a, b) => {
      let valorA: any = a[ordenCampo];
      let valorB: any = b[ordenCampo];

      if (ordenCampo === 'fecha') {
        valorA = `${a.fecha} ${a.hora}`;
        valorB = `${b.fecha} ${b.hora}`;
      } else if (ordenCampo === 'id') {
        valorA = Number(a.id) || 0;
        valorB = Number(b.id) || 0;
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
    setFiltroRazon('');
    setFiltroTurno('');
    setPaginaActual(1);
  };

  return (
    <div className="space-y-5">
      {/* Cabecera de Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Control de Movimientos de Materiales
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Database className="w-3 h-3" />
              dbo.Movimientos
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Registro unificado de piezas no conformes, scrap y retrabajos con serial de marbete y trazabilidad IATF 16949.
          </p>
        </div>

        {/* Acciones de Cabecera */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => descargarCSV(movimientosFiltrados, 'movimientos-dbo-scrap.csv')}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors shadow-xs"
            title="Exportar registros filtrados a CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Buscador General */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              placeholder="Buscar por Folio Serial, MATNR, MATNR_FG, Razón o Empleado..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Filtros Dropdown */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
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

            {/* Filtro Estatus / Aprobado */}
            <select
              value={filtroEstatus}
              onChange={(e) => {
                setFiltroEstatus(e.target.value);
                setPaginaActual(1);
              }}
              className="px-2.5 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Estado Aprobación</option>
              <option value="Pendiente">Pendiente (aprobado = 0)</option>
              <option value="Aprobado">Aprobado (aprobado = 1)</option>
              <option value="Rechazado">Rechazado (aprobado = 2)</option>
              <option value="En Cuarentena">En Cuarentena</option>
            </select>

            {/* Filtro Tipo de Movimiento */}
            <select
              value={filtroTipo}
              onChange={(e) => {
                setFiltroTipo(e.target.value);
                setPaginaActual(1);
              }}
              className="px-2.5 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Tipo Movimiento</option>
              {CATEGORIAS_MOTIVOS.map((cat, idx) => (
                <option key={cat} value={cat}>
                  {idx + 1} - {cat}
                </option>
              ))}
            </select>

            {/* Filtro Razón de Falla */}
            <select
              value={filtroRazon}
              onChange={(e) => {
                setFiltroRazon(e.target.value);
                setPaginaActual(1);
              }}
              className="px-2.5 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Razón (EtiquetasCI)</option>
              {razonesCatalogo.slice(0, 15).map((r) => (
                <option key={r.idRazon} value={r.idRazon.toString()}>
                  {r.idRazon} - {r.descripcion}
                </option>
              ))}
            </select>

            {/* Limpiar */}
            <button
              onClick={limpiarFiltros}
              className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:white bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
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
                    <span>ID / Serial</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => alternarOrden('matnr')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>MATNR (SAP)</span>
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
                <th className="px-4 py-3">Tipo Movimiento</th>
                <th className="px-4 py-3">Razón (EtiquetasCI)</th>
                <th
                  onClick={() => alternarOrden('cantidad')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Cantidad</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3">Almacén</th>
                <th className="px-4 py-3">Empleado</th>
                <th
                  onClick={() => alternarOrden('estatus')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Aprobado</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-normal">
              {movimientosPaginados.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-slate-500">
                    No se encontraron movimientos registrados en dbo.Movimientos con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                movimientosPaginados.map((mov) => (
                  <tr
                    key={mov.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* ID y Serial */}
                    <td className="px-4 py-3 font-mono">
                      <button
                        onClick={() => navigate(`/movimientos/${mov.id}`)}
                        className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex flex-col text-left"
                      >
                        <span>#{mov.id}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                          {mov.serial}
                        </span>
                      </button>
                    </td>

                    {/* MATNR y MATNR_FG */}
                    <td className="px-4 py-3">
                      <div className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {mov.matnr}
                      </div>
                      <div className="text-[11px] text-slate-400 max-w-[150px] truncate">
                        {mov.descripcion}
                      </div>
                      {mov.matnrFg && (
                        <span className="inline-block text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                          FG: {mov.matnrFg}
                        </span>
                      )}
                    </td>

                    {/* Fecha y Hora */}
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      <div>{mov.fecha}</div>
                      <div className="text-[10px] text-slate-400">{mov.hora} • {mov.turno}</div>
                    </td>

                    {/* Credencial */}
                    <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400">
                      {mov.credencial}
                    </td>

                    {/* MovimientoTipoId */}
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                        {mov.movimientoTipoId} - {mov.movimientoTipo}
                      </span>
                    </td>

                    {/* RazonId (EtiquetasCI) */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {mov.razonId}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                          {mov.motivoEspecifico}
                        </span>
                      </div>
                    </td>

                    {/* Cantidad */}
                    <td className="px-4 py-3 font-mono font-bold text-right text-slate-800 dark:text-slate-100">
                      {mov.cantidad} <span className="text-[10px] text-slate-400 font-normal">{mov.unidad}</span>
                    </td>

                    {/* Almacén */}
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {mov.almacen}
                      </span>
                    </td>

                    {/* Empleado */}
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      <div className="truncate max-w-[120px]">{mov.empleado}</div>
                    </td>

                    {/* Estatus / Aprobado */}
                    <td className="px-4 py-3">
                      <Badge estatus={mov.estatus} size="sm" />
                      {mov.nvAprobadoPor && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[110px] mt-0.5">
                          {mov.nvAprobadoPor}
                        </div>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => navigate(`/movimientos/${mov.id}`)}
                          className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Ver Ficha Técnica 360°"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {mov.aprobado === 0 && (
                          <>
                            <button
                              onClick={() => aprobarMovimiento(mov.id)}
                              className="p-1 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                              title="Aprobar Movimiento (aprobado = 1)"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => rechazarMovimiento(mov.id)}
                              className="p-1 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                              title="Rechazar Movimiento (aprobado = 2)"
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
        {totalPaginas > 1 && (
          <Pagination
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            totalElementos={movimientosOrdenados.length}
            elementosPorPagina={elementosPorPagina}
            onCambiarPagina={(p: number) => setPaginaActual(p)}
            onCambiarElementosPorPagina={(cant: number) => {
              setElementosPorPagina(cant);
              setPaginaActual(1);
            }}
          />
        )}
      </div>
    </div>
  );
};
