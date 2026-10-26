# Documentación Técnica: Frontend SCRAP Dashboard (MES Industrial)

Esta documentación describe la arquitectura técnica, modelo de datos, componentes, estado global, flujos y guía de operación del frontend del sistema corporativo **SCRAP Dashboard**.

---

## 1. Ficha Técnica y Matriz de Dependencias

El proyecto está construido sobre el ecosistema moderno de React con TypeScript, optimizado mediante el empaquetador Vite y estilos atómicos con Tailwind CSS v4.

| Tecnología / Librería | Versión | Rol en el Proyecto |
| :--- | :--- | :--- |
| **Node.js** | >= 20.x (v24.22.0) | Entorno de ejecución JavaScript para desarrollo y compilación |
| **React** | 19.3.1 | Biblioteca base de interfaz de usuario |
| **React DOM** | 19.3.1 | Renderizador de React para el navegador web |
| **TypeScript** | 5.8.x / 6.0.x | Tipado estático estricto para modelos de dominio y componentes |
| **Vite** | 8.3.4 | Entorno de desarrollo ultrarrápido y bundler de producción |
| **Tailwind CSS** | 4.3.3 | Motor de diseño con `@tailwindcss/vite` |
| **React Router DOM** | 7.18.4 | Enrutamiento del lado del cliente (SPA) con histórico |
| **Framer Motion** | 14.4.0 | Animaciones de modales, transiciones de tarjetas y toasts |
| **Recharts** | 3.10.1 | Visualización de datos interactiva (áreas y barras) |
| **Lucide React** | 1.60.0 | Iconografía corporativa e industrial de alta coherencia |

---

## 2. Estructura de Directorios del Código Fuente

Toda la aplicación reside en el directorio `/frontend`. La estructura sigue los lineamientos de **Clean Architecture** y modularidad funcional:

```
frontend/
├── index.html                   # HTML base con fuentes Inter y JetBrains Mono
├── package.json                 # Definición de dependencias y scripts npm
├── tsconfig.json                # Configuración raíz de TypeScript
├── tsconfig.app.json            # Reglas de tipado de la aplicación
├── tsconfig.node.json           # Configuración TS para Vite
├── vite.config.ts               # Plugin React, Tailwind v4 y límites de chunks
└── src/
    ├── main.tsx                 # Montaje de React DOM en el nodo '#root'
    ├── App.tsx                  # Enrutador central y Providers de Contexto
    ├── index.css                # Directivas Tailwind v4 y scrollbars industriales
    ├── constants/
    │   └── index.ts             # Constantes maestras (Líneas, Almacenes, Colores SAP)
    ├── types/
    │   └── index.ts             # Definición de tipos e interfaces de dominio
    ├── mock/
    │   └── data.ts              # Dataset de 25+ registros realistas automotrices
    ├── context/
    │   ├── ScrapContext.tsx     # Estado global reactivo con persistencia LocalStorage
    │   └── ThemeContext.tsx     # Contexto de modo Claro / Oscuro con clase en <html>
    ├── services/
    │   └── scrapService.ts      # Servicios mock asíncronos y simulador BAPI SAP 551
    ├── utils/
    │   └── formatters.ts        # Funciones de moneda, fechas, exportador CSV y PDF
    ├── components/
    │   └── common/
    │       ├── Badge.tsx        # Indicadores de estado de material y severidad
    │       ├── Button.tsx       # Botones con variantes industriales y estados de carga
    │       ├── Card.tsx         # Contenedor corporativo con header, subtitle y slot
    │       ├── Modal.tsx        # Diálogo modal accesible con backdrop y escape key
    │       ├── Pagination.tsx   # Controles de paginación con selector de tamaño
    │       ├── StatCard.tsx     # Tarjetas KPI tipo Power BI con variación y sparklines
    │       └── ToastContainer.tsx # Notificaciones emergentes automáticas temporizadas
    ├── layouts/
    │   ├── MainLayout.tsx       # Contenedor responsivo con Sidebar y TopHeader
    │   ├── Sidebar.tsx          # Menú de navegación colapsable con badges dinámicos
    │   └── TopHeader.tsx        # Barra superior (Planta, Turno, Notificaciones, Perfil)
    └── pages/
        ├── DashboardPage.tsx    # Tablero ejecutivo de scrap en tiempo real
        ├── MovimientosPage.tsx  # Registro y auditoría general de movimientos
        ├── MovimientoDetallePage.tsx # Ficha 360°, marbete físico y timeline de hitos
        ├── AprobacionesPage.tsx # Mesa de aprobación técnica de scrap por supervisor
        ├── MotivosPage.tsx      # Catálogo CRUD interactivo de causas y defectos
        ├── FallasPorLineaPage.tsx # Piezas Scrap agrupadas por línea
        ├── ReportesPage.tsx     # Inteligencia de datos, filtros avanzados y exportador
        └── ConfiguracionPage.tsx# Ajustes de planta, turnos, umbrales y reset de datos
```

