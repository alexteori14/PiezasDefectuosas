# Memoria del Proyecto: Sistema MES SCRAP Dashboard Industrial

## Resumen Ejecutivo

El proyecto **SCRAP Dashboard** es una solución frontend corporativa de grado industrial diseñada específicamente para plantas de manufactura automotriz (inspirada en la división de carrocerías, estampado y ensamble de **Magna International** y en lineamientos de diseño **SAP Fiori**, **Microsoft Fluent UI** y **Power BI**). 

Su propósito central es dotar a la planta de una herramienta unificada, reactiva y visualmente moderna para el **control, consulta, aprobación, trazabilidad y seguimiento de movimientos de materiales no conformes (Scrap)**, eliminando las fricciones del papeleo físico tradicional y la rigidez de las terminales ERP tradicionales.

El desarrollo se ejecutó bajo una premisa mandatoria de arquitectura: **cero dependencias de backend, bases de datos o APIs externas**, operando con un motor reactivo de datos mock enriquecidos con persistencia local (`localStorage`) que replica fielmente el comportamiento de un entorno integrado con **SAP S/4HANA (BAPI_GOODSMVT_CREATE movimiento 551)** y sistemas **MES (Manufacturing Execution System)** de piso de planta.

---

## 1. Contexto de Negocio y Dominio Automotriz

### 1.1 El Reto del Scrap en la Industria Automotriz
En la manufactura de componentes de carrocería (fenders, cofre, paneles de puerta, pilares de alta resistencia y fascias plásticas), el control de desperdicio o *Scrap* es un indicador crítico de desempeño operacional:
- **Cost of Poor Quality (COPQ):** Cada pieza enviada a chatarra representa una pérdida acumulada de materia prima (bobinas de acero, aluminio o resinas), energía, tiempo de ciclo de prensas y mano de obra.
- **Trazabilidad IATF 16949 / VDA 6.3:** Las normas de calidad automotriz exigen una trazabilidad milimétrica: quién reportó el defecto, en qué máquina/prensa, bajo qué orden de producción (OP), en qué turno y cuál fue la disposición técnica final (desecho, cuarentena o retrabajo).
- **El Cuello de Botella de las Aprobaciones:** Tradicionalmente, un operador separa una pieza defectuosa y llena un marbete físico de papel. El supervisor de calidad recorre las bahías, firma a mano y un capturista ingresa el movimiento a SAP horas después. Esto genera desfases de inventario en tiempo real (*WIP vs Almacén 99*) e imposibilita la toma de decisiones preventiva.

### 1.2 Objetivos Estratégicos del Sistema Frontend
1. **Visibilidad Ejecutiva Inmediata:** Proporcionar a gerencia y supervisión un tablero con KPIs en vivo (piezas descartadas, costo financiero acumulado, tasa de scrap vs meta de planta y cuellos de botella).
2. **Mesa Digital de Aprobaciones:** Permitir al supervisor autorizar o rechazar solicitudes de scrap con un solo clic, adjuntando justificaciones técnicas y firmas digitales simuladas.
3. **Ficha de Trazabilidad 360°:** Visualizar la historia completa de cada pieza desde su fabricación en prensa hasta su disposición contable, con generación de marbete viajero industrial.
4. **Resiliencia Operativa y Usabilidad:** Alta densidad de datos, visualización clara bajo condiciones de luz de taller y soporte completo para modo claro (SAP Fiori Standard) y modo oscuro (Industrial High Contrast).

---

## 2. Principios y Metodologías Aplicadas

Para asegurar que el proyecto no cayera en sobreingeniería ni en código incompleto, se articularon las metodologías especificadas en los requerimientos:

