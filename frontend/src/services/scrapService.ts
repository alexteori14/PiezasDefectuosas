import type { Movimiento, MovimientoDB, Motivo, Notificacion, RazonCatalogo, MovimientoTipoCatalogo, CertificacionCatalogo } from '../types';
import { MOTIVOS_INICIALES, NOTIFICACIONES_INICIALES, RAZONES_SSMS } from '../mock/data';
import { MOVIMIENTO_TIPOS_SSMS, CERTIFICACIONES_PLANTA } from '../constants';

function adaptarMovimiento(row: MovimientoDB): Movimiento {
  const fechaHora = row.fecha_hora.replace(' ', 'T').slice(0, 19);
  const fecha = fechaHora.slice(0, 10);
  const hora = fechaHora.slice(11, 16);
  const tipo = MOVIMIENTO_TIPOS_SSMS.find((item) => item.id === row.MovimientoTipoId);
  const estatus = row.aprobado === 1
    ? 'Aprobado'
    : row.aprobado === 2
      ? 'Rechazado'
      : row.aprobado === 0
        ? 'Pendiente'
        : 'Sin dictamen';

  return {
    datosDB: row,
    id: String(row.id),
    certificacionId: row.CertificacionId,
    matnr: row.MATNR,
    matnrFg: row.MATNR_FG || undefined,
    fechaHora,
    fecha,
    hora,
    credencial: row.credencial,
    movimientoTipoId: row.MovimientoTipoId,
    movimientoTipo: tipo?.nombre || 'Tipo desconocido',
    cantidad: row.cantidad,
    salida: row.salida,
    retorno: row.retorno,
    aprobado: row.aprobado,
    razonId: row.RazonId,
    motivoEspecifico: '',
    almacen: row.almacen || '',
    serial: row.serial || '',
    nvAprobadoPor: row.nvAprobadoPor || undefined,
    dtAprobado: row.dtAprobado || undefined,
    empleado: '',
    descripcion: '',
    linea: '',
    estatus,
    unidad: 'PZA',
    costoUnitario: 0,
    costoTotal: 0,
    historial: [],
  };
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function solicitarMovimientos(): Promise<Movimiento[]> {
  const response = await fetch(`${API_BASE}/movimientos`);
  const body = await response.json() as { exitoso: boolean; datos?: MovimientoDB[]; mensaje?: string };
  if (!response.ok || !body.exitoso || !body.datos) {
    throw new Error(body.mensaje || `No se pudieron cargar los movimientos (HTTP ${response.status}).`);
  }
  return body.datos.map(adaptarMovimiento);
}

async function enviarDictamen(id: string, aprobado: 1 | 2, aprobadoPor: string): Promise<void> {
  const response = await fetch(`${API_BASE}/movimientos/${encodeURIComponent(id)}/dictamen`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ aprobado, aprobadoPor }),
  });
  const body = await response.json() as { exitoso: boolean; mensaje?: string };
  if (!response.ok || !body.exitoso) {
    throw new Error(body.mensaje || `No se pudo registrar el dictamen (HTTP ${response.status}).`);
  }
}

/**
 * Movimientos se leen de SQL Server. Los catálogos secundarios siguen siendo locales
 * hasta que se acuerde integrar sus tablas. Los dictámenes se guardan en SQL Server.
 */
export const ScrapService = {
  obtenerMovimientos: () => solicitarMovimientos(),

  aprobarMovimiento: (id: string, aprobadoPor: string) => enviarDictamen(id, 1, aprobadoPor),

  rechazarMovimiento: (id: string, aprobadoPor: string) => enviarDictamen(id, 2, aprobadoPor),

  obtenerMotivos: async (): Promise<Motivo[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOTIVOS_INICIALES), 80);
    });
  },

  obtenerRazonesCatalogo: async (): Promise<RazonCatalogo[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(RAZONES_SSMS), 80);
    });
  },

  obtenerTiposMovimiento: async (): Promise<MovimientoTipoCatalogo[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOVIMIENTO_TIPOS_SSMS), 50);
    });
  },

  obtenerCertificaciones: async (): Promise<CertificacionCatalogo[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(CERTIFICACIONES_PLANTA), 50);
    });
  },

  obtenerNotificaciones: async (): Promise<Notificacion[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(NOTIFICACIONES_INICIALES), 50);
    });
  },

  sincronizarConSapErp: async (serial: string): Promise<{ exitoso: boolean; mensajeSap: string; sapDocNum: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          exitoso: true,
          mensajeSap: `Documento de material 49000${Math.floor(1000 + Math.random() * 9000)} generado vía BAPI_GOODSMVT_CREATE para folio serial ${serial}.`,
          sapDocNum: `DOC-SAP-551-${Math.floor(100000 + Math.random() * 900000)}`,
        });
      }, 250);
    });
  },
};