---

## 3. Modelo de Datos y Tipos TypeScript (`src/types/index.ts`)

### 3.1 Tipos Primitivos y Enums

```typescript
export type EstatusMovimiento = 
  | 'Pendiente' 
  | 'Aprobado' 
  | 'Rechazado' 
  | 'En Cuarentena' 
  | 'Retrabajo';

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
```

### 3.2 Entidad `Movimiento` (Núcleo de Datos de Scrap)
Representa una transacción de material no conforme generada en el sistema MES:

```typescript
export interface Movimiento {
  id: string;                    // Folio único ej. "SC-2026-0841"
  matnr: string;                 // Número de material SAP ej. "MAT-849201"
  descripcion: string;           // Descripción técnica ej. "Fender Delantero Izq"
  fecha: string;                 // Formato ISO YYYY-MM-DD
  hora: string;                  // Formato HH:mm
  credencial: string;            // Identificador de empleado ej. "EMP-3041"
  empleado: string;              // Nombre del operador o capturista
  movimientoTipo: CategoriaMotivo; // Clasificación del movimiento
  motivoEspecifico: string;      // Causa raíz del defecto
  cantidad: number;              // Número de piezas afectadas
  unidad: string;                // Unidad de medida estándar (PZA)
  almacenSalida: string;         // Origen ej. "ALM-02 (WIP)"
  almacenRetorno: string;        // Destino ej. "ALM-99 (Scrap Yard)"
  linea: string;                 // Línea de producción ej. "L-01 Estampado"
  almacen: string;               // Código de almacén SAP
  estatus: EstatusMovimiento;    // Estado en el workflow
  turno: Turno;                  // Turno operativo en que se generó
  costoUnitario: number;         // Costo en USD por pieza
  costoTotal: number;            // Costo acumulado (cantidad * costoUnitario)
  ordenProduccion?: string;      // Número de Orden de Producción SAP (OP)
  lote?: string;                 // Lote de material recibido o procesado
  observaciones?: string;        // Notas técnicas levantadas en piso
  aprobadoPor?: string;          // Nombre del supervisor que auditó
  fechaAprobacion?: string;      // Timestamp de la firma
  comentariosAprobacion?: string;// Observaciones emitidas en la aprobación/rechazo
  historial: HitoHistorial[];     // Trazabilidad inmutable de eventos
}
```

### 3.3 Entidad `HitoHistorial` (Trazabilidad IATF 16949)
```typescript
export interface HitoHistorial {
  id: string;
  titulo: string;
  descripcion: string;
  fechaHora: string;
  usuario: string;
  rol: string;
  estado: 'completado' | 'actual' | 'pendiente' | 'rechazado';
}
```

### 3.4 Entidad `Motivo` (Catálogo de Defectos)
```typescript
export interface Motivo {
  id: string;
  codigo: string;                // Código estandarizado ej. "SCRAP-EST-01"
  nombre: string;                // Nombre del defecto
  categoria: CategoriaMotivo;    // Tipo de movimiento asociado
  descripcion: string;           // Criterio de inspección y tolerancias
  severidad: SeveridadMotivo;    // Clasificación de criticidad
  activo: boolean;               // Habilitado para captura en piso
  costoDefectoPromedio?: number; // Costo financiero referencial
}
```

---

## 4. Arquitectura del Estado Global

