import type { MovimientoTipoDB, RazonDB, CertificacionDB } from '../types/index.js';

export const MOVIMIENTO_TIPOS_PREDETERMINADOS: MovimientoTipoDB[] = [
  { id: 1, nombre: 'Scrap', descripcion: 'Descarte total de material no conforme', activo: true },
  { id: 2, nombre: 'Retrabajo en Linea', descripcion: 'Recuperación inmediata en celda de producción', activo: true },
  { id: 3, nombre: 'Calidad', descripcion: 'Muestreo para análisis de laboratorio o CMM', activo: true },
  { id: 4, nombre: 'Cuarentena', descripcion: 'Retención de lote preventivo', activo: true },
  { id: 5, nombre: 'Calidad Reingreso', descripcion: 'Reincorporación de material liberado por calidad', activo: true },
  { id: 6, nombre: 'metal Finish', descripcion: 'Acondicionamiento cosmético o pulido de chapa', activo: true },
  { id: 7, nombre: 'Traspaleo', descripcion: 'Reacomodo logístico de contenedores/racks', activo: true },
  { id: 8, nombre: 'Impresion Parcial', descripcion: 'Falla de marbete o impresión incompleta', activo: true },
];

export const CERTIFICACIONES_PREDETERMINADAS: CertificacionDB[] = [
  { id: 101, nombre: 'Estación Certificadora Prensa 01', linea: 'L-01', estacion: 'EST-01', ubicacion: 'Prensas Transfer', activo: true },
  { id: 102, nombre: 'Estación Certificadora Prensa 02', linea: 'L-02', estacion: 'EST-02', ubicacion: 'Prensas Tándem', activo: true },
  { id: 103, nombre: 'Celda Certificación Soldadura A', linea: 'L-03', estacion: 'EST-W1', ubicacion: 'Soldadura Robótica', activo: true },
  { id: 104, nombre: 'Celda Certificación Soldadura B', linea: 'L-03', estacion: 'EST-W2', ubicacion: 'Soldadura Robótica', activo: true },
  { id: 105, nombre: 'Estación Final Metal Finish 01', linea: 'L-05', estacion: 'EST-MF1', ubicacion: 'Bahía de Acabados', activo: true },
  { id: 106, nombre: 'Mesa de Calidad y CMM Central', linea: 'CAL-01', estacion: 'LAB-CMM', ubicacion: 'Metrología', activo: true },
  { id: 107, nombre: 'Bahía de Cuarentena e Inspección', linea: 'CUA-01', estacion: 'ALM-05', ubicacion: 'Cuarentena', activo: true },
];

