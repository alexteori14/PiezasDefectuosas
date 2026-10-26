# Diccionario de datos consultados

Este documento describe las tablas y columnas verificadas en la base configurada para la aplicación. La aplicación consulta los movimientos de 2025; no crea tablas ni importa catálogos con estos documentos.

La estructura se comprobó mediante metadatos de SQL Server (`sys.tables` y `sys.columns`). Los tamaños de `nvarchar` se expresan en caracteres; para otros tipos de texto, en bytes según SQL Server.

## `dbo.Movimientos`

Tabla de movimientos consultada por el backend. La columna `id` es identidad. En la consulta de lista se conserva la fila original; el nombre del tipo de movimiento se agrega en el backend a partir del identificador.

| Columna | Tipo | NULL | Uso en la aplicación |
|---|---|---:|---|
| `id` | `int` | No | Identificador del movimiento. |
| `CertificacionId` | `int` | No | Identificador usado para relacionar el movimiento con `dbo.Certificacion.id`. |
| `MATNR` | `varchar(50)` | No | Número de parte defectuosa. |
| `fecha_hora` | `datetime` | No | Fecha y hora del movimiento; el rango predeterminado se filtra por esta columna. |
| `credencial` | `varchar(50)` | No | Credencial reportada. |
| `MovimientoTipoId` | `int` | No | Identificador del tipo de movimiento; el valor `1` se usa para filtrar Scrap. |
| `cantidad` | `int` | No | Cantidad de piezas; se suma para los totales de Scrap. |
| `salida` | `bit` | No | Campo presente en la fila consultada. |
| `retorno` | `bit` | No | Campo presente en la fila consultada. |
| `EmpleadoId` | `varchar(50)` | Sí | Campo disponible; su integración funcional está pendiente. |
| `Empleado` | `varchar(250)` | Sí | Campo disponible; su integración funcional está pendiente. |
| `procesado` | `int` | Sí | Campo presente en la fila consultada. |
| `aprobado` | `int` | Sí | Estado consultado por la bandeja. El endpoint de dictamen existente también lo actualiza al confirmar. |
| `RazonId` | `int` | Sí | Identificador de razón; la aplicación no consulta actualmente un catálogo en vivo de razones. |
| `centro_costo` | `varchar(50)` | Sí | Campo conservado en la fila original; no integrado en las vistas actuales. |
| `almacen` | `varchar(50)` | Sí | Almacén reportado. |
| `serial` | `varchar(50)` | Sí | Serial del registro. |
| `MATNR_FG` | `varchar(50)` | Sí | Número de parte del producto terminado. |
| `nvAprobadoPor` | `nvarchar(200)` | Sí | Campo de dictamen; el endpoint existente lo actualiza al confirmar. |
| `dtAprobado` | `datetime` | Sí | Fecha y hora de dictamen; el endpoint existente la establece con la hora de SQL Server. |

## `dbo.Certificacion`

Tabla consultada para determinar la línea asociada a cada movimiento. El endpoint `GET /api/movimientos/fallas-por-linea` enlaza `Movimientos.CertificacionId` con `Certificacion.id` y agrupa por `LineaId`.

| Columna | Tipo | NULL | Uso en la aplicación |
|---|---|---:|---|
| `id` | `int` | No | Identificador de certificación; identidad en la tabla observada. |
| `LineaId` | `int` | No | Identificador de línea usado para agrupar las piezas Scrap. |
| `fecha` | `datetime` | No | No utilizado por el reporte actual. |
| `turno` | `int` | No | No utilizado por el reporte actual. |
| `material` | `varchar(50)` | No | No utilizado por el reporte actual. |
| `permite_autorizacion` | `bit` | No | No utilizado por el reporte actual. |
| `terminado` | `bit` | No | No utilizado por el reporte actual. |
| `credencial_inicio` | `varchar(50)` | No | No utilizado por el reporte actual. |
| `fecha_inicio` | `datetime` | No | No utilizado por el reporte actual. |
| `fecha_fin` | `datetime` | Sí | No utilizado por el reporte actual. |
| `notificado_email` | `bit` | Sí | No utilizado por el reporte actual. |
| `notificado_phone` | `bit` | Sí | No utilizado por el reporte actual. |
| `SupervisorId` | `varchar(50)` | Sí | No utilizado por el reporte actual. |
| `Supervisor` | `varchar(250)` | Sí | No utilizado por el reporte actual. |
| `lock` | `bit` | No | No utilizado por el reporte actual. |

El ID de línea se muestra como valor numérico. No se documenta aquí un nombre de línea porque esta consulta no resuelve un catálogo de nombres de líneas.

## `dbo.MovimientoTipo`

El backend asigna el nombre mostrado a partir de `MovimientoTipoId` con un mapa local de tipos. La tabla tiene las columnas `id int NOT NULL`, `nombre varchar(50) NOT NULL` y `descripcion varchar(500) NOT NULL`; no se consulta como catálogo en vivo por las pantallas actuales.

## Alcance y límites

- El backend filtra la lista predeterminada con `fecha_hora >= '20250101' AND fecha_hora < '20260101'`, en SQL Server.
- El reporte de fallas suma `cantidad` para `MovimientoTipoId = 1` y agrupa por `Certificacion.LineaId`.
- Las razones se muestran por `RazonId`; sus descripciones provienen de un catálogo local, no de una lectura en vivo de `dbo.EtiquetasCI`.
- La mayoría de las operaciones son consultas. La bandeja de aprobación conserva una operación de escritura para los campos de dictamen; véase `ConexionBaseDatos.md`.
- Los valores NULL y los campos que no se usan no se reemplazan por datos inventados.