El sistema utiliza la Context API de React desacoplada en dos proveedores:

### 4.1 `ThemeContext` (`src/context/ThemeContext.tsx`)
- **Estado:** `'light' | 'dark'`.
- **Comportamiento:**
  - Al iniciar, consulta la clave `localStorage.getItem('scrap_mes_theme')`. Si no existe, lee la preferencia del sistema operativo mediante `window.matchMedia('(prefers-color-scheme: dark)')`.
  - Agrega o remueve la clase `.dark` del elemento raíz `document.documentElement` para que las utilidades `dark:` de Tailwind CSS respondan de inmediato.
  - Ofrece las funciones `toggleTheme()` y `setTheme(theme)`.

### 4.2 `ScrapContext` (`src/context/ScrapContext.tsx`)
Gestiona toda la lógica reactiva de negocio de la aplicación con persistencia local en `localStorage`:

#### Claves de Almacenamiento:
- `scrap_mes_movimientos_v1`: Arreglo serializado de `Movimiento[]`.
- `scrap_mes_motivos_v1`: Arreglo serializado de `Motivo[]`.
- `scrap_mes_notificaciones_v1`: Arreglo serializado de `Notificacion[]`.
- `scrap_mes_turno_v1`: Identificador del `Turno` en curso.

#### Métodos Expuestos:
1. `aprobarMovimiento(id: string, comentarios?: string)`:
   - Localiza el movimiento por su ID.
   - Modifica `estatus` a `'Aprobado'`.
   - Establece `aprobadoPor = 'Ing. Carlos Mendoza'`, fecha y hora actuales, y los comentarios de auditoría.
   - Agrega un nuevo evento de tipo `completado` al arreglo `historial`.
   - Lanza una notificación toast flotante de tipo `success`.
2. `rechazarMovimiento(id: string, comentarios?: string)`:
   - Modifica `estatus` a `'Rechazado'`.
   - Agrega un hito de rechazo en el timeline y emite toast de advertencia.
3. `crearMovimiento(datos: Partial<Movimiento>)`:
   - Asigna folio incremental `SC-2026-XXXX`.
   - Calcula `costoTotal` = `costoUnitario * cantidad`.
   - Inicializa el historial con el registro de alta y el hito de pendiente de validación.
   - Inserta el movimiento al principio del arreglo para reactividad inmediata.
4. `crearMotivo`, `actualizarMotivo`, `eliminarMotivo`:
   - Operaciones CRUD completas para el catálogo maestro de causas.
5. `setTurnoActivo(turno: Turno)`:
   - Cambia el turno de operación de la planta y emite notificación informativa.
6. `resetearDatosMock()`:
   - Elimina las claves de `localStorage` y restaura los arreglos originales de `src/mock/data.ts`.

#### Cálculo Reactivo de KPIs (`resumenKPIs`):
Mediante un hook `useMemo`, cada alteración en los movimientos recalcula instantáneamente:
- `scrapHoyPzas`: Suma de piezas de movimientos tipo `Scrap` generados en la fecha actual (`2026-10-20`).
- `scrapHoyCosto`: Suma de importes en USD de las piezas enviadas a scrap hoy.
- `pendientesAprobar`: Conteo total de movimientos con estatus `'Pendiente'`.
- `aprobadosHoy` y `rechazadosHoy`: Conteo de resoluciones del turno.
- `tasaScrapGeneral`: Indicador porcentual de pérdidas de manufactura vs volumen programado.

---

## 5. Enrutamiento y Navegación (`src/App.tsx`)

La navegación está gobernada por `react-router-dom` con la siguiente topología de rutas anidadas dentro de `MainLayout`:

```
/
├── /dashboard           -> DashboardPage (Tablero general y KPIs)
├── /movimientos         -> MovimientosPage (Auditoría y tabla general)
├── /movimientos/:id     -> MovimientoDetallePage (Detalle 360° y marbete)
├── /aprobaciones        -> AprobacionesPage (Bandeja de supervisor)
├── /motivos             -> MotivosPage (Catálogo CRUD)
├── /fallas-por-linea    -> FallasPorLineaPage (Resumen Scrap por línea)
├── /reportes            -> ReportesPage (Análisis y exportación)
└── /configuracion       -> ConfiguracionPage (Parámetros y reset)
```
Cualquier ruta inválida o la raíz `/` redirige automáticamente a `/dashboard`.

