import { obtenerPool } from '../config/database.connection.js';
import type { MovimientoDB, MovimientoDetalleDTO, FiltrosMovimientosQuery } from '../types/index.js';

const NOMBRES_TIPOS_MOVIMIENTO: Record<number, string> = {
  1: 'Scrap',
  2: 'Retrabajo en Linea',
  3: 'Calidad',
  4: 'Cuarentena',
  5: 'Calidad Reingreso',
  6: 'metal Finish',
  7: 'Traspaleo',
  8: 'Impresion Parcial',
};

function enriquecerMovimiento(movimiento: MovimientoDB): MovimientoDetalleDTO {
  return {
    ...movimiento,
    MovimientoTipoNombre: NOMBRES_TIPOS_MOVIMIENTO[movimiento.MovimientoTipoId],
  };
}

function aplicarFiltros(movimientos: MovimientoDetalleDTO[], filtros: FiltrosMovimientosQuery) {
  return movimientos.filter((movimiento) => {
    if (filtros.tipoId && movimiento.MovimientoTipoId !== Number(filtros.tipoId)) return false;
    if (filtros.aprobado !== undefined && filtros.aprobado !== '' && movimiento.aprobado !== Number(filtros.aprobado)) return false;
    if (filtros.razonId && movimiento.RazonId !== Number(filtros.razonId)) return false;

    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLocaleLowerCase();
      const valores = [
        movimiento.id,
        movimiento.serial,
        movimiento.MATNR,
        movimiento.MATNR_FG,
        movimiento.credencial,
        movimiento.MovimientoTipoNombre,
        movimiento.RazonId,
        movimiento.almacen,
      ];
      if (!valores.some((valor) => String(valor ?? '').toLocaleLowerCase().includes(busqueda))) return false;
    }
    return true;
  });
}

export class MovimientosRepository {
  async listar(filtros: FiltrosMovimientosQuery = {}): Promise<MovimientoDetalleDTO[]> {
    const pool = await obtenerPool();
    if (!pool) {
      throw new Error('No hay conexión activa con SQL Server.');
    }

    const solicitud = pool.request();
    let filtroFecha: string;
    if (filtros.fechaInicio && filtros.fechaFin) {
      solicitud.input('fechaInicio', filtros.fechaInicio);
      solicitud.input('fechaFin', filtros.fechaFin);
      filtroFecha = '[fecha_hora] >= @fechaInicio AND [fecha_hora] < @fechaFin';
    } else {
      filtroFecha = `
        [fecha_hora] >= '20250101'
        AND [fecha_hora] < '20260101'
      `;
    }

    const resultado = await solicitud.query<MovimientoDB>(
      `SELECT * FROM dbo.Movimientos WHERE ${filtroFecha} ORDER BY [id] DESC`
    );
    return aplicarFiltros(resultado.recordset.map(enriquecerMovimiento), filtros);
  }

  async obtenerPorId(id: number): Promise<MovimientoDetalleDTO | null> {
    const pool = await obtenerPool();
    if (!pool) {
      throw new Error('No hay conexión activa con SQL Server.');
    }

    const resultado = await pool
      .request()
      .input('id', id)
      .query<MovimientoDB>('SELECT * FROM dbo.Movimientos WHERE [id] = @id');
    const movimiento = resultado.recordset[0];
    return movimiento ? enriquecerMovimiento(movimiento) : null;
  }

  async registrarDictamen(
    id: number,
    aprobado: 1 | 2,
    aprobadoPor: string,
  ): Promise<
    | { estado: 'actualizado'; movimiento: MovimientoDetalleDTO }
    | { estado: 'no-encontrado' }
    | { estado: 'ya-dictaminado' }
  > {
    const pool = await obtenerPool();
    if (!pool) {
      throw new Error('No hay conexión activa con SQL Server.');
    }

    const resultado = await pool.request()
      .input('id', id)
      .input('aprobado', aprobado)
      .input('aprobadoPor', aprobadoPor)
      .query<MovimientoDB & { actualizado: number }>(`
        SET NOCOUNT ON;
        DECLARE @actualizado TABLE (id INT NOT NULL);

        UPDATE dbo.Movimientos
        SET aprobado = @aprobado,
            nvAprobadoPor = @aprobadoPor,
            dtAprobado = GETDATE()
        OUTPUT INSERTED.id INTO @actualizado (id)
        WHERE id = @id AND aprobado = 0

        SELECT
          CASE WHEN EXISTS (SELECT 1 FROM @actualizado) THEN 1 ELSE 0 END AS actualizado,
          movimiento.*
        FROM dbo.Movimientos AS movimiento
        WHERE movimiento.id = @id
      `);

    const fila = resultado.recordset[0];
    if (fila?.actualizado === 1) {
      const { actualizado: _actualizado, ...movimiento } = fila;
      return { estado: 'actualizado', movimiento: enriquecerMovimiento(movimiento) };
    }

    return !fila
      ? { estado: 'no-encontrado' }
      : { estado: 'ya-dictaminado' };
  }

  async obtenerKPIs() {
    const movimientos = await this.listar();
    const scrap = movimientos.filter((movimiento) => movimiento.MovimientoTipoId === 1);
    const aprobados = movimientos.filter((movimiento) => movimiento.aprobado === 1).length;

    return {
      totalMovimientos: movimientos.length,
      piezasScrapTotal: scrap.reduce((total, movimiento) => total + movimiento.cantidad, 0),
      pendientesAprobacion: movimientos.filter((movimiento) => movimiento.aprobado === 0).length,
      aprobadosTotal: aprobados,
      rechazadosTotal: movimientos.filter((movimiento) => movimiento.aprobado === 2).length,
      tasaAprobacion: movimientos.length > 0 ? ((aprobados / movimientos.length) * 100).toFixed(1) : '0',
    };
  }
}
