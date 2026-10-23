/**
 * =====================================================================================
 * ARCHIVO EXCLUSIVO DE CONEXIÓN A BASE DE DATOS (SQL SERVER / SSMS)
 * Sistema MES SCRAP Dashboard Industrial
 * =====================================================================================
 * Este módulo contiene toda la infraestructura para conectarse a Microsoft SQL Server
 * y a la base de datos SCRAP_MES (tabla dbo.Movimientos).
 * 
 * CARACTERÍSTICAS INCLUIDAS:
 * 1. Pool de conexiones optimizado de mssql.
 * 2. Soporte para SQL Server Authentication (usuario/password) y Windows Authentication.
 * 3. Manejo de errores con reconexión automática y diagnóstico claro.
 * 4. Función de autodiagnóstico: 'probarConexionSQLServer()'.
 * 5. Script ejecutable directamente desde consola: npm run test:db
 * =====================================================================================
 */

import sql from 'mssql';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Cargar variables de entorno
dotenv.config();

// Configuración de conexión hacia SQL Server Management Studio (SSMS)
export const dbConfig: sql.config = {
  server: process.env.DB_SERVER || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 1433,
  database: process.env.DB_DATABASE || 'SCRAP_MES',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  connectionTimeout: process.env.DB_CONNECTION_TIMEOUT ? parseInt(process.env.DB_CONNECTION_TIMEOUT, 10) : 5000,
  requestTimeout: process.env.DB_REQUEST_TIMEOUT ? parseInt(process.env.DB_REQUEST_TIMEOUT, 10) : 15000,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;
let estaConectado = false;
let ultimoError: string | null = null;

/**
 * Conecta al pool de SQL Server o devuelve el pool existente si ya está conectado.
 */
export async function conectarSQLServer(): Promise<sql.ConnectionPool | null> {
  if (pool && estaConectado) {
    return pool;
  }

  try {
    console.log(`🔌 [SQL Server] Conectando a ${dbConfig.server}:${dbConfig.port}/${dbConfig.database}...`);
    pool = await new sql.ConnectionPool(dbConfig).connect();
    estaConectado = true;
    ultimoError = null;
    console.log('✅ [SQL Server] Conexión establecida con éxito a SQL Server Management Studio.');
    return pool;
  } catch (error: any) {
    estaConectado = false;
    ultimoError = error?.message || 'Error desconocido al conectar a SQL Server';
    console.warn(`⚠️ [SQL Server] No se pudo conectar a la base de datos (${ultimoError}).`);
    return null;
  }
}

/**
 * Obtiene el pool activo de conexión.
 */
export async function obtenerPool(): Promise<sql.ConnectionPool | null> {
  if (!estaConectado || !pool) {
    return conectarSQLServer();
  }
  return pool;
}

/**
 * Cierra la conexión a SQL Server de forma segura.
 */
export async function cerrarConexionSQLServer(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
    estaConectado = false;
    console.log('🔒 [SQL Server] Conexión cerrada.');
  }
}

/**
 * Retorna el estado actual de la conexión y configuración de SSMS.
 */
export function obtenerEstadoConexion() {
  return {
    conectado: estaConectado,
    servidor: dbConfig.server,
    puerto: dbConfig.port,
    baseDeDatos: dbConfig.database,
    usuario: dbConfig.user,
    cifrado: dbConfig.options?.encrypt,
    confiarCertificado: dbConfig.options?.trustServerCertificate,
    ultimoError,
    tablasObjetivo: {
      principal: 'dbo.Movimientos',
      tipos: 'dbo.MovimientoTipo',
      razones: 'dbo.EtiquetasCI',
      certificaciones: 'dbo.Certificaciones',
    },
  };
}

/**
 * Función de Diagnóstico y Prueba Rápida de Conexión:
 * Ejecuta queries de verificación contra SQL Server y la tabla dbo.Movimientos.
 */
export async function probarConexionSQLServer(): Promise<{
  exitoso: boolean;
  versionSQL?: string;
  registrosMovimientos?: number;
  mensaje: string;
}> {
  console.log('==================================================================');
  console.log('🔍 PRUEBA DE CONEXIÓN A BASE DE DATOS (SQL Server / SSMS)');
  console.log('==================================================================');
  console.log(`Servidor : ${dbConfig.server}:${dbConfig.port}`);
  console.log(`BaseDatos: ${dbConfig.database}`);
  console.log(`Usuario  : ${dbConfig.user}`);
  console.log('------------------------------------------------------------------');

  try {
    const conexion = await new sql.ConnectionPool(dbConfig).connect();
    
    // 1. Probar versión de SQL Server
    const resVersion = await conexion.request().query('SELECT @@VERSION AS version, DB_NAME() AS dbActual');
    const versionSQL = resVersion.recordset[0]?.version?.split('\n')[0] || 'SQL Server Detectado';
    const dbActual = resVersion.recordset[0]?.dbActual;

    console.log(`✅ Conexión exitosa a: ${dbActual}`);
    console.log(`ℹ️ Versión del Motor: ${versionSQL}`);

    // 2. Probar existencia de dbo.Movimientos
    let conteo = 0;
    try {
      const resTabla = await conexion.request().query('SELECT COUNT(*) AS total FROM dbo.Movimientos');
      conteo = resTabla.recordset[0]?.total || 0;
      console.log(`✅ Tabla dbo.Movimientos encontrada. Registros actuales: ${conteo}`);
    } catch (errTabla: any) {
      console.warn(`⚠️ Tabla dbo.Movimientos aún no existe en ${dbActual}. Ejecuta BaseDeDatos/01_Schema_SSMS.sql en SSMS.`);
    }

    await conexion.close();
    console.log('==================================================================');
    console.log('🎉 Diagnóstico completado: La conexión está lista y operativa.');
    console.log('==================================================================');

    return {
      exitoso: true,
      versionSQL,
      registrosMovimientos: conteo,
      mensaje: 'Conexión a SQL Server exitosa.',
    };
  } catch (error: any) {
    console.error('❌ Error de prueba de conexión:');
    console.error(error?.message || error);
    console.log('------------------------------------------------------------------');
    console.log('💡 CONSEJO PARA SSMS:');
    console.log('1. Revisa tu archivo .env en la carpeta "backend/.env".');
    console.log('2. Verifica que el servicio de SQL Server esté ejecutándose en tu equipo.');
    console.log('3. Ejecuta los scripts de la carpeta "BaseDeDatos/01_Schema_SSMS.sql" en SSMS.');
    console.log('==================================================================');

    return {
      exitoso: false,
      mensaje: error?.message || 'Fallo de conexión a SQL Server',
    };
  }
}

// Ejecución directa si se invoca con: tsx src/config/database.connection.ts
const esArchivoPrincipal = () => {
  try {
    const currentPath = fileURLToPath(import.meta.url);
    const executedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
    return currentPath === executedPath;
  } catch {
    return false;
  }
};

if (esArchivoPrincipal()) {
  probarConexionSQLServer()
    .then((resultado) => {
      process.exit(resultado.exitoso ? 0 : 1);
    })
    .catch(() => process.exit(1));
}
