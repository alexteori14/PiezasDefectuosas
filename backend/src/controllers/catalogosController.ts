import type { Request, Response } from 'express';
import { CatalogosRepository } from '../repositories/catalogosRepository.js';

const repo = new CatalogosRepository();

export async function getTipos(_req: Request, res: Response) {
  try {
    const datos = await repo.obtenerTipos();
    res.json({ exitoso: true, datos });
  } catch (error: any) {
    res.status(500).json({ exitoso: false, mensaje: error.message || 'Error al obtener tipos de movimiento' });
  }
}

export async function getRazones(_req: Request, res: Response) {
  try {
    const datos = await repo.obtenerRazones();
    res.json({ exitoso: true, datos });
  } catch (error: any) {
    res.status(500).json({ exitoso: false, mensaje: error.message || 'Error al obtener catálogo de razones' });
  }
}

export async function getCertificaciones(_req: Request, res: Response) {
  try {
    const datos = await repo.obtenerCertificaciones();
    res.json({ exitoso: true, datos });
  } catch (error: any) {
    res.status(500).json({ exitoso: false, mensaje: error.message || 'Error al obtener certificaciones' });
  }
}