---

## 6. Arquitectura de Componentes Reutilizables

### 6.1 `Badge.tsx` (`src/components/common/Badge.tsx`)
- Renderiza píldoras visuales con punto indicador según el estado del movimiento (`Pendiente` en ámbar, `Aprobado` en esmeralda, `Rechazado` en carmesí, `En Cuarentena` en púrpura, `Retrabajo` en azul).
- Si recibe la propiedad `severidad`, aplica el estilo de criticidad (`Crítica`, `Alta`, `Media`, `Baja`).

### 6.2 `Button.tsx` (`src/components/common/Button.tsx`)
- Soporta variantes: `primary` (azul corporativo Fiori), `success` (esmeralda), `danger` (rojo industrial), `secondary` (pizarra oscuro), `outline` y `ghost`.
- Incluye soporte nativo para icono a la izquierda o derecha, estados de carga (`loading`) con spinner animado y supresión de clics en modo inactivo (`disabled`).

### 6.3 `Card.tsx` (`src/components/common/Card.tsx`)
- Encapsula contenedores de información con cabecera opcional, título en mayúsculas estilo MES, subtítulo descriptivo, slot lateral de acciones y soporte para modo sin padding para tablas de ancho completo.

### 6.4 `StatCard.tsx` (`src/components/common/StatCard.tsx`)
- Tarjeta de métrica ejecutiva inspirada en Power BI con microinteracciones al pasar el cursor (`hover: -2px y`), borde izquierdo de acento cromático, tipografía monoespaciada de gran tamaño, icono decorativo con fondo tintado e indicador de variación porcentual (`↑` o `↓`).

### 6.5 `Modal.tsx` (`src/components/common/Modal.tsx`)
- Diálogo accesible montado sobre backdrop con desenfoque de fondo (`backdrop-blur-xs`).
- Soporta tamaños desde `sm` hasta `4xl`.
- Escucha global del evento de teclado `Escape` para cierre inmediato.
- Animación de entrada y salida fluida (`scale: 0.95 -> 1.0`, `opacity: 0 -> 1`) mediante `AnimatePresence` de Framer Motion.

### 6.6 `Pagination.tsx` (`src/components/common/Pagination.tsx`)
- Muestra el rango de registros visibles respecto al total.
- Selector dinámico de elementos por página (10, 25 o 50).
- Botones anterior/siguiente con bloqueo por límites de página.

### 6.7 `ToastContainer.tsx` (`src/components/common/ToastContainer.tsx`)
- Posicionado en la esquina inferior derecha (`fixed bottom-5 right-5`).
- Apila notificaciones de confirmación, advertencia, peligro e información generadas desde cualquier componente mediante `agregarToast()`.
- Se cierran automáticamente tras 4.5 segundos o manualmente mediante el botón de cierre.

---

## 7. Módulos y Pantallas Principales

### 7.1 Dashboard (`DashboardPage.tsx`)
- **Visualización de KPIs:** 4 `StatCard` principales sincronizadas con el turno activo.
- **Gráfica de Tendencia Horaria:** Implementada con `AreaChart` de Recharts, con gradiente SVG carmesí y tooltip oscuro de alto contraste.
- **Razones principales de Scrap:** gráfica de barras horizontales (`BarChart`) que compara las cinco razones con mayor cantidad; no se usan gráficas tipo pastel.
- **Gráfica de Barras por Línea:** `BarChart` con código de colores según criticidad de piezas descartadas.
- **Modal de Registro Rápido:** Permite registrar un scrap manualmente sin salir del tablero.

### 7.2 Registro de Movimientos (`MovimientosPage.tsx`)
- Tabla completa de datos con las 12 columnas mandatorias: *ID, MATNR, Fecha, Credencial, Movimiento, Cantidad, Salida, Retorno, Empleado, Línea, Almacén, Estatus*.
- Búsqueda global reactiva sin debounce agresivo para respuesta inmediata.
- Filtros desplegables múltiples (Línea, Estatus, Tipo de Movimiento).
- Ordenamiento bidireccional por columna al hacer clic sobre la cabecera.

