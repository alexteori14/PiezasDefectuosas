import React, { useState } from 'react';
import {
  RotateCcw,
  Save,
  CheckCircle2,
  Server,
} from 'lucide-react';
import { useScrap } from '../context/ScrapContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { INFO_PLANTA, TURNOS_PLANTA, ALMACENES } from '../constants';

export const ConfiguracionPage: React.FC = () => {
  const { turnoActivo, setTurnoActivo, resetearDatosMock, agregarToast } = useScrap();
  const { theme, setTheme } = useTheme();

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
            Configuración del Sistema MES & Planta
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Parámetros de operación industrial, sincronización SAP S/4HANA y gestión de turnos.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={<RotateCcw className="w-4 h-4 text-rose-500" />}
          onClick={resetearDatosMock}
        >
          Reiniciar Datos Mock
        </Button>
      </div>

      <form onSubmit={handleGuardarAjustes} className="space-y-6">
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
          subtitle="Horarios de relevo y límites admisibles de scrap diario"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {TURNOS_PLANTA.map((turno) => (
                <div
                  key={turno.id}
                  onClick={() => setTurnoActivo(turno.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    turnoActivo === turno.id
                      ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{turno.etiqueta}</span>
                    {turnoActivo === turno.id && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] mt-1 block">
                    {turno.horario}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Umbral Máximo de Scrap Admisible en Planta (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={plantaConfig.toleranciaScrap}
                    onChange={(e) => setPlantaConfig({ ...plantaConfig, toleranciaScrap: Number(e.target.value) })}
                    className="w-32 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-slate-400">% de producción total</span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Preferencia de Tema Visual
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                      theme === 'light'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                        : 'border-slate-300 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    ☀️ Claro (Fiori Standard)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                      theme === 'dark'
                        ? 'border-blue-500 bg-blue-950/60 text-blue-300 font-bold'
                        : 'border-slate-300 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    🌙 Oscuro (Industrial High Contrast)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Almacenes Habilitados */}
        <Card
          title="Catálogo de Almacenes Industriales"
          subtitle="Ubicaciones autorizadas para movimientos y devoluciones"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {ALMACENES.map((alm) => (
              <div
                key={alm.codigo}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
              >
                <div>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block">
                    {alm.codigo}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {alm.nombre}
                  </span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Activo" />
              </div>
            ))}
          </div>
        </Card>

        {/* Botón Guardar */}
        <div className="flex justify-end">
          <Button variant="primary" size="md" icon={<Save className="w-4 h-4" />} type="submit">
            Guardar Configuración
          </Button>
        </div>
      </form>
    </div>
  );
};
