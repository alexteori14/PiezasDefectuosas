# Memoria del Proyecto: SCRAP Dashboard

## Resumen ejecutivo

SCRAP Dashboard es una aplicación web para consultar y visualizar movimientos de scrap. El backend se conecta a SQL Server y consulta la tabla `dbo.Movimientos` de la base configurada (actualmente `SOE`). La lista y el detalle son de lectura; la bandeja de aprobaciones actualiza el dictamen de una fila pendiente.

La integración real incluye lectura de movimientos de 2025 y dictamen (aprobación/rechazo) en la tabla principal. Las vistas de la aplicación cargan únicamente el año calendario 2025; el backend permite rangos explícitos para consultas técnicas, pero la interfaz no solicita otros años. No se deben describir como implementadas las altas de movimientos, catálogos en vivo, integración con SAP, cálculos de costos ni las funciones todavía basadas en datos locales/de demostración. La aplicación no reemplaza al ERP y no se ha declarado lista para producción.

## Antecedentes y decisiones

- Se revisó `memoria.md` y se contrastaron sus afirmaciones con el código. La documentación anterior describía funciones de aprobación, costos, trazabilidad y conexión relacional como terminadas, aunque varias eran mock o no estaban conectadas.
- El usuario solicitó centralizar la conexión en un archivo editable, guardar lo relacionado con base de datos en `BaseDeDatos/` y probar solamente la conectividad.
- Se verificó la conexión a `est04db` / `SOE` con autenticación integrada de Windows. La instancia y los permisos dependen del equipo y de la cuenta Windows que ejecuta Node.js.
- Se integró la lectura de `SOE.dbo.Movimientos` después de revisar las instrucciones y estructura proporcionadas en `Base de datos Estructura`.
- Las verificaciones previas de lectura no ejecutaron operaciones de escritura. La nueva función de dictamen sí está diseñada para modificar datos reales una vez que un usuario confirma la acción.

## Conexión y configuración de base de datos

La configuración del backend está centralizada en `backend/src/config/database.connection.ts`. El módulo carga las variables de `BaseDeDatos/.env`, crea y reutiliza el pool SQL y expone la comprobación del estado de conexión. La configuración observada usa `mssql` con `msnodesqlv8`, autenticación integrada de Windows y el controlador ODBC configurado. No copiar credenciales ni el contenido privado de `.env` a esta memoria.

Archivos relevantes:

- `BaseDeDatos/.env`: configuración privada local, ignorada por Git; no documentar ni publicar su contenido.
- `BaseDeDatos/.env.example`: plantilla versionable, sin credenciales privadas.
- `BaseDeDatos/ConexionBaseDatos.md`: instalación y configuración de la conexión.
- `BaseDeDatos/README.md`: información de la carpeta.
- `backend/src/config/database.connection.ts`: conexión, pool y prueba de conexión.
- `backend/src/config/database.ts`: configuración consumida por el backend.

Comandos raíz relevantes:

| Comando | Función |
|---|---|
| `npm run dev` | Ejecuta backend y frontend en desarrollo. |
| `npm run build` | Compila backend y frontend. |
| `npm run test:db` | Comprueba la conexión y la base activa sin modificar tablas. |

Para otro equipo también se requiere el controlador ODBC indicado por `DB_DRIVER`, `msnodesqlv8` correctamente instalado y permisos SQL para la cuenta Windows que ejecute Node.

## Lectura de `dbo.Movimientos`

`backend/src/repositories/movimientosRepository.ts` consulta las filas de `dbo.Movimientos` en la base configurada, conserva los campos originales, ordena por identificador y utiliza parámetros para la búsqueda por ID y para el dictamen. La consulta de lista/detalle es de lectura; el método de dictamen modifica únicamente la decisión de registros pendientes. Se exponen:

- `GET /api/movimientos`: lista por defecto solo los movimientos del año calendario 2025, filtrando `fecha_hora` en SQL Server. Acepta un rango explícito con `fechaInicio` (inclusiva) y `fechaFin` (exclusiva), formato `YYYY-MM-DD`, además de filtros como tipo, aprobación, razón y búsqueda.
- `GET /api/movimientos/:id`: consulta un movimiento por identificador.
- `GET /api/movimientos/kpis`: obtiene los indicadores disponibles desde el repositorio.
- `PATCH /api/movimientos/:id/dictamen`: guarda el dictamen de una fila pendiente.
- `GET /api/health`: informa el estado del backend y de la conexión.

El endpoint de dictamen acepta `aprobado = 1` (aprobación) o `aprobado = 2` (rechazo) y el nombre ingresado del responsable, con máximo 200 caracteres. Actualiza de forma condicional solo filas donde `aprobado = 0`, guardando el estado en `aprobado`, el nombre en `nvAprobadoPor` y la hora del servidor SQL con `GETDATE()` en `dtAprobado`. Si el registro no existe devuelve 404; si ya no está pendiente devuelve 409, sin sobreescribir el dictamen. El ID y los datos se envían como parámetros SQL. El nombre capturado no es una comprobación de identidad: la API no implementa autenticación/autorización, por lo que la acción debe mantenerse en un entorno controlado hasta integrar controles de identidad y acceso.