```mermaid
flowchart TD
    PO["Product Owner & Arquitecto"] --> Multiagente["Multiagente: Especialización de Roles"]
    Multiagente --> Ponytail["Ponytail: Reducción de Complejidad (KISS)"]
    Multiagente --> Graphify["Graphify: Grafo de Conocimiento y Entidades"]
    Multiagente --> AgentSkills["Agent Skills: Mejores Prácticas UI/UX"]
    
    Ponytail --> CleanArch["Clean Architecture en Frontend"]
    Graphify --> DomainModel["Modelo de Dominio Tipado (TypeScript)"]
    AgentSkills --> IndustrialUI["Diseño Fiori / MES / Power BI"]
    
    CleanArch --> FrontendResult["SCRAP MES Frontend Production-Ready"]
    DomainModel --> FrontendResult
    IndustrialUI --> FrontendResult
```

### 2.1 Multiagente (Especialización Funcional)
Se abordó el proyecto adoptando mentalmente múltiples roles coordinados:
- **Product Owner:** Delimitó el valor de negocio de los 6 módulos clave (Dashboard, Movimientos, Aprobaciones, Motivos, Reportes, Detalle) y la integración con flujos de turno.
- **Arquitecto de Software:** Estableció la separación en capas (`types`, `mock`, `context`, `services`, `components`, `layouts`, `pages`, `utils`), garantizando desacoplamiento y escalabilidad.
- **Tech Lead Frontend:** Diseñó el tipado exhaustivo en TypeScript, optimizó el pipeline de Vite con Tailwind CSS v4, gestionó la persistencia en `localStorage` y garantizó la compilación con cero advertencias.
- **Senior UX Designer:** Diseñó una paleta inspirada en instrumentación automotriz y suites corporativas, jerarquías visuales limpias, microinteracciones y retroalimentación inmediata (toasts, modales).

### 2.2 Ponytail (Eliminación de Sobreingeniería y KISS)
- **Sin complejidad de Redux/Thunk innecesaria:** Se utilizó la API nativa de Context de React potenciada con `useMemo` y sincronización con `localStorage`. Esto provee reactividad instantánea global con menos líneas de código, fácil depuración y cero overhead.
- **Sin backend simulado pesado:** En lugar de levantar servidores MSW complejos con service workers propensos a fallos de configuración de red, se construyó una capa de servicios funcional directa respaldada por almacenamiento local tipado.

### 2.3 Graphify (Grafo de Entidades y Contexto de Planta)
Se estructuró el ecosistema de datos modelando las relaciones reales de manufactura:
- Una **Línea de Producción** (ej. *L-01 Estampado Pesado*) pertenece a un área fabril y tiene un supervisor y una meta máxima admisible de scrap.
- Un **Movimiento** se origina en una estación, consume un número de material SAP (**MATNR**), pertenece a una **Orden de Producción (OP)** y a un **Lote**, ocurre en un **Turno** específico y es reportado por un **Empleado** con su número de credencial.
- Cada movimiento está clasificado por una **Categoría de Movimiento** (*Scrap, Retrabajo, Calidad, Cuarentena, etc.*) y un **Motivo Específico**, transiciona entre **Almacenes** (*ALM-02 WIP -> ALM-99 Scrap Yard*) y genera un **Historial Cronológico de Hitos**.

---

## 3. Proceso de Desarrollo Paso a Paso

El desarrollo se ejecutó de manera lineal y rigurosa en 7 fases consecutivas:

```
[Fase 1: Análisis de Especificaciones]
                     │
                     ▼
[Fase 2: Arquitectura y Wireframing Textual] (Artefacto Oficial)
                     │
                     ▼
[Fase 3: Inicialización de Toolchain Vite + Tailwind CSS v4]
                     │
                     ▼
[Fase 4: Tipado de Dominio y Generación de Dataset Mock]
                     │
                     ▼
[Fase 5: Estado Global Reactivo y Capa de Servicios]
                     │
                     ▼
[Fase 6: Componentes Atómicos, Layouts y Páginas]
                     │
                     ▼
[Fase 7: Verificación de Build, Optimizaciones y Cierre]
```