export const RAZONES_PREDETERMINADAS: RazonDB[] = [
  { Id: 1, IdMovimiento: 553, IdRazon: 5001, Descripcion: 'Arrugas', CC_Sugerido: '185.00', activo: true },
  { Id: 2, IdMovimiento: 553, IdRazon: 5002, Descripcion: 'Barreno Dañado', CC_Sugerido: '120.00', activo: true },
  { Id: 3, IdMovimiento: 553, IdRazon: 5003, Descripcion: 'Blank Dañado', CC_Sugerido: '210.00', activo: true },
  { Id: 4, IdMovimiento: 553, IdRazon: 5004, Descripcion: 'Blank mal Dimensionado', CC_Sugerido: '160.00', activo: true },
  { Id: 5, IdMovimiento: 553, IdRazon: 5005, Descripcion: 'Blank Sucio', CC_Sugerido: '75.00', activo: true },
  { Id: 6, IdMovimiento: 553, IdRazon: 5006, Descripcion: 'Cambio de Ingenieria', CC_Sugerido: '340.00', activo: true },
  { Id: 7, IdMovimiento: 553, IdRazon: 5007, Descripcion: 'Deformacion en Outer', CC_Sugerido: '220.00', activo: true },
  { Id: 8, IdMovimiento: 553, IdRazon: 5008, Descripcion: 'Daño por Equipo', CC_Sugerido: '190.00', activo: true },
  { Id: 9, IdMovimiento: 553, IdRazon: 5009, Descripcion: 'Falta de Material', CC_Sugerido: '140.00', activo: true },
  { Id: 10, IdMovimiento: 553, IdRazon: 5010, Descripcion: 'Fisura', CC_Sugerido: '250.00', activo: true },
  { Id: 11, IdMovimiento: 553, IdRazon: 5011, Descripcion: 'Golpe en Proceso', CC_Sugerido: '130.00', activo: true },
  { Id: 12, IdMovimiento: 553, IdRazon: 5012, Descripcion: 'Mal Engargolado', CC_Sugerido: '175.00', activo: true },
  { Id: 13, IdMovimiento: 553, IdRazon: 5013, Descripcion: 'Mala Apariencia', CC_Sugerido: '95.00', activo: true },
  { Id: 14, IdMovimiento: 553, IdRazon: 5014, Descripcion: 'Mala Reparación/Mal Ensamble', CC_Sugerido: '110.00', activo: true },
  { Id: 15, IdMovimiento: 553, IdRazon: 5015, Descripcion: 'Material Fuera de Especificación', CC_Sugerido: '280.00', activo: true },
  { Id: 16, IdMovimiento: 553, IdRazon: 5017, Descripcion: 'Pieza Dañada por Troquel', CC_Sugerido: '310.00', activo: true },
  { Id: 17, IdMovimiento: 553, IdRazon: 5018, Descripcion: 'Pieza Fuera de Dimensión', CC_Sugerido: '160.00', activo: true },
  { Id: 18, IdMovimiento: 553, IdRazon: 5019, Descripcion: 'Poros en Acero', CC_Sugerido: '215.00', activo: true },
  { Id: 19, IdMovimiento: 553, IdRazon: 5020, Descripcion: 'Poros en Laser', CC_Sugerido: '240.00', activo: true },
  { Id: 20, IdMovimiento: 553, IdRazon: 5021, Descripcion: 'Primera y Ultima pza', CC_Sugerido: '80.00', activo: true },
  { Id: 21, IdMovimiento: 553, IdRazon: 5022, Descripcion: 'Problema de Proyecto', CC_Sugerido: '150.00', activo: true },
  { Id: 22, IdMovimiento: 553, IdRazon: 5023, Descripcion: 'Problemas de Soldadura', CC_Sugerido: '260.00', activo: true },
  { Id: 23, IdMovimiento: 553, IdRazon: 5024, Descripcion: 'Punta y Cola de Rollo', CC_Sugerido: '120.00', activo: true },
  { Id: 24, IdMovimiento: 553, IdRazon: 5025, Descripcion: 'Rollo Dañado', CC_Sugerido: '450.00', activo: true },
  { Id: 25, IdMovimiento: 553, IdRazon: 5026, Descripcion: 'Tear Down', CC_Sugerido: '300.00', activo: true },
  { Id: 26, IdMovimiento: 553, IdRazon: 5027, Descripcion: 'Try Outs (Pruebas en Prensa)', CC_Sugerido: '90.00', activo: true },
  { Id: 27, IdMovimiento: 553, IdRazon: 4142, Descripcion: 'OXIDO CAL / COMP', CC_Sugerido: '135.00', activo: true },
  { Id: 28, IdMovimiento: 553, IdRazon: 4143, Descripcion: 'LAMINACION CAL / COMP', CC_Sugerido: '210.00', activo: true },
  { Id: 29, IdMovimiento: 553, IdRazon: 4144, Descripcion: 'ESCORIACION', CC_Sugerido: '115.00', activo: true },
  { Id: 30, IdMovimiento: 553, IdRazon: 4145, Descripcion: 'CONTAMINACION', CC_Sugerido: '140.00', activo: true },
  { Id: 31, IdMovimiento: 553, IdRazon: 4146, Descripcion: 'MANCHA SOLUCION COMP / CAL', CC_Sugerido: '85.00', activo: true },
  { Id: 32, IdMovimiento: 553, IdRazon: 4147, Descripcion: 'ONDULACIO/PLANICIDAD', CC_Sugerido: '175.00', activo: true },
  { Id: 33, IdMovimiento: 553, IdRazon: 4148, Descripcion: 'LIBERACION CALIDAD', CC_Sugerido: '50.00', activo: true },
  { Id: 34, IdMovimiento: 553, IdRazon: 4149, Descripcion: 'LIB STACKER 1-2', CC_Sugerido: '65.00', activo: true },
  { Id: 35, IdMovimiento: 553, IdRazon: 4150, Descripcion: 'FALLA P DE LIB STACK', CC_Sugerido: '70.00', activo: true },
  { Id: 36, IdMovimiento: 553, IdRazon: 4151, Descripcion: 'GOLPES APILADOR', CC_Sugerido: '130.00', activo: true },
  { Id: 37, IdMovimiento: 553, IdRazon: 4152, Descripcion: 'GOLPE DE GUIAS', CC_Sugerido: '125.00', activo: true },
  { Id: 38, IdMovimiento: 553, IdRazon: 4153, Descripcion: 'MARCA DE RODAJAS MTTO / MATR', CC_Sugerido: '95.00', activo: true },
  { Id: 39, IdMovimiento: 553, IdRazon: 4154, Descripcion: 'RAYAS TROQUEL', CC_Sugerido: '190.00', activo: true },
  { Id: 40, IdMovimiento: 553, IdRazon: 4155, Descripcion: 'RAYAS LIFTERS MTTO / MATR', CC_Sugerido: '110.00', activo: true },
  { Id: 41, IdMovimiento: 553, IdRazon: 4156, Descripcion: 'MARCA DE FLEJE', CC_Sugerido: '80.00', activo: true },
  { Id: 42, IdMovimiento: 553, IdRazon: 4157, Descripcion: 'MARCA DE ROLLO', CC_Sugerido: '145.00', activo: true },
  { Id: 43, IdMovimiento: 553, IdRazon: 4158, Descripcion: 'ROLLO CON RAYAS', CC_Sugerido: '160.00', activo: true },
  { Id: 44, IdMovimiento: 553, IdRazon: 4159, Descripcion: 'MAL CORTE', CC_Sugerido: '105.00', activo: true },
  { Id: 45, IdMovimiento: 553, IdRazon: 4160, Descripcion: 'CENTRADO DE ROLLO PROD / MTTO', CC_Sugerido: '115.00', activo: true },
  { Id: 46, IdMovimiento: 553, IdRazon: 4161, Descripcion: 'FALLA DE LOOP', CC_Sugerido: '90.00', activo: true },
  { Id: 47, IdMovimiento: 553, IdRazon: 4162, Descripcion: 'MARCA DE SCRAP', CC_Sugerido: '120.00', activo: true },
  { Id: 48, IdMovimiento: 553, IdRazon: 4163, Descripcion: 'TELESCOPEO', CC_Sugerido: '200.00', activo: true },
  { Id: 49, IdMovimiento: 553, IdRazon: 4164, Descripcion: 'TELESCOPICO', CC_Sugerido: '200.00', activo: true },
  { Id: 50, IdMovimiento: 553, IdRazon: 4165, Descripcion: 'DAÑO POR MANEJO', CC_Sugerido: '130.00', activo: true },
  { Id: 51, IdMovimiento: 553, IdRazon: 4166, Descripcion: 'ROLLO CONTAMINADO', CC_Sugerido: '380.00', activo: true },
  { Id: 52, IdMovimiento: 553, IdRazon: 4167, Descripcion: 'MARCAS DE NIVELADOR', CC_Sugerido: '140.00', activo: true },
  { Id: 53, IdMovimiento: 553, IdRazon: 6032, Descripcion: 'Punta de Rollo', CC_Sugerido: '100.00', activo: true },
  { Id: 54, IdMovimiento: 553, IdRazon: 6033, Descripcion: 'Cola de Rollo', CC_Sugerido: '100.00', activo: true },
  { Id: 55, IdMovimiento: 553, IdRazon: 6034, Descripcion: 'Pernos Frios', CC_Sugerido: '150.00', activo: true },
  { Id: 56, IdMovimiento: 553, IdRazon: 6035, Descripcion: 'Puntos Frios', CC_Sugerido: '150.00', activo: true },
  { Id: 57, IdMovimiento: 553, IdRazon: 7214, Descripcion: 'FALLA DE SOLDADURA', CC_Sugerido: '270.00', activo: true },
  { Id: 58, IdMovimiento: 553, IdRazon: 50112, Descripcion: 'Puntos Explotados', CC_Sugerido: '210.00', activo: true },
];

export class CatalogosRepository {
  async obtenerTipos(): Promise<MovimientoTipoDB[]> {
    return MOVIMIENTO_TIPOS_PREDETERMINADOS;
  }

  async obtenerRazones(): Promise<RazonDB[]> {
    return RAZONES_PREDETERMINADAS;
  }

  async obtenerCertificaciones(): Promise<CertificacionDB[]> {
    return CERTIFICACIONES_PREDETERMINADAS;
  }
}
