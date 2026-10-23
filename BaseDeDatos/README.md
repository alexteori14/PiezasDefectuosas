# Carpeta BaseDeDatos: Modelo SQL Server Management Studio (SSMS)

Esta carpeta contiene la definición completa, scripts DDL, datos maestros y documentación técnica de la base de datos de grado industrial para el sistema **SCRAP Dashboard MES**.

## Conexión activa y precaución

La aplicación consulta únicamente los movimientos de 2025 en `dbo.Movimientos`, de la base indicada por `DB_DATABASE` en `.env` (actualmente `SOE`). La lista y el detalle son consultas de lectura; los dictámenes de aprobación/rechazo actualizan la fila pendiente seleccionada. La configuración local se encuentra en `.env`, basada en `.env.example`; consulta `ConexionBaseDatos.md`.

Los scripts SQL de esta carpeta son artefactos de referencia/desarrollo. No los ejecutes contra `SOE` ni contra otra base de planta sin revisión y autorización de los ingenieros responsables: pueden crear o modificar objetos y sus nombres de base/tablas no necesariamente coinciden con el servidor de origen.

## Contenido de la Carpeta

1. **`01_Schema_SSMS.sql`**:
   - Creación de base de datos `SCRAP_MES`.
   - Creación de la tabla principal `dbo.Movimientos` con sus 20 columnas exactas según la especificación de `Base de datos Estructura/Estructura.png` y `Estructura.txt`.
   - Creación de tablas foráneas: `dbo.MovimientoTipo`, `dbo.EtiquetasCI` (Catálogo de razones) y `dbo.Certificaciones`.
   - Índices clustered y non-clustered recomendados (`IX_Movimientos_MATNR`, `IX_Movimientos_Aprobado_Fecha`, `IX_Movimientos_Serial`).

2. **`02_Seeds_SSMS.sql`**:
   - Poblamiento de `dbo.MovimientoTipo` con los 8 tipos oficiales (1: Scrap, 2: Retrabajo en Linea, 3: Calidad, 4: Cuarentena, 5: Calidad Reingreso, 6: metal Finish, 7: Traspaleo, 8: Impresion Parcial).
   - Poblamiento exhaustivo de `dbo.EtiquetasCI` con los 58+ códigos oficiales del archivo `Estructura.txt` y la captura de SSMS `TabRazones.png` (5001 Arrugas, 5010 Fisura, 4142 Óxido, etc.).
   - Estaciones de certificación de planta (`dbo.Certificaciones`).
   - Movimientos iniciales de prueba con los estados `0: Pendiente`, `1: Aprobado` y `2: Rechazado`.

3. **`03_Vistas_y_Procedimientos.sql`**:
   - Vista `dbo.vw_MovimientosDetalle`: Une todas las tablas para consulta inmediata en reportes y APIs.
   - Procedimientos almacenados de aprobación y rechazo (`sp_AprobarMovimiento`, `sp_RechazarMovimiento`).

4. **`Diccionario_Datos_Movimientos.md`**:
   - Detalle de cada campo, tipo de dato SQL Server, nulabilidad y significado de planta.

5. **`Diagrama_ER.md`**:
   - Diagrama Entidad-Relación en formato Mermaid listo para visualización y documentación.