### Fase 1: Análisis y Delimitación de Reglas
Se identificó la restricción crítica: *NO backend, NO APIs, NO base de datos, 100% datos mock*. Se definió que la reactividad debía permitir que cualquier acción del usuario (aprobar un movimiento, rechazarlo, crear un nuevo motivo o registrar scrap) impactara en tiempo real los contadores del Header, los badges del Sidebar, las gráficas del Dashboard y las tablas de Reportes.

### Fase 2: Documento de Arquitectura y Wireframes
Antes de generar código funcional, se emitió el documento formal de arquitectura y diseño UX en el artefacto `architecture-and-ux-design.md`, estableciendo el árbol de rutas, diagramas de flujo mermaid y bocetos en texto para cada una de las pantallas.

### Fase 3: Toolchain y Configuración Visual
- Se inicializó el proyecto con `vite@latest` usando la plantilla `react-ts`.
- Se configuró el nuevo motor `@tailwindcss/vite` (Tailwind CSS v4) junto con fuentes optimizadas (`Inter` y `JetBrains Mono`).
- Se instalaron las dependencias requeridas: `framer-motion`, `recharts`, `lucide-react`, `react-router-dom`, `clsx` y `tailwind-merge`.

### Fase 4: Tipado Estricto y Dataset Maestro
Se crearon las interfaces en `src/types/index.ts` y se modeló el dataset en `src/mock/data.ts` con más de 25 movimientos realistas de componentes automotrices (fenders, bumpers, refuerzos de pilar B en acero al boro, paneles de puerta, pisos de carrocería y ensambles de cofre), involucrando turnos matutino, vespertino y nocturno, y los 7 centros de manufactura de la planta.

### Fase 5: Capa de Estado Reactivo (`ScrapContext` y `ThemeContext`)
- Se implementó `ThemeContext` con persistencia en `localStorage` y manipulación de la clase `.dark` en el elemento raíz HTML.
- Se implementó `ScrapContext` con métodos para:
  - `aprobarMovimiento(id, comentarios)`: actualiza estatus, genera hito en el timeline y emite notificación toast.
  - `rechazarMovimiento(id, comentarios)`: rechaza la solicitud y redirige a retrabajo.
  - `crearMovimiento(datos)`: registra nuevo folio con ID único `SC-2026-XXXX`.
  - `crearMotivo`, `actualizarMotivo`, `eliminarMotivo`: CRUD interactivo del catálogo.
  - Cálculo dinámico de `resumenKPIs` (conteo de scrap de hoy, costo financiero, folios pendientes).
  - `resetearDatosMock()`: permite volver al estado de fábrica para demostraciones.

### Fase 6: Desarrollo Modular de Vistas y Layouts
- **Shell de la Aplicación:** Sidebar lateral colapsable con indicadores numéricos en vivo y TopHeader con selección de planta, relevo de turno, menú de notificaciones con conteo de no leídas y alternador de tema.
- **Dashboard:** Tarjetas KPI interactivas, gráfica de tendencia horaria en área y diagrama de Pareto de causas principales.
- **Movimientos:** Tabla corporativa de alta densidad con paginación configurable, ordenamiento multicriterio y exportación CSV.
- **Aprobaciones:** Mesa de decisión inspirada en la terminal de planta provista en la especificación, con modales de aprobación y rechazo individual o masivo.
- **Catálogo de Motivos:** Interfaz de tarjetas con chips de severidad (*Crítica, Alta, Media, Baja*), conmutadores de estado y modal de edición.
- **Reportes:** Módulo de inteligencia operacional con filtros por fecha/turno/línea, desglose por número de parte (MATNR) y generador de reportes imprimibles en PDF.
- **Detalle de Movimiento:** Ficha 360° con marbete físico simulado, código de barras y timeline visual de hitos IATF 16949.
- **Configuración:** Parámetros de planta, configuración de almacenes y conector simulado RFC SAP.