### 7.3 Mesa de Aprobaciones (`AprobacionesPage.tsx`)
- Presenta una tabla compacta con folio y fecha/hora de emisión, componente, razón, cantidad y acciones **Aprobar** y **Denegar** visibles.
- Filtra movimientos pendientes por certificación y permite buscar por fecha/hora de emisión de `dbo.Movimientos.fecha_hora`; admite fragmentos como `2025-05-14 08:30`.
- Al elegir una acción, abre una ficha de revisión con los datos disponibles del componente, movimiento, reporte, estado e historial. Cuando existe, también permite desplegar la fila original de SQL.
- La ficha solicita el nombre del responsable y requiere confirmar antes de guardar el dictamen. La API modifica solo filas pendientes y guarda `aprobado`, `nvAprobadoPor` y `dtAprobado`; el nombre capturado no es autenticación.

### 7.4 Catálogo de Motivos (`MotivosPage.tsx`)
- Vista en cuadrícula responsiva con tarjetas de defectos.
- Filtros por categoría de movimiento (*Scrap, Retrabajo, Calidad, etc.*) y nivel de severidad (*Crítica, Alta, Media, Baja*).
- Formulario modal para registrar o modificar motivos, incluyendo códigos de defecto, descripciones y costo económico promedio.
- Conmutador visual para habilitar o inhabilitar motivos en tiempo real.

### 7.5 Fallas por línea (`FallasPorLineaPage.tsx`)
- Resume movimientos con `MovimientoTipoId = 1` (Scrap), sumando `cantidad` y agrupando por `Certificacion.LineaId`.
- El backend resuelve la relación en SQL Server: `Movimientos.CertificacionId` → `Certificacion.id` → `Certificacion.LineaId`. Filtra el periodo del 2025 y devuelve el total de piezas y movimientos por línea.
- La pantalla presenta KPIs, una gráfica de barras, una tabla y un buscador. Las líneas se identifican por el valor real de `LineaId`; no se sustituyen por nombres o etiquetas locales no verificadas.

### 7.6 Reportes e Inteligencia Operacional (`ReportesPage.tsx`)
- Filtros por rango de fechas (`fechaInicio` y `fechaFin`), línea de ensamblado, turno y motivo específico.
- KPIs consolidados: *Piezas Totales Afectadas, Costo Total en USD, Piezas Scrap Definitivo y Piezas Recuperadas/Retrabajo*.
- Gráfica de barras de costo imputado por línea de producción.
- Tabla consolidada con agrupación automática por Número de Parte (MATNR), indicando cantidad de boletas, volumen de piezas, costo acumulado y porcentaje de contribución al total de scrap.
- Botones de exportación:
  - `descargarCSV()`: Genera un archivo `.csv` con cabecera estándar y codificación UTF-8 con BOM para apertura transparente en Microsoft Excel.
  - `simularImpresionPDF()`: Configura el título del documento y ejecuta `window.print()` con estilos optimizados para impresión formal.

### 7.6 Ficha Técnica y Detalle de Movimiento (`MovimientoDetallePage.tsx`)
- Acceso mediante ruta dinámica `/movimientos/:id`.
- Desglose técnico de la pieza, orden de producción (OP), lote de bobina o materia prima y almacenes logísticos.
- **Marbete de Scrap:** Simulación de la etiqueta viajera industrial adherida a contenedores metálicos (racks KLT), con código de barras en barras verticales SVG y espacio para firma de auditoría.
- **Timeline de Trazabilidad:** Línea de tiempo vertical con nodos de estado que traza todo el ciclo de vida del material (registro en terminal MES, inspección visual, decisión de calidad y ajuste contable en SAP BAPI 551).

