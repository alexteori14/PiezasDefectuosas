# Guía de Conexión a Base de Datos (SQL Server Management Studio)

Este documento detalla el archivo exclusivo preparado para la conexión con SQL Server y cómo interactuar con él.

---

## 1. Archivo Exclusivo de Conexión

El archivo principal y exclusivo de conexión se encuentra en:
```
backend/src/config/database.connection.ts
```

### ¿Qué contiene este archivo?
1. **Configuración de `mssql`**: Servidor, puerto (1433), base de datos (`SCRAP_MES`), usuario y contraseña.
2. **Pool de conexiones**: Gestión de concurrencia y cierre seguro.
3. **Manejo de Cifrado y Certificados**: Opciones `trustServerCertificate: true` para entornos locales y corporativos.
4. **Función de Autodiagnóstico**: `probarConexionSQLServer()`, que verifica la versión de SQL Server y hace un recuento de `dbo.Movimientos`.
5. **Ejecutable Directo**: Puede ejecutarse directamente desde la consola con un solo comando.

---

## 2. Variables de Entorno (`backend/.env`)

Para conectar a tu servidor de SQL Server Management Studio, edita el archivo `backend/.env`:

```env
PORT=3001

# Servidor e Instancia de SQL Server
DB_SERVER=localhost
# Si es una instancia con nombre, ejemplo: localhost\\SQLEXPRESS o 172.19.216.68
DB_PORT=1433
DB_DATABASE=SCRAP_MES
DB_USER=sa
DB_PASSWORD=TuPasswordAqui

# Opciones de Red
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
DB_CONNECTION_TIMEOUT=5000
DB_REQUEST_TIMEOUT=15000
```

---

## 3. Comandos Rápidos de Conexión

Desde la raíz del proyecto, puedes probar la conexión en cualquier momento con:

```bash
# Probar conexión exclusiva a SQL Server
npm run test:db
```

O desde la carpeta `backend`:
```bash
npm run test:db
```

---

## 4. Modo Adaptado vs Modo Conexión Activa

- **Modo Adaptado (Por defecto):** El frontend y el backend operan al 100% con la estructura exacta de `dbo.Movimientos`, `dbo.MovimientoTipo` y `dbo.EtiquetasCI` sin detenerse por credenciales ni retardos de red.
- **Modo Conexión Activa:** Cuando tengas tu instancia de SSMS lista y desees consultar directamente las tablas en vivo, solo necesitas llamar a `conectarSQLServer()` desde `database.connection.ts`.
