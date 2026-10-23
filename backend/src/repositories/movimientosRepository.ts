import type { MovimientoDB, MovimientoDetalleDTO, FiltrosMovimientosQuery } from '../types/index.js';
import { RAZONES_PREDETERMINADAS, MOVIMIENTO_TIPOS_PREDETERMINADOS, CERTIFICACIONES_PREDETERMINADAS } from './catalogosRepository.js';

// Estructura en memoria idéntica a dbo.Movimientos (SQL Server Management Studio)
let MOVIMIENTOS_TABLA: MovimientoDB[] = [
  {
    id: 1,
    CertificacionId: 101,
    MATNR: 'MAT-849201',
    fecha_hora: '2026-10-23T07:24:00',
    credencial: 'EMP-3041',
    MovimientoTipoId: 1, // 1: Scrap
    cantidad: 14,
    salida: true,
    retorno: false,
    EmpleadoId: 'EMP-3041',
    Empleado: 'Jorge Martínez R.',
    procesado: 0,
    aprobado: 0, // 0: Pendiente
    RazonId: 5001, // 5001: Arrugas
    centro_costo: 'CC-ESTAMP',
    almacen: 'ALM-99',
    serial: 'ETQ-2026-90412',
    MATNR_FG: 'FG-CX9-FND-LH',
    nvAprobadoPor: null,
    dtAprobado: null,
  },
  {
    id: 2,
    CertificacionId: 103,
    MATNR: 'MAT-334109',
    fecha_hora: '2026-10-23T08:15:00',
    credencial: 'EMP-1984',
    MovimientoTipoId: 1, // 1: Scrap
    cantidad: 8,
    salida: true,
    retorno: false,
    EmpleadoId: 'EMP-1984',
    Empleado: 'Miguel Ángel Cruz',
    procesado: 0,
    aprobado: 0, // 0: Pendiente
    RazonId: 5010, // 5010: Fisura
    centro_costo: 'CC-SOLDAD',
    almacen: 'ALM-99',
    serial: 'ETQ-2026-90413',
    MATNR_FG: 'FG-CX9-DR-RR',
    nvAprobadoPor: null,
    dtAprobado: null,
  },
  {
    id: 3,
    CertificacionId: 101,
    MATNR: 'MAT-990214',
    fecha_hora: '2026-10-23T06:45:00',
    credencial: 'EMP-4421',
    MovimientoTipoId: 1, // 1: Scrap
    cantidad: 3,
    salida: true,
    retorno: false,
    EmpleadoId: 'EMP-4421',
    Empleado: 'Roberto Morales G.',
    procesado: 1,
    aprobado: 1, // 1: Aprobado
    RazonId: 5017, // 5017: Pieza Dañada por Troquel
    centro_costo: 'CC-ESTAMP',
    almacen: 'ALM-99',
    serial: 'ETQ-2026-90410',
    MATNR_FG: 'FG-CX9-HOOD',
    nvAprobadoPor: 'Ing. Carlos Mendoza',
    dtAprobado: '2026-10-23T07:15:00',
  },
  {
    id: 4,
    CertificacionId: 104,
    MATNR: 'MAT-776201',
    fecha_hora: '2026-10-23T07:05:00',
    credencial: 'EMP-2210',
    MovimientoTipoId: 2, // 2: Retrabajo en Linea
    cantidad: 6,
    salida: true,
    retorno: false,
    EmpleadoId: 'EMP-2210',
    Empleado: 'Esteban Garza L.',
    procesado: 0,
    aprobado: 1, // 1: Aprobado
    RazonId: 7214, // 7214: FALLA DE SOLDADURA
    centro_costo: 'CC-SOLDAD',
    almacen: 'ALM-12',
    serial: 'ETQ-2026-90411',
    MATNR_FG: 'FG-CX9-PIL-B',
    nvAprobadoPor: 'Ing. Sandra Lozano',
    dtAprobado: '2026-10-23T07:30:00',
  },
  {
    id: 5,
    CertificacionId: 105,
    MATNR: 'MAT-554102',
    fecha_hora: '2026-10-23T09:10:00',
    credencial: 'EMP-5531',
    MovimientoTipoId: 6, // 6: metal Finish
    cantidad: 4,
    salida: true,
    retorno: false,
    EmpleadoId: 'EMP-5531',
    Empleado: 'Daniela Ríos P.',
    procesado: 0,
    aprobado: 0, // 0: Pendiente
    RazonId: 5013, // 5013: Mala Apariencia
    centro_costo: 'CC-FINISH',
    almacen: 'ALM-12',
    serial: 'ETQ-2026-90414',
    MATNR_FG: 'FG-CX9-TG-OUT',
    nvAprobadoPor: null,
    dtAprobado: null,
  },
  {
    id: 6,
    CertificacionId: 107,
    MATNR: 'MAT-112940',
    fecha_hora: '2026-10-23T09:30:00',
    credencial: 'EMP-8840',
    MovimientoTipoId: 4, // 4: Cuarentena
    cantidad: 25,
    salida: true,
    retorno: false,
    EmpleadoId: 'EMP-8840',
    Empleado: 'Fernando Ruiz T.',
    procesado: 0,
    aprobado: 0, // 0: Pendiente
    RazonId: 4145, // 4145: CONTAMINACION
    centro_costo: 'CC-CALIDAD',
    almacen: 'ALM-05',
    serial: 'ETQ-2026-90415',
    MATNR_FG: 'FG-RAW-ST-COIL',
    nvAprobadoPor: null,
    dtAprobado: null,
  },
  {
    id: 7,
    CertificacionId: 103,
    MATNR: 'MAT-334109',
    fecha_hora: '2026-10-22T17:40:00',
    credencial: 'EMP-1984',
    MovimientoTipoId: 1, // 1: Scrap
    cantidad: 5,
    salida: true,
    retorno: false,
    EmpleadoId: 'EMP-1984',
    Empleado: 'Miguel Ángel Cruz',
    procesado: 0,
    aprobado: 2, // 2: Rechazado
    RazonId: 5011, // 5011: Golpe en Proceso
    centro_costo: 'CC-SOLDAD',
    almacen: 'ALM-12',
    serial: 'ETQ-2026-90395',
    MATNR_FG: 'FG-CX9-DR-RR',
    nvAprobadoPor: 'Ing. Carlos Mendoza',
    dtAprobado: '2026-10-22T18:10:00',
  },
  {
    id: 8,
    CertificacionId: 102,
    MATNR: 'MAT-661204',
    fecha_hora: '2026-10-23T10:00:00',
    credencial: 'EMP-1102',
    MovimientoTipoId: 8, // 8: Impresion Parcial
    cantidad: 2,
    salida: true,
    retorno: false,
    EmpleadoId: 'EMP-1102',
    Empleado: 'Alejandro Vega',
    procesado: 0,
    aprobado: 0, // 0: Pendiente
    RazonId: 5004, // 5004: Blank mal Dimensionado
    centro_costo: 'CC-ESTAMP',
    almacen: 'ALM-02',
    serial: 'ETQ-2026-90416',
    MATNR_FG: 'FG-CX9-ROOF',
    nvAprobadoPor: null,
    dtAprobado: null,
  },
];