El rango por defecto es fijo: desde `2025-01-01` inclusive hasta `2026-01-01` exclusivo. El filtro se ejecuta en SQL Server, de modo que Node y el frontend no cargan primero el histórico completo ni movimientos de 2026. Se conservan parámetros opcionales `fechaInicio` y `fechaFin` para consultas técnicas explícitas, aunque las pantallas actuales no los envían.

El tipo de movimiento puede incluir un nombre calculado en la respuesta. Ese campo no es una columna adicional de la tabla original.

La tabla original tuvo 20 columnas verificadas en la respuesta:

`id`, `CertificacionId`, `MATNR`, `fecha_hora`, `credencial`, `MovimientoTipoId`, `cantidad`, `salida`, `retorno`, `EmpleadoId`, `Empleado`, `procesado`, `aprobado`, `RazonId`, `centro_costo`, `almacen`, `serial`, `MATNR_FG`, `nvAprobadoPor`, `dtAprobado`.

Los significados de negocio de IDs y banderas deben confirmarse con el diccionario de datos/ingenieros de la base. La presencia de una columna en la respuesta no implica que tenga catálogo, descripción o interpretación funcional integrada.

## Integración de frontend

- `frontend/src/services/scrapService.ts`: obtiene los movimientos desde la API y transforma los campos que consume la interfaz; conserva la fila original en `datosDB`.
- `frontend/src/context/ScrapContext.tsx`: carga los registros del año 2025 (rango predeterminado del API) y mantiene estado de carga/error y recarga. No presenta un fallback mock como si fueran movimientos SQL.
- `frontend/src/pages/MovimientosPage.tsx`: presenta la lista consultada y sus filtros, con estados de carga/error. La columna de razón muestra `RazonId` junto con la descripción si está disponible en el catálogo local `RAZONES_SSMS`; cuando el ID no está en ese catálogo, indica que no hay descripción disponible.
- `frontend/src/pages/MovimientoDetallePage.tsx`: presenta datos del movimiento y señala campos o acciones aún no integrados.
- `frontend/src/pages/DashboardPage.tsx`: muestra únicamente los movimientos de 2025, sin selector de periodos. Gráficas, KPIs, movimientos recientes y CSV se basan en los registros cargados por el contexto. Costos/OEE no deben interpretarse como datos reales de la tabla y el alta manual no persiste en SQL.
- `frontend/src/pages/AprobacionesPage.tsx`: presenta pendientes en una tabla compacta con fecha/hora de emisión, componente, razón, cantidad y acciones visibles. Filtra por certificación y permite buscar fragmentos de `fecha_hora`; aprobar o denegar abre una ficha de revisión con los datos disponibles del movimiento y la fila original de SQL cuando está disponible. La ficha solicita el nombre del responsable y confirma antes de enviar el dictamen.
- `frontend/src/pages/FallasPorLineaPage.tsx`: muestra piezas Scrap (`MovimientoTipoId = 1`) por `LineaId` mediante un endpoint agregado en SQL. La consulta relaciona `dbo.Movimientos.CertificacionId` con `dbo.Certificacion.id` y agrupa por `dbo.Certificacion.LineaId`, con filtro de 2025.
- `frontend/src/pages/ReportesPage.tsx`: filtra por fechas, certificación y `RazonId`; presenta cantidades y agrupaciones por certificación y `MATNR`, usando `MATNR_FG` cuando está disponible. No calcula costos, líneas de producción ni turnos, ya que esos datos no se encuentran disponibles como tales en la tabla conectada.
- Turno activo: se determina automáticamente a partir de la hora local del dispositivo y ya no puede seleccionarse manualmente. Turno 1: 06:00–14:00; turno 2: 14:00–22:00; turno 3: 22:00–06:00. La barra superior muestra el reloj local actualizado cada segundo y el turno se actualiza en los cambios de horario.
- `frontend/src/utils/formatters.ts`: exporta CSV con las columnas originales de SQL.
- `frontend/vite.config.ts`: configura el proxy `/api` hacia el backend local.

Los motivos se identifican por `RazonId`. La tabla de movimientos usa el catálogo local `RAZONES_SSMS` como referencia para mostrar descripciones conocidas, pero la carga en vivo de `dbo.EtiquetasCI` no está terminada; por ello, las descripciones locales deben validarse contra la base y no se deben tratar como sincronizadas. Los catálogos de certificaciones y tipos tampoco se consultan en vivo como tablas independientes.

## Reglas de alcance y pendientes

