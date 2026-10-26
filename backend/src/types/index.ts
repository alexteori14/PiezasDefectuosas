export interface MovimientoDB {
  id: number;
  CertificacionId: number;
  MATNR: string;
  fecha_hora: string | Date;
  credencial: string;
  MovimientoTipoId: number;
  cantidad: number;
  salida: boolean;
  retorno: boolean;
  EmpleadoId: string | null;
  Empleado: string | null;
  procesado?: number | null;
  aprobado: number | null; // 0: Pendiente, 1: Aprobado, 2: Rechazado
  RazonId: number | null;
  centro_costo: string | null;
  almacen: string | null;
  serial: string | null;
  MATNR_FG: string | null;
  nvAprobadoPor: string | null;
  dtAprobado: string | Date | null;
}

export interface MovimientoDetalleDTO extends MovimientoDB {
  MovimientoTipoNombre?: string;
}

export interface ResumenScrapLineaDB {
  lineaId: number | null;
  movimientos: number;
  piezasScrap: number;
}

export interface MovimientoTipoDB {
  id: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
}

export interface RazonDB {
  Id?: number;
  IdMovimiento?: number | null;
  IdRazon: number;
  Descripcion: string;
  CC_Sugerido?: string | null;
  Notifica?: string | null;
  PuntaCola?: string | null;
  activo?: boolean;
}

export interface CertificacionDB {
  id: number;
  nombre: string;
  linea?: string;
  estacion?: string;
  ubicacion?: string;
  activo: boolean;
}

export interface FiltrosMovimientosQuery {
  busqueda?: string;
  tipoId?: string;
  aprobado?: string;
  razonId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  limite?: string;
  pagina?: string;
}
