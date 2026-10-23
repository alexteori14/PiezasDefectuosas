/**
 * Configuración del Modelo de Base de Datos SQL Server (SSMS).
 * Integra la infraestructura de conexión de database.connection.ts
 */

import {
  obtenerEstadoConexion,
  conectarSQLServer,
  obtenerPool,
  probarConexionSQLServer,
} from './database.connection.js';

export interface DbConfigInfo {
  motor: string;
  tablaPrincipal: string;
  tablasRelacionadas: string[];
  modo: string;
  rutaScripts: string;
  archivoConexion: string;
}

export function getDbStatus(): DbConfigInfo {
  return {
    motor: 'SQL Server Management Studio (SSMS)',
    tablaPrincipal: 'dbo.Movimientos',
    tablasRelacionadas: ['dbo.MovimientoTipo', 'dbo.EtiquetasCI', 'dbo.Certificaciones'],
    modo: 'Estructura Adaptada (Listo para conexión directa vía database.connection.ts)',
    rutaScripts: 'BaseDeDatos/',
    archivoConexion: 'backend/src/config/database.connection.ts',
  };
}

export function isDbConnected(): boolean {
  return false;
}

export async function connectToDatabase() {
  console.log('ℹ️ [Base de Datos] Estructura adaptada al 100% con dbo.Movimientos.');
  console.log('ℹ️ [Base de Datos] Archivo exclusivo de conexión listo en: backend/src/config/database.connection.ts');
  console.log('ℹ️ [Base de Datos] Para probar la conexión en vivo ejecuta: npm run test:db');
  return null;
}

export {
  obtenerEstadoConexion,
  conectarSQLServer,
  obtenerPool,
  probarConexionSQLServer,
};
