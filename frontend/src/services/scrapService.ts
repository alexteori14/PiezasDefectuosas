import type { Movimiento, Motivo, Notificacion, RazonCatalogo, MovimientoTipoCatalogo, CertificacionCatalogo } from '../types';
import { MOVIMIENTOS_INICIALES, MOTIVOS_INICIALES, NOTIFICACIONES_INICIALES, RAZONES_SSMS } from '../mock/data';
import { MOVIMIENTO_TIPOS_SSMS, CERTIFICACIONES_PLANTA } from '../constants';

/**
 * Servicio adaptado a la arquitectura de datos de SQL Server Management Studio (dbo.Movimientos).
 * Opera con fidelidad 100% sobre el modelo de datos de planta.
 */
export const ScrapService = {
  obtenerMovimientos: async (): Promise<Movimiento[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOVIMIENTOS_INICIALES), 80);
    });
  },

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