### Fase 7: Validación, Tipado y Optimización de Build
Se corrigió la configuración de TypeScript en `tsconfig.app.json` para alinear las directivas de importación, eliminando variables no utilizadas y verificando que el comando `npm run build` produjera los artefactos listos para producción en menos de 500 ms con cero advertencias.

---

## 4. Cómo Funciona el Sistema: Recorridos de Usuario

### Escenario A: Operador en Piso de Prensa reporta Scrap
1. En el Dashboard o en la pantalla de Movimientos, el operador o capturista presiona **"Registrar Incidencia"**.
2. Ingresa el número de parte SAP (`MAT-849201`), cantidad, línea de origen y motivo de falla.
3. El sistema genera de inmediato el folio `SC-2026-XXXX` con estado `Pendiente`, asignando el costo financiero unitario y total.
4. El contador de la campana de notificaciones y el badge numérico de **Aprobaciones** en el Sidebar se incrementan automáticamente.

### Escenario B: Supervisor de Calidad en Mesa de Aprobaciones
1. El supervisor ingresa a `/aprobaciones` y observa las solicitudes pendientes filtradas por su turno activo.
2. Hace clic en **"Aprobar"** en una pieza con defecto severo:
   - Se abre el modal de confirmación indicando el impacto contable en dólares.
   - Escribe observaciones opcionales y presiona *Autorizar y Firmar Digitalmente*.
   - El sistema cambia el estado a `Aprobado`, añade el hito firmado al timeline histórico, actualiza los KPIs del Dashboard y emite un toast de éxito.
3. Si la pieza es recuperable, presiona **"Rechazar"**:
   - El modal exige la justificación técnica.
   - El material se canaliza fuera del flujo de scrap hacia el almacén de retrabajo `ALM-12`.

### Escenario C: Gerente de Operaciones analiza Tendencias y Auditoría
1. Desde `/dashboard`, el gerente revisa la gráfica de tendencia horaria para detectar picos por encima de la tolerancia de 10 piezas/hora.
2. Identifica que la Línea 01 (Estampado) concentra la mayor incidencia debido a arrugas por cambio de bobina.
3. Se traslada a `/reportes`, filtra las fechas del mes y exporta el archivo `reporte-gerencial-scrap.csv` con un solo clic para cruzar datos en hojas de cálculo externas, o presiona **"Imprimir / Guardar PDF"** para obtener una boleta ejecutiva lista para juntas de planta.

---

## 5. Decisiones Técnicas y de Diseño Destacadas

| Decisión | Justificación Técnica | Beneficio Operativo |
| :--- | :--- | :--- |
| **Tailwind CSS v4** | Utilización del motor nativo `@tailwindcss/vite` de última generación | Tiempos de compilación inferiores a 500ms y cero configuración de PostCSS pesada. |
| **Context API + LocalStorage** | Regla de cero backend sin introducir la sobrecarga de Redux | Persistencia de datos entre recargas sin requerir un servidor Node.js o Docker. |
| **Recharts con gradientes SVG** | Gráficas reactivas y responsivas con tooltips estilizados | Visualización de datos idéntica a tableros de Power BI empresarial. |
| **Códigos SAP MATNR y BAPI 551** | Alineación terminológica con el estándar ERP de la industria automotriz | Familiaridad inmediata para operadores, supervisores y personal de ingeniería. |
| **Paleta Slate / Zinc / Cobalt** | Colores industriales de baja fatiga visual | Óptima legibilidad en pantallas táctiles y tablets en piso de manufactura. |

---

## 6. Conclusión y Estado del Entregable

El frontend ha quedado concluido de forma integral, cumpliendo al 100% los requerimientos de `Especificaciones.txt`. No existen componentes incompletos, mocks vacíos ni dependencias de backend pendientes. La solución se encuentra lista para ser presentada o conectarse en el futuro a una pasarela de microservicios o APIs REST de SAP S/4HANA.