### 7.7 Configuración de Planta (`ConfiguracionPage.tsx`)
- Ajuste del nombre de la planta, división de manufactura y código SAP (Werks `1020`).
- Estado de conexión simulada con el conector RFC de SAP S/4HANA (`BAPI_GOODSMVT_CREATE`).
- Selección de turnos de planta (Turno 1: 06:00 - 14:30, Turno 2: 14:30 - 22:30, Turno 3: 22:30 - 06:00).
- Configuración del umbral de scrap admisible (%) y preferencia de tema.
- Catálogo de almacenes industriales autorizados (`ALM-01`, `ALM-02`, `ALM-05`, `ALM-12`, `ALM-99`).
- Botón **Reiniciar Datos Mock** para restaurar los valores iniciales.

---

## 8. Servicios y Utilidades

### 8.1 Simulación SAP ERP (`src/services/scrapService.ts`)
Encapsula la promesa de sincronización con el sistema ERP mediante la función:
```typescript
sincronizarConSapErp(folio: string): Promise<{ exitoso: boolean; mensajeSap: string; sapDocNum: string }>
```
Devuelve una confirmación con número de documento contable simulado (`DOC-SAP-551-XXXXXX`) correspondiente al movimiento de material 551 de SAP (Scrap / Baja por Desperdicio).

### 8.2 Generador de Archivos CSV (`src/utils/formatters.ts`)
La función `descargarCSV` construye una cadena con formato RFC 4180, anteponiendo el byte order mark `\uFEFF` para asegurar que tildes, caracteres especiales y números de serie se interpreten correctamente en Excel sin corrupción de caracteres. Utiliza un objeto `Blob` y un enlace virtual temporal `<a>` para disparar la descarga en el navegador sin intervención de backend.

---

## 9. Guía de Ejecución y Mantenimiento

### 9.1 Requisitos Previos
- Node.js versión 20 o superior instalada.
- npm versión 9 o superior.

### 9.2 Instalación y Puesta en Marcha
1. Acceder al directorio del frontend:
   ```bash
   cd frontend
   ```
2. Instalar dependencias (en caso de clonación limpia):
   ```bash
   npm install
   ```
3. Iniciar el servidor de desarrollo local:
   ```bash
   npm run dev
   ```
   El sistema quedará disponible en `http://localhost:5173/`.

### 9.3 Compilación para Producción
Para verificar la ausencia de errores de tipos y compilar los archivos optimizados para despliegue:
```bash
npm run build
```
Los archivos optimizados y minificados se generan en la carpeta `/frontend/dist`.

### 9.4 Previsualización de la Versión Compilada
```bash
npm run preview
```

---

## 10. Integración actual con SQL Server

El frontend consulta `GET /api/movimientos`; por defecto, el backend filtra desde SQL Server únicamente las filas de 2025 mediante `fecha_hora` (`>= 2025-01-01` y `< 2026-01-01`), sin cargar otros años. La API admite `fechaInicio` (incluyente) y `fechaFin` (excluyente), en formato `YYYY-MM-DD`, para consultas técnicas con otro rango; las vistas actuales no mandan esos parámetros. El tablero muestra de forma fija el año 2025. La respuesta conserva las columnas originales de la tabla. La interfaz presenta los campos indicados como utilizables en `Base de datos Estructura/Estructura.txt`; los campos marcados como ignorados o pendientes no se utilizan todavía.

La bandeja presenta solicitudes en una tabla compacta y permite buscar por una parte de la fecha/hora original (`fecha_hora`), además de filtrar por certificación. Al seleccionar **Aprobar** o **Denegar**, abre una ficha con la información disponible del componente antes de solicitar confirmación. La ficha presenta campos del modelo de UI y, si el API proporcionó la fila original, permite desplegar sus columnas de SQL. La acción envía `PATCH /api/movimientos/:id/dictamen`; la API exige una decisión válida y el nombre del responsable, modifica solo filas con `aprobado = 0`, guarda la decisión en `aprobado`, el nombre en `nvAprobadoPor` y la hora del servidor SQL en `dtAprobado`. Las altas de movimientos, catálogos en vivo y la integración con SAP siguen pendientes.

El nombre del responsable es ingresado manualmente y no autentica al empleado. La API no tiene autenticación/autorización de usuario implementada; antes de exponer esta acción fuera de un entorno controlado, integrar identidad y restringir el acceso de red y de base de datos. Los dictámenes se guardan en datos reales y no se revierten por la interfaz.
