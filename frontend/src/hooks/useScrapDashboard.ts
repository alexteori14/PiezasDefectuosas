import { useMemo } from 'react';
import { useScrap } from '../context/ScrapContext';
import { LINEAS_PRODUCCION } from '../constants';

export const useScrapDashboard = () => {
  const { movimientos, resumenKPIs, turnoActivo } = useScrap();

  // Estadísticas derivadas por línea
  const rankingLineas = useMemo(() => {
    return LINEAS_PRODUCCION.map((linea) => {
      const movimientosLinea = movimientos.filter((m) => m.linea.includes(linea.codigo));
      const piezasScrap = movimientosLinea
        .filter((m) => m.movimientoTipo === 'Scrap')
        .reduce((sum, m) => sum + m.cantidad, 0);
      const costoScrap = movimientosLinea
        .filter((m) => m.movimientoTipo === 'Scrap')
        .reduce((sum, m) => sum + m.costoTotal, 0);

      return {
        ...linea,
        piezasScrap,
        costoScrap,
        incidencias: movimientosLinea.length,
      };
    }).sort((a, b) => b.piezasScrap - a.piezasScrap);
  }, [movimientos]);

  // Pendientes de firma urgente
  const pendientesUrgentes = useMemo(() => {
    return movimientos.filter((m) => m.estatus === 'Pendiente' && m.turno === turnoActivo);
  }, [movimientos, turnoActivo]);

  return {
    movimientos,
    resumenKPIs,
    turnoActivo,
    rankingLineas,
    pendientesUrgentes,
  };
};