Por solicitud actual, las vistas cargan solamente movimientos de 2025. El endpoint principal filtra `fecha_hora >= 2025-01-01 AND fecha_hora < 2026-01-01` directamente en SQL Server. Aunque la API conserva la opción de rango explícito para uso técnico, las páginas actuales consumen el rango predeterminado. Se respetan las notas entregadas en `Base de datos Estructura` sobre campos que deben ignorarse o dejarse pendientes. La API y la exportación conservan las columnas originales, pero la interfaz solo utiliza para sus métricas los datos integrados y disponibles. Consultar la estructura original antes de activar o asignar semántica a campos pendientes.

Pendiente de implementación o validación con los ingenieros:

1. Confirmar con responsables de planta que la fecha actual del servidor SQL y los límites de calendario coinciden con la zona horaria operativa.
2. Alta de movimientos en SQL, aún no implementada.
3. Autenticación y autorización de usuarios para que el nombre capturado corresponda a una identidad verificada y se limite quién puede aprobar o rechazar.
4. Lectura en vivo de catálogos relacionados (`dbo.MovimientoTipo`, `dbo.EtiquetasCI`, `dbo.Certificaciones`) y definición validada de sus relaciones.
5. Integración con SAP, transmisión de movimientos y confirmación de estado de proceso.
6. Fuentes confiables para costos, metas, líneas, turnos, OEE y demás indicadores no demostrados por las columnas conectadas.
7. Validación de permisos, manejo de carga de años completos, paginación y rendimiento con los responsables de SQL Server.
8. Revisión funcional de cualquier dato mock que permanezca en módulos no conectados a la consulta de movimientos.
9. Confirmar que el reloj del equipo que ejecuta el frontend esté configurado en la zona horaria local de la planta; el cálculo de turno se basa en ese reloj, no en una hora del servidor.

No presentar como reales ni persistidos los datos de demostración que todavía aparezcan en módulos o catálogos locales.

## Verificaciones realizadas

En la máquina de desarrollo, el 23 de octubre de 2026:

- `npm run test:db` había confirmado la conexión integrada de Windows a `SOE`.
- `/api/health` reportó backend en línea y conexión a la base activa.
- Antes de fijar el periodo, `GET /api/movimientos` devolvió 57,349 filas históricas; esa cifra corresponde a la validación anterior y ya no describe el rango predeterminado.
- Se verificó la presencia de las 20 columnas originales y un campo calculado adicional en la respuesta API.
- El filtro `tipoId=1` devolvió 18,614 filas en la prueba.
- Se verificó la consulta de detalle por ID.
- `npm run build` completó con éxito para backend y frontend tras adaptar Reportes.
- El lint dirigido a `ReportesPage.tsx` y `AprobacionesPage.tsx` completó sin advertencias.
- Para la API de dictamen se probaron solicitudes inválidas (ID, decisión o nombre incorrectos); respondieron HTTP 400 antes de ejecutar SQL. No se envió ninguna solicitud de aprobación/rechazo válida ni se modificaron filas reales.
- Con el filtro predeterminado de 2025 activo, `GET /api/movimientos` devolvió 35,068 filas; se comprobó que ninguna fila queda fuera del rango 2025-01-01 inclusive a 2026-01-01 exclusivo.
- `npm run build`, el lint dirigido de `DashboardPage.tsx` y `scrapService.ts`, y `git diff --check` pasaron después de fijar todas las vistas al año 2025.
- La compilación final (`npm run build`), el lint dirigido de `AprobacionesPage.tsx` y `scrapService.ts`, y `git diff --check` finalizaron correctamente; Git mostró avisos de conversión de finales de línea LF/CRLF.
- El backend de validación iniciado en segundo plano se detuvo al terminar las pruebas.
- La tabla de aprobaciones se simplificó para mostrar directamente sus acciones. La búsqueda de fecha/hora usa el campo `fechaHora` adaptado desde `dbo.Movimientos.fecha_hora`; las acciones abren la ficha completa antes de guardar. Se verificaron la compilación, el lint dirigido y `git diff --check`; no se confirmó ningún dictamen ni se modificaron filas reales en este cambio de interfaz.
- La pantalla se renombró a **Fallas por línea** y usa la relación existente `dbo.Movimientos.CertificacionId` → `dbo.Certificacion.id` → `dbo.Certificacion.LineaId`. Se comprobó la estructura real en SQL Server y una consulta agregada de solo lectura para 2025; la base mostró múltiples `LineaId` y conteos de Scrap. El endpoint devuelve cantidades y número de registros por línea sin cargar el histórico completo en el frontend.

Los conteos anteriores son una evidencia puntual de la instancia de desarrollo, no valores fijos ni garantía de disponibilidad futura. No se probó en este paso una instalación limpia en otro equipo. La actualización de dictamen se compila y valida en código, pero no se ejecuta contra la base durante estas pruebas para evitar cambiar registros reales.

## Guía para mantener esta memoria

Actualizar este archivo cuando cambien rutas, conexión, columnas, validaciones o alcance. Distinguir expresamente lo probado de lo pendiente; evitar describir mocks como integración real y no copiar credenciales, datos personales ni filas de producción aquí.
