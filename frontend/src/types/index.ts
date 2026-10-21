export type EstatusMovimiento = 'Pendiente' | 'Aprobado' | 'Rechazado' | 'En Cuarentena' | 'Retrabajo';

export type CategoriaMotivo = 
  | 'Scrap'
  | 'Retrabajo en Línea'
  | 'Calidad'
  | 'Cuarentena'
  | 'Calidad Reingreso'
  | 'Metal Finish'
  | 'Traspaleo'
  | 'Impresión Parcial'
  | 'Reingreso Parcial';

export type SeveridadMotivo = 'Crítica' | 'Alta' | 'Media' | 'Baja';

export type Turno = 'Turno 1' | 'Turno 2' | 'Turno 3';

export interface Motivo {
  id: string;
  codigo: string;
  nombre: string;
  categoria: CategoriaMotivo;
  descripcion: string;
  severidad: SeveridadMotivo;
  activo: boolean;
  costoDefectoPromedio?: number;
}

export interface HitoHistorial {
  id: string;
  titulo: string;
  descripcion: string;
  fechaHora: string;
  usuario: string;
  rol: string;
  estado: 'completado' | 'actual' | 'pendiente' | 'rechazado';
}

export interface Movimiento {
  id: string;
  matnr: string;
  descripcion: string;
  fecha: string; // YYYY-MM-DD
  hora: string;  // HH:mm
  credencial: string;
  empleado: string;
  movimientoTipo: CategoriaMotivo;
  motivoEspecifico: string;
  cantidad: number;
  unidad: string;
  almacenSalida: string;
  almacenRetorno: string;
  linea: string;
  almacen: string;
  estatus: EstatusMovimiento;
  turno: Turno;
  costoUnitario: number;
  costoTotal: number;
  ordenProduccion?: string;
  lote?: string;
  observaciones?: string;
  aprobadoPor?: string;
  fechaAprobacion?: string;
  comentariosAprobacion?: string;
  historial: HitoHistorial[];
}

export interface LineaProduccion {
  id: string;
  codigo: string;
  nombre: string;
  area: string;
  supervisor: string;
  metaScrapMaximo: number; // Porcentaje máximo admisible
}

export interface Notificacion {
  id: string;
  tipo: 'alerta' | 'aprobacion' | 'sistema' | 'critico';
  titulo: string;
  mensaje: string;
  tiempo: string;
  leido: boolean;
  movimientoId?: string;
}

export interface FiltrosMovimientos {
  busqueda: string;
  linea: string;
  estatus: string;
  movimientoTipo: string;
  turno: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface ResumenKPIs {
  scrapHoyPzas: number;
  scrapHoyCosto: number;
  pendientesAprobar: number;
  aprobadosHoy: number;
  rechazadosHoy: number;
  tasaScrapGeneral: number; // Porcentaje ej. 1.4%
  comparativaAyer: number;  // Variación ej. -0.3%
}
