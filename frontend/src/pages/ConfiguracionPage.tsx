import React, { useState } from 'react';
import {
  RotateCcw,
  Save,
  Server,
  Database,
  FileCode,
  FolderGit2,
} from 'lucide-react';
import { useScrap } from '../context/ScrapContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { INFO_PLANTA, TURNOS_PLANTA, ALMACENES } from '../constants';

export const ConfiguracionPage: React.FC = () => {
  const { turnoActivo, resetearDatosMock, agregarToast } = useScrap();

  const [plantaConfig, setPlantaConfig] = useState({
    nombre: INFO_PLANTA.nombre,
    division: INFO_PLANTA.organizacion,
    sapCode: INFO_PLANTA.codigoSapPlanta,
    toleranciaScrap: 1.2,
    alertaSonora: true,
    notificacionesEmail: true,
  });

  const handleGuardarAjustes = (e: React.FormEvent) => {
    e.preventDefault();
    agregarToast('success', 'Configuración Guardada', 'Los parámetros de planta y umbrales han sido actualizados.');
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Configuración del Sistema MES & Base de Datos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Parámetros de operación industrial, sincronización SAP S/4HANA y modelo de base de datos SQL Server.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={<RotateCcw className="w-4 h-4 text-rose-500" />}
          onClick={resetearDatosMock}
        >
          Reiniciar Datos
        </Button>
      </div>

      <form onSubmit={handleGuardarAjustes} className="space-y-6">
        {/* MODELO DE BASE DE DATOS SQL SERVER MANAGEMENT STUDIO */}
        <Card
          title="Arquitectura de Base de Datos (SQL Server Management Studio)"
          subtitle="Esquema adaptado con fidelidad 100% a dbo.Movimientos y tablas foráneas"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex items-start gap-3">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-blue-900 dark:text-blue-200 text-sm">
                  Esquema Oficial SSMS en Carpeta `BaseDeDatos`
                </h4>
                <p className="text-blue-700 dark:text-blue-300 mt-0.5">
                  El proyecto ha sido adaptado íntegramente a la estructura relacional extraída de <code className="font-mono">Base de datos Estructura</code>. Todo el código DDL, seeds y diccionario se resguarda en la carpeta raíz <strong className="font-mono">BaseDeDatos/</strong>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tabla Principal */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-blue-500" />
                    dbo.Movimientos
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    20 Columnas
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Contiene folios, certificaciones, MATNR, credencial, cantidad, banderas de salida/retorno, estatus de aprobación (0: Pendiente, 1: Aprobado, 2: Rechazado), almacén y seriales.
                </p>
                <div className="font-mono text-[10px] text-slate-500 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                  id, CertificacionId, MATNR, fecha_hora, credencial, MovimientoTipoId, cantidad, salida, retorno, EmpleadoId, Empleado, procesado, aprobado, RazonId, centro_costo, almacen, serial, MATNR_FG, nvAprobadoPor, dtAprobado
                </div>
              </div>

              {/* Tablas Foráneas */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <FolderGit2 className="w-3.5 h-3.5 text-indigo-500" />
                    Tablas Referenciadas (FK)
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    3 Catálogos
                  </span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <code className="font-mono font-bold">dbo.MovimientoTipo</code>: 8 categorías (Scrap, Retrabajo, Calidad...)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <code className="font-mono font-bold">dbo.EtiquetasCI</code>: 58+ razones automotrices (5001 Arrugas, 5010 Fisura...)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <code className="font-mono font-bold">dbo.Certificaciones</code>: Estaciones de impresión y líneas de prensas
                  </li>
                </ul>
              </div>
            </div>

            {/* Ficheros de la Carpeta BaseDeDatos */}
            <div className="p-3 bg-slate-100/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Artefactos Disponibles en Carpeta BaseDeDatos:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <FileCode className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>01_Schema_SSMS.sql</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <FileCode className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>02_Seeds_SSMS.sql</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <FileCode className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>03_Vistas_y_Procedimientos.sql</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Parámetros de la Planta Automotriz */}
        <Card
          title="Parámetros de Planta & Conexión ERP SAP"
          subtitle="Identificación oficial de la unidad de manufactura y centros de beneficio"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nombre de Planta
              </label>
              <input
                type="text"
                value={plantaConfig.nombre}
                onChange={(e) => setPlantaConfig({ ...plantaConfig, nombre: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                División Corporativa
              </label>
              <input
                type="text"
                value={plantaConfig.division}
                onChange={(e) => setPlantaConfig({ ...plantaConfig, division: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Código SAP de Planta (Werks)
              </label>
              <input
                type="text"
                value={plantaConfig.sapCode}
                onChange={(e) => setPlantaConfig({ ...plantaConfig, sapCode: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-500" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                Conector SAP RFC / BAPI_GOODSMVT_CREATE
              </span>
            </div>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
              Conectado (Simulado)
            </span>
          </div>
        </Card>

        {/* Turnos de Operación y Umbrales de Calidad */}
        <Card
          title="Turnos de Manufactura & Metas de Calidad"
          subtitle="Horarios fijos; el turno activo se calcula automáticamente con el reloj local."
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {TURNOS_PLANTA.map((turno) => (
                <div
                  key={turno.id}
                  className={`p-3 rounded-xl border transition-all ${
                    turnoActivo === turno.id
                      ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-900 dark:text-blue-100 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{turno.etiqueta}</span>
                    {turnoActivo === turno.id && (
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>
                  <div className="text-[11px] opacity-75 font-mono mt-1">{turno.horario}</div>
                  {turnoActivo === turno.id && (
                    <div className="text-[10px] mt-2 font-normal">
                      Activo según la hora local del dispositivo
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-medium text-slate-800 dark:text-slate-200 block">
                  Tolerancia Máxima Admisible de Scrap General
                </span>
                <span className="text-slate-500 text-[11px]">
                  Si el scrap acumulado del día supera este porcentaje, se detona alerta crítica.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={plantaConfig.toleranciaScrap}
                  onChange={(e) =>
                    setPlantaConfig({ ...plantaConfig, toleranciaScrap: parseFloat(e.target.value) })
                  }
                  className="w-20 px-2 py-1 text-center rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
                <span className="font-bold text-slate-700 dark:text-slate-300">%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Almacenes y Centros Logísticos */}
        <Card
          title="Directorio de Almacenes Industriales"
          subtitle="Bahías y patios registrados para transferencias de chapa"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {ALMACENES.map((alm) => (
              <div
                key={alm.codigo}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
              >
                <div>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block">
                    {alm.codigo}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">{alm.nombre}</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Activo"></span>
              </div>
            ))}
          </div>
        </Card>

        {/* Botón Guardar */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" variant="primary" icon={<Save className="w-4 h-4" />}>
            Guardar Configuración
          </Button>
        </div>
      </form>
    </div>
  );
};