let nextId = 9;

export class MovimientosRepository {
  private enriquecerMovimiento(m: MovimientoDB): MovimientoDetalleDTO {
    const tipo = MOVIMIENTO_TIPOS_PREDETERMINADOS.find((t) => t.id === m.MovimientoTipoId);
    const razon = RAZONES_PREDETERMINADAS.find((r) => r.IdRazon === m.RazonId);
    const cert = CERTIFICACIONES_PREDETERMINADAS.find((c) => c.id === m.CertificacionId);

    const fHora = typeof m.fecha_hora === 'string' ? m.fecha_hora : (m.fecha_hora as Date).toISOString();
    const fecha = fHora.split('T')[0] || '';
    const hora = fHora.includes('T') ? fHora.split('T')[1].slice(0, 5) : '';

    const estatusTexto: 'Pendiente' | 'Aprobado' | 'Rechazado' = 
      m.aprobado === 1 ? 'Aprobado' : m.aprobado === 2 ? 'Rechazado' : 'Pendiente';

    const costoUnitario = razon?.CC_Sugerido ? parseFloat(razon.CC_Sugerido) : 150;
    const costoTotal = m.cantidad * costoUnitario;

    return {
      ...m,
      CertificacionNombre: cert?.nombre || `Estación ${m.CertificacionId}`,
      Linea: cert?.linea || 'L-01',
      Estacion: cert?.estacion || `EST-${m.CertificacionId}`,
      MovimientoTipoNombre: tipo?.nombre || 'Desconocido',
      RazonDescripcion: razon?.Descripcion || `Razón ${m.RazonId}`,
      EstatusTexto: estatusTexto,
      fecha,
      hora,
      costoUnitarioEstimado: costoUnitario,
      costoTotalEstimado: costoTotal,
    };
  }

