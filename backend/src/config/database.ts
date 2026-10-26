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
  const conexion = obtenerEstadoConexion();
  return {
    motor: 'SQL Server',
    tablaPrincipal: 'dbo.Movimientos',
    tablasRelacionadas: ['dbo.MovimientoTipo', 'dbo.EtiquetasCI', 'dbo.Certificacion'],
    modo: `Conexión ${conexion.autenticacion} configurada`,
    rutaScripts: 'BaseDeDatos/',
    archivoConexion: 'BaseDeDatos/.env',
  };
}

export function isDbConnected(): boolean {
  return obtenerEstadoConexion().conectado;
}

export async function connectToDatabase() {
  return conectarSQLServer();
}

export {
  obtenerEstadoConexion,
  conectarSQLServer,
  obtenerPool,
  probarConexionSQLServer,
};
