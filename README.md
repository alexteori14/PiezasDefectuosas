# Sistema MES Industrial: SCRAP & Materials Movement Dashboard

> Sistema corporativo frontend para control, consulta, trazabilidad, aprobación y seguimiento de movimientos de materiales no conformes y scrap en plantas de manufactura automotriz.

Inspirado en los lineamientos visuales y de interacción de **SAP Fiori**, **Microsoft Fluent UI**, **Power BI** y sistemas **MES (Manufacturing Execution Systems)** de clase mundial (Magna International - Carrocerías & Estampado).

---

## 🚀 Características Principales

- **Dashboard Ejecutivo & Operativo:**
  - KPIs en tiempo real: *Scrap Generado Hoy*, *Pendiente de Aprobar*, *Aprobado*, *Rechazado/Salvado* y *OEE Loss Rate*.
  - Gráfica interactiva de área con gradiente de tendencia horaria contra límites de tolerancia admisible.
  - Análisis Pareto de causas raíz de defectos en gráfica tipo Donut interactiva.
  - Distribución de incidencias acumuladas por línea de producción (L-01 a L-07).
  - Modal para registro rápido de incidencias en piso de producción.

- **Auditoría y Registro General de Movimientos:**
  - Tabla de alta densidad con las 12 columnas requeridas: *ID, MATNR (Material SAP), Fecha, Credencial, Movimiento, Cantidad, Salida, Retorno, Empleado, Línea, Almacén, Estatus*.
  - Búsqueda en vivo multicriterio (por MATNR, empleado, ID, credencial o pieza).
  - Filtros combinables por línea, estatus, tipo de movimiento y turno.
  - Ordenamiento por columnas y paginación configurable (10, 25 o 50 registros).
  - Exportación de la selección filtrada a archivo CSV real.

- **Mesa Digital de Aprobaciones:**
  - Interfaz diseñada específicamente para el rol de Supervisor de Calidad en planta.
  - Columnas: *Línea, Número de Parte, Hora, Turno, Cantidad, Motivo, Reporta*.
  - Acciones con confirmación visual: **Aprobar** (con cálculo de impacto en dólares y firma digital), **Rechazar** (con justificación obligatoria) y **Ver Detalle**.
  - Soporte de selección múltiple y aprobación en lote.
  - Actualización reactiva instantánea en todos los contadores de la aplicación.

- **Catálogo CRUD de Motivos de Defecto:**
  - Clasificación por categorías: *Scrap, Retrabajo en Línea, Calidad, Cuarentena, Calidad Reingreso, Metal Finish, Traspaleo, Impresión Parcial, Reingreso Parcial*.
  - Códigos estandarizados, severidades (*Crítica, Alta, Media, Baja*), criterios de inspección y costos de referencia.
  - Alta, edición, desactivación y eliminación interactiva con persistencia local.

- **Módulo de Reportes & Análisis Financiero:**
  - Filtros cruzados por rango de fechas, línea de ensamble, turno y motivo específico.
  - Tabla consolidada con desglose por Número de Parte (MATNR), volumen, costo total y porcentaje de contribución al scrap de planta.
  - Generador de archivos **Excel (.csv)** con codificación UTF-8 BOM.
  - Formato para **Imprimir / Guardar en PDF** con diseño corporativo y secciones de firmas.

- **Ficha Técnica 360° y Trazabilidad IATF 16949:**
  - Ficha individual de movimiento (`/movimientos/:id`) con orden de producción (OP), lote y centros de costo.
  - **Marbete de Scrap:** Simulación de marbete físico viajero con código de barras y área para firma autorizada.
  - **Timeline Cronológico:** Trazabilidad de hitos desde el reporte en terminal MES hasta el ajuste contable en SAP BAPI 551.

- **Configuración y Parámetros de Planta:**
  - Datos maestros de planta (*Planta Saltillo - Magna Body, Werks 1020*).
  - Estado del conector SAP ERP (BAPI_GOODSMVT_CREATE movimiento 551).
  - Conmutador de turnos activos (Turno 1, Turno 2, Turno 3).
  - Modo Claro (SAP Fiori Standard) y Modo Oscuro (Industrial High Contrast).
  - Botón de reinicio de datos mock a valores de fábrica.

---

## 🛠️ Stack Tecnológico

- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Empaquetador:** [Vite 8](https://vite.dev/)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`)
- **Enrutamiento:** [React Router DOM v7](https://reactrouter.com/)
- **Animaciones:** [Framer Motion](https://www.framer.com/motion/)
- **Gráficas:** [Recharts](https://recharts.org/)
- **Iconos:** [Lucide React](https://lucide.dev/)
- **Almacenamiento:** Context API + `localStorage` (100% Mock, sin backend externo)

---

## 📂 Estructura del Repositorio

```
.
├── Documentacion.md         # Documentación técnica exhaustiva del sistema
├── memoria.md               # Memoria de arquitectura, contexto automotriz y decisiones UX
├── Especificaciones.txt     # Requerimientos originales del proyecto
├── README.md                # Presentación general y guía rápida
├── .gitignore               # Exclusión de node_modules y compilados dist
└── frontend/                # Código fuente de la aplicación React
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.app.json
    └── src/
        ├── assets/          # Recursos gráficos y fuentes
        ├── components/      # Componentes UI reutilizables (Badge, Button, Card, Modal, etc.)
        ├── constants/       # Datos maestros de planta, líneas y turnos
        ├── context/         # Estados globales reactivos (ScrapContext, ThemeContext)
        ├── features/        # Módulos de funcionalidad
        ├── hooks/           # Custom hooks para analítica
        ├── layouts/         # Shell de la aplicación (Sidebar, TopHeader, MainLayout)
        ├── mock/            # Dataset automotriz realista con 25+ registros
        ├── pages/           # Vistas principales (Dashboard, Aprobaciones, Movimientos, etc.)
        ├── services/        # Simulación de servicios asíncronos SAP ERP
        ├── types/           # Interfaces TypeScript de dominio
        └── utils/           # Formateadores, generador CSV e impresión PDF
```

---

## ⚡ Instalación y Puesta en Marcha

### Prerrequisitos
- **Node.js** >= 20.x
- **npm** >= 9.x

### Pasos
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/alexteori14/PiezasDefectuosas.git
   cd PiezasDefectuosas/frontend
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```
   Abrir en el navegador en [http://localhost:5173/](http://localhost:5173/).

4. Compilar para producción:
   ```bash
   npm run build
   ```

---

## 📖 Documentación Adicional

- Para consultar el análisis funcional, contexto automotriz y decisiones de arquitectura, consulta [`memoria.md`](memoria.md).
- Para el detalle técnico de componentes, props, modelo de datos y ciclo de vida, consulta [`Documentacion.md`](Documentacion.md).