  async listar(filtros: FiltrosMovimientosQuery = {}): Promise<MovimientoDetalleDTO[]> {
    let lista = MOVIMIENTOS_TABLA.map((m) => this.enriquecerMovimiento(m));

    if (filtros.tipoId) {
      const tipoIdNum = parseInt(filtros.tipoId, 10);
      lista = lista.filter((m) => m.MovimientoTipoId === tipoIdNum);
    }

    if (filtros.aprobado !== undefined && filtros.aprobado !== '') {
      const apNum = parseInt(filtros.aprobado, 10);
      lista = lista.filter((m) => m.aprobado === apNum);
    }

    if (filtros.razonId) {
      const rNum = parseInt(filtros.razonId, 10);
      lista = lista.filter((m) => m.RazonId === rNum);
    }

    if (filtros.busqueda) {
      const q = filtros.busqueda.toLowerCase();
      lista = lista.filter(
        (m) =>
          m.MATNR.toLowerCase().includes(q) ||
          (m.serial && m.serial.toLowerCase().includes(q)) ||
          (m.Empleado && m.Empleado.toLowerCase().includes(q)) ||
          (m.credencial && m.credencial.toLowerCase().includes(q)) ||
          (m.RazonDescripcion && m.RazonDescripcion.toLowerCase().includes(q))
      );
    }

    return lista.sort((a, b) => b.id - a.id);
  }

  async obtenerPorId(id: number): Promise<MovimientoDetalleDTO | null> {
    const item = MOVIMIENTOS_TABLA.find((m) => m.id === id);
    return item ? this.enriquecerMovimiento(item) : null;
  }

  async crear(nuevo: Omit<MovimientoDB, 'id'>): Promise<MovimientoDetalleDTO> {
    const id = nextId++;
    const registro: MovimientoDB = {
      ...nuevo,
      id,
      fecha_hora: nuevo.fecha_hora || new Date().toISOString(),
      serial: nuevo.serial || `ETQ-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      aprobado: nuevo.aprobado ?? 0,
      salida: nuevo.salida ?? false,
      retorno: nuevo.retorno ?? false,
      procesado: nuevo.procesado ?? 0,
    };
    MOVIMIENTOS_TABLA.unshift(registro);
    return this.enriquecerMovimiento(registro);
  }

  async aprobar(id: number, aprobadoPor: string): Promise<boolean> {
    const item = MOVIMIENTOS_TABLA.find((m) => m.id === id);
    if (item) {
      item.aprobado = 1;
      item.nvAprobadoPor = aprobadoPor;
      item.dtAprobado = new Date().toISOString();
      return true;
    }
    return false;
  }

  async rechazar(id: number, rechazadoPor: string): Promise<boolean> {
    const item = MOVIMIENTOS_TABLA.find((m) => m.id === id);
    if (item) {
      item.aprobado = 2;
      item.nvAprobadoPor = rechazadoPor;
      item.dtAprobado = new Date().toISOString();
      return true;
    }
    return false;
  }

  async obtenerKPIs() {
    const movimientos = await this.listar();
    const scrapMovs = movimientos.filter((m) => m.MovimientoTipoId === 1);
    const piezasScrap = scrapMovs.reduce((acc, m) => acc + m.cantidad, 0);
    const costoScrap = scrapMovs.reduce((acc, m) => acc + (m.costoTotalEstimado || 0), 0);
    const pendientes = movimientos.filter((m) => m.aprobado === 0).length;
    const aprobados = movimientos.filter((m) => m.aprobado === 1).length;
    const rechazados = movimientos.filter((m) => m.aprobado === 2).length;

    return {
      piezasScrapTotal: piezasScrap,
      costoScrapTotal: costoScrap,
      pendientesAprobacion: pendientes,
      aprobadosTotal: aprobados,
      rechazadosTotal: rechazados,
      totalMovimientos: movimientos.length,
      tasaAprobacion: movimientos.length > 0 ? ((aprobados / movimientos.length) * 100).toFixed(1) : '0',
    };
  }
}
