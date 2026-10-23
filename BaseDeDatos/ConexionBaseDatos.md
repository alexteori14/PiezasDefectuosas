# Conexión a SQL Server

La configuración local está centralizada en `BaseDeDatos/.env`. Este archivo no se incluye en Git porque puede contener credenciales. Para crear uno nuevo, copia `BaseDeDatos/.env.example` como `BaseDeDatos/.env` y edita sus valores.

El módulo de conexión que utiliza el backend es `backend/src/config/database.connection.ts`. La prueba de conexión se ejecuta desde la raíz:

```powershell
npm run test:db
```

La prueba abre una conexión y consulta únicamente `DB_NAME()` para comprobar la base activa; no revisa tablas ni modifica datos.

El backend ofrece `GET /api/movimientos`, que carga por defecto únicamente las filas de 2025 (`fecha_hora >= 2025-01-01` y `< 2026-01-01`) y retorna las columnas originales. El detalle se obtiene en `GET /api/movimientos/:id`. Para consultas técnicas con otro rango se pueden enviar `fechaInicio` y `fechaFin` en formato `YYYY-MM-DD`; el inicio es inclusivo y el fin exclusivo. Las vistas de la aplicación no envían un rango alternativo, por lo que trabajan solo con los datos de 2025.

La bandeja de aprobaciones también permite emitir un dictamen mediante `PATCH /api/movimientos/:id/dictamen`. El endpoint actualiza únicamente movimientos con `aprobado = 0`: establece `aprobado` a `1` (aprobado) o `2` (rechazado), guarda el nombre ingresado en `nvAprobadoPor` y registra `GETDATE()` del SQL Server en `dtAprobado`. El ID, decisión y nombre se envían como parámetros validados; un movimiento ya dictaminado no se sobrescribe.

El nombre capturado es un dato de auditoría ingresado por el operador, no una autenticación ni una verificación de identidad. El API no cuenta actualmente con inicio de sesión/autorización para identificar usuarios; antes de exponerlo fuera de un entorno controlado se debe integrar autenticación y limitar permisos de red y de base de datos. La acción modifica datos reales y no se revierte automáticamente.

## Instalación en otro equipo

Desde la raíz del proyecto, instala las dependencias del backend:

```powershell
npm install --prefix backend
```

Si npm bloquea el script nativo de `msnodesqlv8`, autorízalo e instala el binario:

```powershell
Push-Location backend
npm install-scripts approve msnodesqlv8
npm rebuild msnodesqlv8
Pop-Location
```

También se requiere tener instalado el controlador ODBC de 64 bits indicado en `DB_DRIVER`. La cuenta de Windows que ejecute Node.js necesita permiso para conectarse al servidor y a la base configurados.

## Parámetros

| Variable | Uso |
|---|---|
| `DB_SERVER` | Nombre o dirección del servidor SQL Server. |
| `DB_PORT` | Puerto TCP; el valor habitual es `1433`. |
| `DB_DATABASE` | Base de datos que se abrirá. |
| `DB_DRIVER` | Nombre del controlador ODBC instalado, por defecto `ODBC Driver 17 for SQL Server`. |
| `DB_AUTHENTICATION` | `windows` para autenticación integrada, o `sql` para usuario y contraseña SQL. |
| `DB_USER` / `DB_PASSWORD` | Credenciales requeridas únicamente con `DB_AUTHENTICATION=sql`. |
| `DB_ENCRYPT` | Activa cifrado TLS cuando vale `true`. |
| `DB_TRUST_SERVER_CERTIFICATE` | Acepta el certificado del servidor cuando vale `true`. |
| `DB_CONNECTION_TIMEOUT` | Tiempo máximo de conexión en milisegundos. |
| `DB_REQUEST_TIMEOUT` | Tiempo máximo de consulta en milisegundos. |

Con autenticación Windows se usa la cuenta que ejecuta el proceso Node.js; esa cuenta debe tener permiso de acceso a la instancia y a la base. El conector utiliza `msnodesqlv8` y el controlador ODBC 17 para SQL Server.

No guardes contraseñas en el archivo de ejemplo ni en archivos versionados. Si cambias a autenticación SQL, conserva las credenciales solo en `BaseDeDatos/.env`.
