import type { Movimiento } from '../types';

export const formatearMoneda = (cantidad: number, moneda: string = 'USD'): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cantidad);
};

export const formatearNumero = (cantidad: number): string => {
  return new Intl.NumberFormat('es-MX').format(cantidad);
};

export const formatearFecha = (fechaStr: string): string => {
  if (!fechaStr) return '';
  const [año, mes, dia] = fechaStr.split('-');
  if (!año || !mes || !dia) return fechaStr;
  const fecha = new Date(Number(año), Number(mes) - 1, Number(dia));
  return fecha.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const descargarCSV = (datos: Movimiento[], nombreArchivo = 'reporte-scrap.csv') => {
  if (!datos || datos.length === 0) return;

  const cabeceras = [
    'ID',
    'MATNR (Material)',
    'Descripción',
    'Fecha',
    'Hora',
    'Turno',
    'Línea',
    'Tipo Movimiento',
    'Motivo Específico',
    'Cantidad',
    'Unidad',
    'Almacén Salida',
    'Almacén Retorno',
    'Estatus',
    'Costo Unitario (USD)',
    'Costo Total (USD)',
    'Empleado',
    'Credencial',
    'Orden de Producción',
    'Lote',
  ];

  const filas = datos.map((m) => [
    m.id,
    m.matnr,
    `"${m.descripcion.replace(/"/g, '""')}"`,
    m.fecha,
    m.hora,
    m.turno,
    `"${m.linea}"`,
    m.movimientoTipo,
    `"${m.motivoEspecifico.replace(/"/g, '""')}"`,
    m.cantidad,
    m.unidad,
    m.almacenSalida,
    m.almacenRetorno,
    m.estatus,
    m.costoUnitario,
    m.costoTotal,
    `"${m.empleado}"`,
    m.credencial,
    m.ordenProduccion || '',
    m.lote || '',
  ]);

  const contenido = [cabeceras.join(','), ...filas.map((f) => f.join(','))].join('\r\n');
  const blob = new Blob(['\uFEFF' + contenido], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', nombreArchivo);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const simularImpresionPDF = (titulo: string) => {
  const originalTitle = document.title;
  document.title = `${titulo} - Magna MES Industrial Systems`;
  window.print();
  document.title = originalTitle;
};
