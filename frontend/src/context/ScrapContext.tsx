import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { Motivo, Movimiento, Notificacion, ResumenKPIs, Turno } from '../types';
import { MOTIVOS_INICIALES, MOVIMIENTOS_INICIALES, NOTIFICACIONES_INICIALES } from '../mock/data';

interface ToastMessage {
  id: string;
  tipo: 'success' | 'error' | 'info' | 'warning';
  titulo: string;
  mensaje: string;
}

interface ScrapContextType {
  movimientos: Movimiento[];
  motivos: Motivo[];
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
  MOVIMIENTOS: 'scrap_mes_movimientos_v1',
  MOTIVOS: 'scrap_mes_motivos_v1',
  NOTIFICACIONES: 'scrap_mes_notificaciones_v1',
  TURNO: 'scrap_mes_turno_v1',
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

    setMovimientos((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nuevoHistorial = [
            ...(m.historial || []),
            {
              id: `H-${Date.now()}`,
              titulo: 'Aprobación de Scrap Autorizada',
              descripcion: comentarios,
              fechaHora: fechaHoraStr,
              usuario: 'Ing. Carlos Mendoza',
              rol: 'Supervisor de Calidad',
              estado: 'completado' as const,
            },
          ];
          return {
            ...m,
            estatus: 'Aprobado',
            aprobadoPor: 'Ing. Carlos Mendoza',
            fechaAprobacion: fechaHoraStr,
            comentariosAprobacion: comentarios,
            historial: nuevoHistorial,
          };
        }
        return m;
      })
    );

    agregarToast('success', 'Movimiento Aprobado', `El folio ${id} fue aprobado y registrado para ajuste en SAP.`);
  };

  const rechazarMovimiento = (id: string, comentarios = 'Rechazado por evaluación técnica') => {
    const ahora = new Date();
    const fechaHoraStr = `${ahora.toISOString().split('T')[0]} ${ahora.toTimeString().slice(0, 5)}`;

    setMovimientos((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nuevoHistorial = [
            ...(m.historial || []),
            {
              id: `H-${Date.now()}`,
              titulo: 'Solicitud de Scrap Rechazada',
              descripcion: comentarios,
              fechaHora: fechaHoraStr,
              usuario: 'Ing. Carlos Mendoza',
              rol: 'Supervisor de Calidad',
              estado: 'rechazado' as const,
            },
          ];
          return {
            ...m,
            estatus: 'Rechazado',
            aprobadoPor: 'Ing. Carlos Mendoza',
            fechaAprobacion: fechaHoraStr,
            comentariosAprobacion: comentarios,
            historial: nuevoHistorial,
          };
        }
        return m;
      })
    );

    agregarToast('warning', 'Movimiento Rechazado', `El folio ${id} fue rechazado. Reenviado para análisis.`);
  };

  const crearMovimiento = (nuevo: Partial<Movimiento>): Movimiento => {
    const hoy = new Date();
    const fecha = nuevo.fecha || hoy.toISOString().split('T')[0];
    const hora = nuevo.hora || hoy.toTimeString().slice(0, 5);
    const nuevoId = `SC-${hoy.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const movimientoCreado: Movimiento = {
      id: nuevoId,
      matnr: nuevo.matnr || 'MAT-000000',
      descripcion: nuevo.descripcion || 'Pieza Automotriz No Especificada',
      fecha,
      hora,
      credencial: nuevo.credencial || 'EMP-0000',
      empleado: nuevo.empleado || 'Operador en Piso',
      movimientoTipo: nuevo.movimientoTipo || 'Scrap',
      motivoEspecifico: nuevo.motivoEspecifico || 'Defecto de Proceso',
      cantidad: Number(nuevo.cantidad) || 1,
      unidad: nuevo.unidad || 'PZA',
      almacenSalida: nuevo.almacenSalida || 'ALM-02 (WIP)',
      almacenRetorno: nuevo.almacenRetorno || 'ALM-99 (Scrap Yard)',
      linea: nuevo.linea || 'L-01 Estampado Pesado',
      almacen: nuevo.almacen || 'ALM-99',
      estatus: nuevo.estatus || 'Pendiente',
      turno: nuevo.turno || turnoActivo,
      costoUnitario: Number(nuevo.costoUnitario) || 120,
      costoTotal: (Number(nuevo.costoUnitario) || 120) * (Number(nuevo.cantidad) || 1),
      ordenProduccion: nuevo.ordenProduccion || `OP-450${Math.floor(1000 + Math.random() * 9000)}`,
      lote: nuevo.lote || `LOT-${hoy.getFullYear()}${hoy.getMonth() + 1}-X1`,
      observaciones: nuevo.observaciones || '',
      historial: [
        {
          id: `H-INIT-${Date.now()}`,
          titulo: 'Registro de Movimiento en Sistema',
          descripcion: nuevo.observaciones || 'Alta de movimiento generada en terminal MES.',
          fechaHora: `${fecha} ${hora}`,
          usuario: nuevo.empleado || 'Operador',
          rol: 'Operador de Producción',
          estado: 'completado',
        },
        {
          id: `H-PEND-${Date.now()}`,
          titulo: 'Pendiente de Validación',
          descripcion: 'Enviado a bandeja de aprobaciones de calidad.',
          fechaHora: `${fecha} ${hora}`,
          usuario: 'Sistema MES',
          rol: 'Control',
          estado: 'actual',
        },
      ],
    };

    setMovimientos((prev) => [movimientoCreado, ...prev]);
    agregarToast('success', 'Movimiento Creado', `Folio ${movimientoCreado.id} registrado correctamente.`);
    return movimientoCreado;
  };

  const crearMotivo = (nuevo: Omit<Motivo, 'id'>): Motivo => {
    const id = `MOT-${Date.now().toString().slice(-4)}`;
    const motivoCreado: Motivo = { ...nuevo, id };
    setMotivos((prev) => [motivoCreado, ...prev]);
    agregarToast('success', 'Motivo Guardado', `Código ${motivoCreado.codigo} agregado al catálogo.`);
    return motivoCreado;
  };

  const actualizarMotivo = (id: string, actualizacion: Partial<Motivo>) => {
    setMotivos((prev) => prev.map((m) => (m.id === id ? { ...m, ...actualizacion } : m)));
    agregarToast('info', 'Motivo Actualizado', 'Los cambios se han guardado.');
  };

  const eliminarMotivo = (id: string) => {
    setMotivos((prev) => prev.filter((m) => m.id !== id));
    agregarToast('warning', 'Motivo Eliminado', 'El registro fue retirado del catálogo.');
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
    agregarToast('info', 'Restablecimiento Completo', 'Datos mock reiniciados a los valores de fábrica.');
  };

  // KPIs dinámicos
  const resumenKPIs: ResumenKPIs = useMemo(() => {
    const hoyStr = '2026-10-20';
    const movimientosHoy = movimientos.filter((m) => m.fecha === hoyStr);

    const scrapHoyPzas = movimientosHoy
      .filter((m) => m.movimientoTipo === 'Scrap')
      .reduce((sum, m) => sum + m.cantidad, 0);

    const scrapHoyCosto = movimientosHoy
      .filter((m) => m.movimientoTipo === 'Scrap')
      .reduce((sum, m) => sum + m.costoTotal, 0);

    const pendientesAprobar = movimientos.filter((m) => m.estatus === 'Pendiente').length;
    const aprobadosHoy = movimientosHoy.filter((m) => m.estatus === 'Aprobado').length;
    const rechazadosHoy = movimientosHoy.filter((m) => m.estatus === 'Rechazado').length;

    return {
      scrapHoyPzas,
      scrapHoyCosto,
      pendientesAprobar,
      aprobadosHoy,
      rechazadosHoy,
      tasaScrapGeneral: 1.18,
      comparativaAyer: -0.25,
    };
  }, [movimientos]);

  return (
    <ScrapContext.Provider
      value={{
        movimientos,
        motivos,
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
    throw new Error('useScrap debe usarse dentro de ScrapProvider');
  }
  return context;
};
