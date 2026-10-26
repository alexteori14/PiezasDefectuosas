import type { Request, Response } from 'express';
import { MovimientosRepository } from '../repositories/movimientosRepository.js';

const repo = new MovimientosRepository();

export async function getMovimientos(req: Request, res: Response) {
  const fechaInicio = typeof req.query.fechaInicio === 'string' ? req.query.fechaInicio : undefined;
  const fechaFin = typeof req.query.fechaFin === 'string' ? req.query.fechaFin : undefined;
  const formatoFechaValido = (fecha: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
    const parsed = new Date(`${fecha}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === fecha;
  };

  if ((fechaInicio && !fechaFin) || (!fechaInicio && fechaFin)
    || (fechaInicio && fechaFin
      && (!formatoFechaValido(fechaInicio) || !formatoFechaValido(fechaFin) || fechaInicio >= fechaFin))) {
    res.status(400).json({
      exitoso: false,
      mensaje: 'El rango de fechas requiere fechaInicio y fechaFin válidas, en formato YYYY-MM-DD, con fechaFin posterior.',
    });
    return;
  }

  try {
    const filtros = {
      tipoId: req.query.tipoId as string | undefined,
      aprobado: req.query.aprobado as string | undefined,
      razonId: req.query.razonId as string | undefined,
      busqueda: req.query.busqueda as string | undefined,
      fechaInicio,
      fechaFin,
    };
    const lista = await repo.listar(filtros);
    res.json({ exitoso: true, datos: lista, conteo: lista.length });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al obtener movimientos.';
    res.status(500).json({ exitoso: false, mensaje });
  }
}

export async function getMovimientoById(req: Request, res: Response) {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) {
    res.status(400).json({ exitoso: false, mensaje: 'ID de movimiento inválido.' });
    return;
  }

  try {
    const movimiento = await repo.obtenerPorId(id);
    if (!movimiento) {
      res.status(404).json({ exitoso: false, mensaje: 'Movimiento no encontrado.' });
      return;
    }
    res.json({ exitoso: true, datos: movimiento });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al obtener movimiento.';
    res.status(500).json({ exitoso: false, mensaje });
  }
}

export async function registrarDictamen(req: Request, res: Response) {
  if (!/^[1-9]\d*$/.test(req.params.id)) {
    res.status(400).json({ exitoso: false, mensaje: 'ID de movimiento inválido.' });
    return;
  }
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id)) {
    res.status(400).json({ exitoso: false, mensaje: 'ID de movimiento inválido.' });
    return;
  }

  const aprobado = req.body?.aprobado;
  const aprobadoPor = typeof req.body?.aprobadoPor === 'string' ? req.body.aprobadoPor.trim() : '';
  if ((aprobado !== 1 && aprobado !== 2) || aprobadoPor.length === 0 || aprobadoPor.length > 200) {
    res.status(400).json({
      exitoso: false,
      mensaje: 'Indica si apruebas o rechazas y captura el nombre del responsable (máximo 200 caracteres).',
    });
    return;
  }

  try {
    const resultado = await repo.registrarDictamen(id, aprobado, aprobadoPor);
    if (resultado.estado === 'no-encontrado') {
      res.status(404).json({ exitoso: false, mensaje: 'Movimiento no encontrado.' });
      return;
    }
    if (resultado.estado === 'ya-dictaminado') {
      res.status(409).json({ exitoso: false, mensaje: 'El movimiento ya fue dictaminado y no se modificó.' });
      return;
    }
    res.json({ exitoso: true, datos: resultado.movimiento });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al registrar el dictamen.';
    res.status(500).json({ exitoso: false, mensaje });
  }
}

export async function getKPIs(_req: Request, res: Response) {
  try {
    const kpis = await repo.obtenerKPIs();
    res.json({ exitoso: true, datos: kpis });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al calcular indicadores.';
    res.status(500).json({ exitoso: false, mensaje });
  }
}

export async function getScrapPorLinea(_req: Request, res: Response) {
  try {
    const datos = await repo.obtenerScrapPorLinea();
    res.json({ exitoso: true, datos });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al obtener Scrap por línea.';
    res.status(500).json({ exitoso: false, mensaje });
  }
}
