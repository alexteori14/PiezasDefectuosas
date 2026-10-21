import type { Movimiento, Motivo, Notificacion } from '../types';
import { MOVIMIENTOS_INICIALES, MOTIVOS_INICIALES, NOTIFICACIONES_INICIALES } from '../mock/data';

/**
 * Servicio Mock para simular integración con SAP S/4HANA y Sistema MES Industrial.
 * No realiza peticiones de red reales (cumple regla 100% Mock de Especificaciones).
 */
export const ScrapService = {
  obtenerMovimientos: async (): Promise<Movimiento[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOVIMIENTOS_INICIALES), 100);
    });
  },

  obtenerMotivos: async (): Promise<Motivo[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOTIVOS_INICIALES), 100);
    });
  },

  obtenerNotificaciones: async (): Promise<Notificacion[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(NOTIFICACIONES_INICIALES), 100);
    });
  },

  sincronizarConSapErp: async (folio: string): Promise<{ exitoso: boolean; mensajeSap: string; sapDocNum: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          exitoso: true,
          mensajeSap: `Documento de material 49000${Math.floor(1000 + Math.random() * 9000)} generado vía BAPI_GOODSMVT_CREATE movimiento 551.`,
          sapDocNum: `DOC-SAP-551-${Math.floor(100000 + Math.random() * 900000)}`,
        });
      }, 300);
    });
  },
};
