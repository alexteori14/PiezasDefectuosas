import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { Motivo, Movimiento, Notificacion, ResumenKPIs, Turno, RazonCatalogo } from '../types';
import { MOTIVOS_INICIALES, MOVIMIENTOS_INICIALES, NOTIFICACIONES_INICIALES, RAZONES_SSMS } from '../mock/data';
import { MOVIMIENTO_TIPOS_SSMS } from '../constants';

interface ToastMessage {
  id: string;
  tipo: 'success' | 'error' | 'info' | 'warning';
  titulo: string;
  mensaje: string;
}

interface ScrapContextType {
  movimientos: Movimiento[];
  motivos: Motivo[];
  razonesCatalogo: RazonCatalogo[];
  notificaciones: Notificacion[];
  turnoActivo: Turno;
  setTurnoActivo: (turno: Turno) => void;
  resumenKPIs: ResumenKPIs;
  toasts: ToastMessage[];
  agregarToast: (tipo: ToastMessage['tipo'], titulo: string, mensaje: string) => void;
  removerToast: (id: string) => void;
  aprobarMovimiento: (id: string, comentarios?: string) => void;
  rechazarMovimiento: (id: string, comentarios?: string) => void;
  crearMovimiento: (nuevo: Partial<Movimiento>) => Movimiento;
  crearMotivo: (nuevo: Omit<Motivo, 'id'>) => Motivo;
  actualizarMotivo: (id: string, actualizacion: Partial<Motivo>) => void;
  eliminarMotivo: (id: string) => void;
  marcarNotificacionLeida: (id: string) => void;
  marcarTodasNotificacionesLeidas: () => void;
  resetearDatosMock: () => void;
}

const ScrapContext = createContext<ScrapContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MOVIMIENTOS: 'scrap_mes_movimientos_ssms_v2',
  MOTIVOS: 'scrap_mes_motivos_ssms_v2',
  NOTIFICACIONES: 'scrap_mes_notificaciones_ssms_v2',
  TURNO: 'scrap_mes_turno_ssms_v2',
};

