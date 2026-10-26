# Conexión y consultas a SQL Server

La conexión que utiliza el backend se configura en `BaseDeDatos/.env`, a partir de `.env.example`. No guardes credenciales en archivos versionados. El código de conexión está en `backend/src/config/database.connection.ts` y usa SQL Server mediante `mssql/msnodesqlv8` y el controlador ODBC configurado.

Para validar la conexión desde la raíz del proyecto:

```powershell
npm run test:db
```

La prueba consulta `DB_NAME()` para comprobar la base activa; no lee tablas ni cambia datos.

## Consultas de la aplicación

- `GET /api/movimientos` consulta `dbo.Movimientos` y carga por defecto el año 2025, con `fecha_hora >= 2025-01-01` y `< 2026-01-01`.
- `GET /api/movimientos/:id` consulta un movimiento por identificador.
- `GET /api/movimientos/fallas-por-linea` consulta y agrupa movimientos Scrap de 2025 por la relación `dbo.Movimientos.CertificacionId` → `dbo.Certificacion.id` → `dbo.Certificacion.LineaId`.
- `GET /api/movimientos/kpis` calcula indicadores a partir de la consulta de movimientos.
- `GET /api/health` informa el estado de la conexión y el backend.

La lista permite rangos técnicos explícitos mediante `fechaInicio` (incluyente) y `fechaFin` (excluyente), en formato `YYYY-MM-DD`. Las pantallas usan el rango predeterminado de 2025.

## Escritura existente: dictamen

La lectura de movimientos y el reporte por línea son consultas. Sin embargo, el proyecto **no es exclusivamente de solo lectura**: la bandeja de aprobaciones usa `PATCH /api/movimientos/:id/dictamen`. Al confirmar en la interfaz, el backend actualiza en `dbo.Movimientos` una fila con `aprobado = 0`, guarda `aprobado = 1` o `2`, el nombre en `nvAprobadoPor` y la hora de SQL Server en `dtAprobado`.

Esta actualización modifica datos reales. El nombre se captura manualmente y no autentica al usuario; la API no implementa autorización de identidad. Si el requisito operativo es que la aplicación sea solo consulta, se debe deshabilitar esta ruta y su interfaz y limitar los permisos de la cuenta SQL a lectura antes de desplegarla.

## Parámetros de conexión

| Variable | Uso |
|---|---|
| `DB_SERVER` | Host o nombre del servidor. |
| `DB_PORT` | Puerto de SQL Server. |
| `DB_DATABASE` | Base de datos de conexión. |
| `DB_DRIVER` | Controlador ODBC instalado. |
| `DB_AUTHENTICATION` | `windows` para autenticación integrada o `sql` para credenciales SQL. |
| `DB_USER` / `DB_PASSWORD` | Credenciales requeridas solo para autenticación SQL. |
| `DB_ENCRYPT` | Activa TLS cuando vale `true`. |
| `DB_TRUST_SERVER_CERTIFICATE` | Configura la confianza en el certificado del servidor. |
| `DB_CONNECTION_TIMEOUT` | Tiempo máximo de conexión, en milisegundos. |
| `DB_REQUEST_TIMEOUT` | Tiempo máximo de consulta, en milisegundos. |

Con autenticación Windows, la cuenta que ejecuta Node.js necesita permiso en el servidor y la base. Para otro equipo, instala las dependencias del backend con `npm install --prefix backend` y configura el controlador ODBC indicado por `DB_DRIVER`.
