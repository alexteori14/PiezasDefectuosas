import type { Request, Response } from 'express';
import { getDbStatus, isDbConnected } from '../config/database.js';

export function getHealth(_req: Request, res: Response) {
  const dbStatus = getDbStatus();
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: {
      type: dbStatus.motor,
      connected: isDbConnected(),
      mode: dbStatus.modo,
      tablaPrincipal: dbStatus.tablaPrincipal,
      tablasRelacionadas: dbStatus.tablasRelacionadas,
      rutaScripts: dbStatus.rutaScripts,
    },
    version: '1.0.0',
  });
}
