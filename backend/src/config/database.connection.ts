import dotenv from 'dotenv';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type * as Sql from 'mssql';

const require = createRequire(import.meta.url);
const sql = require('mssql/msnodesqlv8') as typeof import('mssql');
const databaseDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../BaseDeDatos');
dotenv.config({ path: path.join(databaseDirectory, '.env') });

const autenticacion = (process.env.DB_AUTHENTICATION || 'windows').toLowerCase();
const servidor = process.env.DB_SERVER || 'est04db';
const baseDeDatos = process.env.DB_DATABASE || 'SOE';
const puerto = process.env.DB_PORT || '1433';
const confiarCertificado = process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false';
const cifrado = process.env.DB_ENCRYPT === 'true';
const controlador = process.env.DB_DRIVER || 'ODBC Driver 17 for SQL Server';
const tiempoConexion = Number.parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000', 10);
const tiempoConsulta = Number.parseInt(process.env.DB_REQUEST_TIMEOUT || '15000', 10);

interface MsnodesqlConfig extends Sql.config {
  connectionString: string;
}

if (autenticacion !== 'windows' && autenticacion !== 'sql') {
  throw new Error('DB_AUTHENTICATION debe ser "windows" o "sql".');
}

if (autenticacion === 'sql' && (!process.env.DB_USER || !process.env.DB_PASSWORD)) {
  throw new Error('La autenticación SQL requiere DB_USER y DB_PASSWORD en BaseDeDatos/.env.');
}

function valorOdbc(valor: string): string {
  return `{${valor.replace(/}/g, '}}')}}`;
}

const parametrosConexion = [
  `Driver=${valorOdbc(controlador)}`,
  `Server=${servidor},${puerto}`,
  `Database=${valorOdbc(baseDeDatos)}`,
  autenticacion === 'windows'
    ? 'Trusted_Connection=Yes'
    : `UID=${valorOdbc(process.env.DB_USER || '')};PWD=${valorOdbc(process.env.DB_PASSWORD || '')}`,
  `Encrypt=${cifrado ? 'Yes' : 'No'}`,
  `TrustServerCertificate=${confiarCertificado ? 'Yes' : 'No'}`,
].join(';');

export const dbConfig: MsnodesqlConfig = {
  server: servidor,
  port: Number.parseInt(puerto, 10),
  database: baseDeDatos,
  connectionString: parametrosConexion,
  connectionTimeout: tiempoConexion,
  requestTimeout: tiempoConsulta,
  options: {
    encrypt: cifrado,
    trustServerCertificate: confiarCertificado,
    trustedConnection: autenticacion === 'windows',
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: Sql.ConnectionPool | null = null;
let estaConectado = false;
let ultimoError: string | null = null;

export async function conectarSQLServer(): Promise<Sql.ConnectionPool | null> {
  if (pool?.connected) {
    estaConectado = true;
    return pool;
  }

  try {
    console.log(`🔌 [SQL Server] Conectando a ${servidor}:${puerto}/${baseDeDatos}...`);
    pool = await new sql.ConnectionPool(dbConfig).connect();
    estaConectado = true;
    ultimoError = null;
    console.log('✅ [SQL Server] Conexión establecida.');
    return pool;
  } catch (error) {
    estaConectado = false;
    pool = null;
    ultimoError = error instanceof Error ? error.message : 'Error desconocido al conectar a SQL Server';
    console.error(`❌ [SQL Server] No se pudo conectar: ${ultimoError}`);
    return null;
  }
}

export async function obtenerPool(): Promise<Sql.ConnectionPool | null> {
  if (!pool?.connected) {
    return conectarSQLServer();
  }
  return pool;
}

export async function cerrarConexionSQLServer(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
    estaConectado = false;
    console.log('🔒 [SQL Server] Conexión cerrada.');
  }
}

export function obtenerEstadoConexion() {
  return {
    conectado: estaConectado && Boolean(pool?.connected),
    servidor,
    puerto: Number.parseInt(puerto, 10),
    baseDeDatos,
    autenticacion,
    cifrado,
    confiarCertificado,
    ultimoError,
    tablasObjetivo: {
      principal: 'dbo.Movimientos',
      tipos: 'dbo.MovimientoTipo',
      razones: 'dbo.EtiquetasCI',
      certificaciones: 'dbo.Certificacion',
    },
  };
}

export async function probarConexionSQLServer(): Promise<{ exitoso: boolean; baseDeDatos?: string; mensaje: string }> {
  const conexion = await conectarSQLServer();
  if (!conexion) {
    return { exitoso: false, mensaje: ultimoError || 'No fue posible conectarse a SQL Server.' };
  }

  try {
    const resultado = await conexion.request().query<{ baseActual: string }>('SELECT DB_NAME() AS baseActual');
    const baseActual = resultado.recordset[0]?.baseActual;
    if (baseActual !== baseDeDatos) {
      throw new Error(`La conexión abrió "${baseActual}", pero se esperaba "${baseDeDatos}".`);
    }

    console.log(`✅ Conexión verificada en la base de datos "${baseActual}".`);
    return { exitoso: true, baseDeDatos: baseActual, mensaje: 'Conexión a SQL Server exitosa.' };
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error desconocido al validar la conexión.';
    console.error(`❌ No se pudo validar la conexión: ${mensaje}`);
    return { exitoso: false, mensaje };
  } finally {
    await cerrarConexionSQLServer();
  }
}

const archivoEjecutado = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (fileURLToPath(import.meta.url) === archivoEjecutado) {
  probarConexionSQLServer().then((resultado) => {
    process.exitCode = resultado.exitoso ? 0 : 1;
  });
}