export const ScrapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [movimientos, setMovimientos] = useState<Movimiento[]>(() => {
    const guardado = localStorage.getItem(STORAGE_KEYS.MOVIMIENTOS);
    if (guardado) {
      try {
        return JSON.parse(guardado);
      } catch (e) {
        console.error('Error al cargar movimientos de localStorage', e);
      }
    }
    return MOVIMIENTOS_INICIALES;
  });

  const [motivos, setMotivos] = useState<Motivo[]>(() => {
    const guardado = localStorage.getItem(STORAGE_KEYS.MOTIVOS);
    if (guardado) {
      try {
        return JSON.parse(guardado);
      } catch (e) {
        console.error('Error al cargar motivos de localStorage', e);
      }
    }
    return MOTIVOS_INICIALES;
  });

  const [razonesCatalogo] = useState<RazonCatalogo[]>(RAZONES_SSMS);

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(() => {
    const guardado = localStorage.getItem(STORAGE_KEYS.NOTIFICACIONES);
    if (guardado) {
      try {
        return JSON.parse(guardado);
      } catch (e) {
        console.error('Error al cargar notificaciones de localStorage', e);
      }
    }
    return NOTIFICACIONES_INICIALES;
  });

  const [turnoActivo, setTurnoActivoState] = useState<Turno>(() => {
    const guardado = localStorage.getItem(STORAGE_KEYS.TURNO);
    return (guardado as Turno) || 'Turno 1';
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOVIMIENTOS, JSON.stringify(movimientos));
  }, [movimientos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOTIVOS, JSON.stringify(motivos));
  }, [motivos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICACIONES, JSON.stringify(notificaciones));
  }, [notificaciones]);

  const setTurnoActivo = (turno: Turno) => {
    setTurnoActivoState(turno);
    localStorage.setItem(STORAGE_KEYS.TURNO, turno);
    agregarToast('info', 'Cambio de Turno', `Operando en ${turno}`);
  };

  const agregarToast = (tipo: ToastMessage['tipo'], titulo: string, mensaje: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, tipo, titulo, mensaje }]);
    setTimeout(() => {
      removerToast(id);
    }, 4500);
  };

  const removerToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const aprobarMovimiento = (id: string, comentarios = 'Aprobado conforme a procedimiento de scrap') => {
    const ahora = new Date();
    const fechaHoraStr = `${ahora.toISOString().split('T')[0]} ${ahora.toTimeString().slice(0, 5)}`;
    const supervisor = 'Ing. Carlos Mendoza';

    setMovimientos((prev) =>
      prev.map((m) => {
        if (m.id === id || m.serial === id) {
          const nuevoHistorial = [
            ...(m.historial || []),
            {
              id: `H-${Date.now()}`,
              titulo: 'Aprobación de Scrap Autorizada (aprobado = 1)',
              descripcion: `${comentarios} • Registrado en dbo.Movimientos por ${supervisor}`,
              fechaHora: fechaHoraStr,
              usuario: supervisor,
              rol: 'Supervisor de Calidad',
              estado: 'completado' as const,
            },
          ];
          return {
            ...m,
            aprobado: 1, // 1: Aprobado en SSMS
            nvAprobadoPor: supervisor,
            dtAprobado: fechaHoraStr,
            estatus: 'Aprobado' as const,
            comentariosAprobacion: comentarios,
            historial: nuevoHistorial,
          };
        }
        return m;
      })
    );

    agregarToast('success', 'Movimiento Aprobado', `El folio ${id} fue aprobado (aprobado = 1) en la base de datos.`);
  };

  const rechazarMovimiento = (id: string, comentarios = 'Rechazado por evaluación técnica') => {
    const ahora = new Date();
    const fechaHoraStr = `${ahora.toISOString().split('T')[0]} ${ahora.toTimeString().slice(0, 5)}`;
    const supervisor = 'Ing. Carlos Mendoza';

    setMovimientos((prev) =>
      prev.map((m) => {
        if (m.id === id || m.serial === id) {
          const nuevoHistorial = [
            ...(m.historial || []),
            {
              id: `H-${Date.now()}`,
              titulo: 'Solicitud de Scrap Rechazada (aprobado = 2)',
              descripcion: `${comentarios} • Desviado de scrap contable a recuperación`,
              fechaHora: fechaHoraStr,
              usuario: supervisor,
              rol: 'Supervisor de Calidad',
              estado: 'rechazado' as const,
            },
          ];
          return {
            ...m,
            aprobado: 2, // 2: Rechazado en SSMS
            nvAprobadoPor: supervisor,
            dtAprobado: fechaHoraStr,
            estatus: 'Rechazado' as const,
            almacen: 'ALM-12', // Canalizado a retrabajo
            comentariosAprobacion: comentarios,
            historial: nuevoHistorial,
          };
        }
        return m;
      })
    );

    agregarToast('warning', 'Movimiento Rechazado', `El folio ${id} fue rechazado (aprobado = 2) y reenviado a análisis.`);
  };

  const crearMovimiento = (nuevo: Partial<Movimiento>): Movimiento => {
    const hoy = new Date();
    const fecha = nuevo.fecha || hoy.toISOString().split('T')[0];
    const hora = nuevo.hora || hoy.toTimeString().slice(0, 5);
    const fechaHora = `${fecha} ${hora}`;
    const idNumerico = (movimientos.length + 1).toString();
    const serial = nuevo.serial || `ETQ-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const tipoObj = MOVIMIENTO_TIPOS_SSMS.find((t) => t.id === nuevo.movimientoTipoId) || MOVIMIENTO_TIPOS_SSMS[0];
    const razonObj = RAZONES_SSMS.find((r) => r.idRazon === nuevo.razonId) || RAZONES_SSMS[0];

    const movimientoCreado: Movimiento = {
      id: idNumerico,
      certificacionId: nuevo.certificacionId || 101,
      certificacionNombre: nuevo.certificacionNombre || 'Estación Certificadora Prensa 01',
      matnr: nuevo.matnr || 'MAT-849201',
      matnrFg: nuevo.matnrFg || 'FG-CX9-FND-LH',
      fechaHora,
      fecha,
      hora,
      credencial: nuevo.credencial || 'EMP-3041',
      empleadoId: nuevo.empleadoId || nuevo.credencial || 'EMP-3041',
      empleado: nuevo.empleado || 'Operador en Piso',
      movimientoTipoId: nuevo.movimientoTipoId || tipoObj.id,
      movimientoTipo: nuevo.movimientoTipo || tipoObj.nombre,
      cantidad: Number(nuevo.cantidad) || 1,
      salida: true,
      retorno: false,
      procesado: 0,
      aprobado: 0, // 0: Pendiente en SSMS
      razonId: nuevo.razonId || razonObj.idRazon,
      motivoEspecifico: nuevo.motivoEspecifico || razonObj.descripcion,
      centroCosto: nuevo.centroCosto || 'CC-ESTAMP',
      almacen: nuevo.almacen || (tipoObj.id === 1 ? 'ALM-99' : 'ALM-02'),
      serial,
      descripcion: nuevo.descripcion || 'Componente Automotriz en Proceso',
      linea: nuevo.linea || 'L-01 Estampado Pesado Prensa Transfer',
      almacenSalida: nuevo.almacenSalida || 'ALM-02 (WIP)',
      almacenRetorno: nuevo.almacenRetorno || 'ALM-99 (Scrap Yard)',
      estatus: 'Pendiente',
      turno: nuevo.turno || turnoActivo,
      unidad: nuevo.unidad || 'PZA',
      costoUnitario: Number(nuevo.costoUnitario) || (razonObj.ccSugerido ? parseFloat(razonObj.ccSugerido) : 185),
      costoTotal: (Number(nuevo.costoUnitario) || 185) * (Number(nuevo.cantidad) || 1),
      ordenProduccion: nuevo.ordenProduccion || `OP-450${Math.floor(1000 + Math.random() * 9000)}`,
      lote: nuevo.lote || `LOT-${hoy.getFullYear()}${hoy.getMonth() + 1}-A1`,
      observaciones: nuevo.observaciones || '',
      historial: [
        {
          id: `H-INIT-${Date.now()}`,
          titulo: 'Registro de Movimiento en dbo.Movimientos',
          descripcion: `Etiqueta serial ${serial} emitida en Estación ${nuevo.certificacionId || 101}. Razón ${nuevo.razonId || razonObj.idRazon}: ${nuevo.motivoEspecifico || razonObj.descripcion}.`,
          fechaHora,
          usuario: nuevo.empleado || 'Operador',
          rol: 'Operador de Producción',
          estado: 'completado',
        },
        {
          id: `H-PEND-${Date.now()}`,
          titulo: 'Pendiente de Validación (aprobado = 0)',
          descripcion: 'Enviado a bandeja de aprobaciones de calidad y supervisor de turno.',
          fechaHora,
          usuario: 'Sistema MES',
          rol: 'Control',
          estado: 'actual',
        },
      ],
    };

    setMovimientos((prev) => [movimientoCreado, ...prev]);
    agregarToast('success', 'Movimiento Creado', `Folio serial ${serial} registrado correctamente en la base de datos.`);
    return movimientoCreado;
  };

  const crearMotivo = (nuevo: Omit<Motivo, 'id'>): Motivo => {
    const nuevoId = `MOT-${nuevo.razonId || Math.floor(5000 + Math.random() * 1000)}`;
    const motivoCreado: Motivo = {
      ...nuevo,
      id: nuevoId,
    };
    setMotivos((prev) => [...prev, motivoCreado]);
    agregarToast('success', 'Razón Creada', `Razón ${motivoCreado.codigo} agregada al catálogo.`);
    return motivoCreado;
  };

  const actualizarMotivo = (id: string, actualizacion: Partial<Motivo>) => {
    setMotivos((prev) => prev.map((m) => (m.id === id ? { ...m, ...actualizacion } : m)));
    agregarToast('info', 'Razón Actualizada', 'Los cambios en el catálogo fueron guardados.');
  };

  const eliminarMotivo = (id: string) => {
    setMotivos((prev) => prev.filter((m) => m.id !== id));
    agregarToast('warning', 'Razón Eliminada', 'El motivo ha sido retirado del catálogo.');
  };

  const marcarNotificacionLeida = (id: string) => {
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leido: true } : n)));
  };

  const marcarTodasNotificacionesLeidas = () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leido: true })));
    agregarToast('info', 'Notificaciones', 'Todas marcadas como leídas.');
  };

  const resetearDatosMock = () => {
    localStorage.removeItem(STORAGE_KEYS.MOVIMIENTOS);
    localStorage.removeItem(STORAGE_KEYS.MOTIVOS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICACIONES);
    setMovimientos(MOVIMIENTOS_INICIALES);
    setMotivos(MOTIVOS_INICIALES);
    setNotificaciones(NOTIFICACIONES_INICIALES);
    agregarToast('info', 'Datos Reiniciados', 'Valores restaurados al estándar oficial de dbo.Movimientos.');
  };

  // Cálculo reactivo de KPIs ejecutivos
  const resumenKPIs = useMemo<ResumenKPIs>(() => {
    const scrapMovs = movimientos.filter((m) => m.movimientoTipoId === 1 || m.movimientoTipo === 'Scrap');
    const scrapHoyPzas = scrapMovs.reduce((sum, m) => sum + m.cantidad, 0);
    const scrapHoyCosto = scrapMovs.reduce((sum, m) => sum + m.costoTotal, 0);
    const pendientesAprobar = movimientos.filter((m) => m.aprobado === 0 || m.estatus === 'Pendiente').length;
    const aprobadosHoy = movimientos.filter((m) => m.aprobado === 1 || m.estatus === 'Aprobado').length;
    const rechazadosHoy = movimientos.filter((m) => m.aprobado === 2 || m.estatus === 'Rechazado').length;

    return {
      scrapHoyPzas,
      scrapHoyCosto,
      pendientesAprobar,
      aprobadosHoy,
      rechazadosHoy,
      tasaScrapGeneral: 1.2,
      comparativaAyer: -0.4,
    };
  }, [movimientos]);

  return (
    <ScrapContext.Provider
      value={{
        movimientos,
        motivos,
        razonesCatalogo,
        notificaciones,
        turnoActivo,
        setTurnoActivo,
        resumenKPIs,
        toasts,
        agregarToast,
        removerToast,
        aprobarMovimiento,
        rechazarMovimiento,
        crearMovimiento,
        crearMotivo,
        actualizarMotivo,
        eliminarMotivo,
        marcarNotificacionLeida,
        marcarTodasNotificacionesLeidas,
        resetearDatosMock,
      }}
    >
      {children}
    </ScrapContext.Provider>
  );
};

export const useScrap = () => {
  const context = useContext(ScrapContext);
  if (!context) {
    throw new Error('useScrap debe ser usado dentro de un ScrapProvider');
  }
  return context;
};
