import type { Request, Response } from 'express';
import { MovimientosRepository } from '../repositories/movimientosRepository.js';

const repo = new MovimientosRepository();

export async function getMovimientos(req: Request, res: Response) {
  try {
    const filtros = {
      tipoId: req.query.tipoId as string | undefined,
      aprobado: req.query.aprobado as string | undefined,
      razonId: req.query.razonId as string | undefined,
      busqueda: req.query.busqueda as string | undefined,
    };
    const lista = await repo.listar(filtros);
    res.json({ exitoso: true, datos: lista, conteo: lista.length });
  } catch (error: any) {
    res.status(500).json({ exitoso: false, mensaje: error.message || 'Error al obtener movimientos' });
  }
}

export async function getMovimientoById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ exitoso: false, mensaje: 'ID de movimiento inválido' });
    }
    const item = await repo.obtenerPorId(id);
    if (!item) {
      return res.status(404).json({ exitoso: false, mensaje: 'Movimiento no encontrado' });
    }
    res.json({ exitoso: true, datos: item });
  } catch (error: any) {
    res.status(500).json({ exitoso: false, mensaje: error.message || 'Error al obtener movimiento' });
  }
}

export async function createMovimiento(req: Request, res: Response) {
  try {
    const {
      CertificacionId,
      MATNR,
      credencial,
      MovimientoTipoId,
      cantidad,
      Empleado,
      RazonId,
      almacen,
      MATNR_FG,
      centro_costo,
    } = req.body;

    if (!MATNR || !credencial || !MovimientoTipoId || !cantidad) {
      return res.status(400).json({
        exitoso: false,
        mensaje: 'Faltan campos obligatorios: MATNR, credencial, MovimientoTipoId y cantidad son requeridos.',
      });
    }

    const nuevo = await repo.crear({
      CertificacionId: CertificacionId ? parseInt(CertificacionId, 10) : 101,
      MATNR,
      fecha_hora: new Date(),
      credencial,
      MovimientoTipoId: parseInt(MovimientoTipoId, 10),
      cantidad: parseInt(cantidad, 10),
      salida: true,
      retorno: false,
      EmpleadoId: credencial,
      Empleado: Empleado || 'Operador en Línea',
      procesado: 0,
      aprobado: 0,
      RazonId: RazonId ? parseInt(RazonId, 10) : 5001,
      centro_costo: centro_costo || 'CC-PLANTA',
      almacen: almacen || 'ALM-99',
      serial: req.body.serial,
      MATNR_FG: MATNR_FG || null,
    });

    res.status(201).json({ exitoso: true, datos: nuevo, mensaje: 'Movimiento registrado correctamente en base de datos.' });
  } catch (error: any) {
    res.status(500).json({ exitoso: false, mensaje: error.message || 'Error al crear movimiento' });
  }
}

export async function aprobarMovimiento(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const aprobadoPor = req.body.aprobadoPor || 'Supervisor de Calidad';
    const exito = await repo.aprobar(id, aprobadoPor);
    if (!exito) {
      return res.status(404).json({ exitoso: false, mensaje: 'Movimiento no encontrado para aprobación' });
    }
    res.json({ exitoso: true, mensaje: `Movimiento #${id} aprobado satisfactoriamente.` });
  } catch (error: any) {
    res.status(500).json({ exitoso: false, mensaje: error.message || 'Error al aprobar movimiento' });
  }
}

export async function rechazarMovimiento(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const rechazadoPor = req.body.rechazadoPor || 'Supervisor de Calidad';
    const exito = await repo.rechazar(id, rechazadoPor);
    if (!exito) {
      return res.status(404).json({ exitoso: false, mensaje: 'Movimiento no encontrado para rechazo' });
    }
    res.json({ exitoso: true, mensaje: `Movimiento #${id} rechazado satisfactoriamente.` });
  } catch (error: any) {
    res.status(500).json({ exitoso: false, mensaje: error.message || 'Error al rechazar movimiento' });
  }
}

export async function getKPIs(_req: Request, res: Response) {
  try {
    const kpis = await repo.obtenerKPIs();
    res.json({ exitoso: true, datos: kpis });
  } catch (error: any) {
    res.status(500).json({ exitoso: false, mensaje: error.message || 'Error al calcular KPIs' });
  }
}
