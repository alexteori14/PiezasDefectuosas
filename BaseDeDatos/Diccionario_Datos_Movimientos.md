# Diccionario de Datos: Tabla `dbo.Movimientos` y Tablas Relacionadas
**Entorno de Base de Datos:** SQL Server Management Studio (SSMS)  
**Sistema:** Control de Scrap y Trazabilidad MES Industrial  

---

## 1. Tabla Principal: `dbo.Movimientos`

Representa cada evento o transacción de material no conforme, rechazo, muestra de calidad o retrabajo generado en las estaciones y prensas de manufactura.

| Columna | Tipo de Dato (SSMS) | Nulabilidad | Clave / Restricción | Descripción y Regla de Negocio |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT IDENTITY(1,1)` | **NOT NULL** | **PK Clustered** | Identificador único autoincremental del movimiento en la base de datos. |
| `CertificacionId` | `INT` | **NOT NULL** | **FK** (`dbo.Certificaciones`) | Identifica la estación certificadora o prensa donde se emitió/imprimió la etiqueta física del material defectuoso. |
| `MATNR` | `VARCHAR(50)` | **NOT NULL** | Indexado | Número de parte defectuosa corriendo en la maquinaria (estándar SAP Material Number). |
| `fecha_hora` | `DATETIME` | **NOT NULL** | Default `GETDATE()` | Marca de tiempo exacta del registro del defecto en la terminal MES. |
| `credencial` | `VARCHAR(50)` | **NOT NULL** | - | Número de nómina o gafete del empleado que reporta la pieza defectuosa. |
| `MovimientoTipoId` | `INT` | **NOT NULL** | **FK** (`dbo.MovimientoTipo`) | Tipo o categoría de movimiento de material (1 a 8). |
| `cantidad` | `INT` | **NOT NULL** | - | Número de piezas defectuosas contabilizadas en el evento. |
| `salida` | `BIT` | **NOT NULL** | Default `0` | Bandera técnica de egreso de inventario (ignorable para interfaz operativa). |
| `retorno` | `BIT` | **NOT NULL** | Default `0` | Bandera técnica de reingreso (ignorable para interfaz operativa). |
| `EmpleadoId` | `VARCHAR(50)` | NULL | - | Código identificador del empleado registrado. |
| `Empleado` | `VARCHAR(250)` | NULL | - | Nombre completo del operador que generó la solicitud de scrap. |
| `procesado` | `INT` | NULL | Default `0` | Bandera de procesamiento en SAP ERP / MES. |
| `aprobado` | `INT` | NULL | Default `0` | Estado de dictamen: `0 = Pendiente`, `1 = Aprobado`, `2 = Rechazado`. |
| `RazonId` | `INT` | NULL | **FK / Ref** (`dbo.EtiquetasCI`) | Clave de la causa raíz o defecto específico según catálogo de `EtiquetasCI` (ej. 5001 = Arrugas, 5010 = Fisura). |
| `centro_costo` | `VARCHAR(50)` | NULL | - | Centro de costo al que se descarga contablemente el scrap (ej. `CC-ESTAMP`, `CC-SOLDAD`). |
| `almacen` | `VARCHAR(50)` | NULL | - | Caracteres de almacén de disposición (ej. `ALM-99`, `ALM-12`, `ALM-05`). |
| `serial` | `VARCHAR(50)` | NULL | Indexado | Folio o número de serie único impreso en el marbete/etiqueta viajera industrial. |
| `MATNR_FG` | `VARCHAR(50)` | NULL | - | Número de parte del ensamble o producto terminado final (*Finished Good*) al que pertenece el componente. |
| `nvAprobadoPor` | `NVARCHAR(200)` | NULL | - | Nombre del supervisor o auditor de calidad que dictamina la solicitud. |
| `dtAprobado` | `DATETIME` | NULL | - | Fecha y hora en la que el supervisor ejecutó la aprobación o rechazo. |

---

## 2. Tabla Relacionada: `dbo.MovimientoTipo` (FK `MovimientoTipoId`)

Define las categorías operativas de movimientos de materiales:

| `id` | `nombre` | Significado Operativo |
| :---: | :--- | :--- |
| **1** | **Scrap** | Descarte absoluto de material no conforme (impacto en COPQ y disposición en patio 99). |
| **2** | **Retrabajo en Linea** | Corrección inmediata del componente dentro del ciclo de la celda de ensamble. |
| **3** | **Calidad** | Muestra de laboratorio, corte metalográfico o verificación dimensional en CMM. |
| **4** | **Cuarentena** | Lote completo retenido preventivamente por sospecha de falla de proveedor o proceso. |
| **5** | **Calidad Reingreso** | Piezas retenidas previamente que cumplieron criterios y reingresan a producción. |
| **6** | **metal Finish** | Acondicionamiento de imperfecciones menores de estampado con lima o pulido. |
| **7** | **Traspaleo** | Cambio de embalaje o rack logístico por daño de estiba o manejo de montacargas. |
| **8** | **Impresion Parcial** | Etiqueta ilegible, código de barras dañado o troquelado incompleto de identificación. |

---

## 3. Tabla Relacionada: `dbo.EtiquetasCI` (Catálogo de Razones referenciado por `RazonId`)

Estructura de la tabla vista en SQL Server (`TabRazones.png`):
- `IdMovimiento` (INT)
- `IdRazon` (INT, Clave única de la razón)
- `Descripcion` (VARCHAR(200))
- `Id` (INT)
- `CC_Sugerido` (VARCHAR(50) / DECIMAL)
- `Notifica` (VARCHAR(50))
- `PuntaCola` (VARCHAR(50))

### Muestreo de Códigos y Descripciones Oficiales:
- **5001**: Arrugas
- **5002**: Barreno Dañado
- **5003**: Blank Dañado
- **5004**: Blank mal Dimensionado
- **5005**: Blank Sucio
- **5006**: Cambio de Ingeniería
- **5007**: Deformación en Outer
- **5008**: Daño por Equipo
- **5009**: Falta de Material
- **5010**: Fisura
- **5011**: Golpe en Proceso
- **5012**: Mal Engargolado
- **5013**: Mala Apariencia
- **5014**: Mala Reparación / Mal Ensamble
- **5015**: Material Fuera de Especificación
- **5017**: Pieza Dañada por Troquel
- **5018**: Pieza Fuera de Dimensión
- **5019**: Poros en Acero
- **5020**: Poros en Láser
- **5021**: Primera y Última Pieza
- **5022**: Problema de Proyecto
- **5023**: Problemas de Soldadura
- **5024**: Punta y Cola de Rollo
- **5025**: Rollo Dañado
- **5026**: Tear Down
- **5027**: Try Outs (Pruebas en Prensa)
- **4142**: OXIDO CAL / COMP
- **4143**: LAMINACION CAL / COMP
- **4144**: ESCORIACION
- **4145**: CONTAMINACION
- **4146**: MANCHA SOLUCION COMP / CAL
- **4147**: ONDULACIO/PLANICIDAD
- **4148**: LIBERACION CALIDAD
- **4149**: LIB STACKER 1-2
- **4150**: FALLA P DE LIB STACK
- **4151**: GOLPES APILADOR
- **4152**: GOLPE DE GUIAS
- **4153**: MARCA DE RODAJAS MTTO / MATR
- **4154**: RAYAS TROQUEL
- **4155**: RAYAS LIFTERS MTTO / MATR
- **4156**: MARCA DE FLEJE
- **4157**: MARCA DE ROLLO
- **4158**: ROLLO CON RAYAS
- **4159**: MAL CORTE
- **4160**: CENTRADO DE ROLLO PROD / MTTO
- **4161**: FALLA DE LOOP
- **4162**: MARCA DE SCRAP
- **4163**: TELESCOPEO
- **4164**: TELESCOPICO
- **4165**: DAÑO POR MANEJO
- **4166**: ROLLO CONTAMINADO
- **4167**: MARCAS DE NIVELADOR
- **6032**: Punta de Rollo
- **6033**: Cola de Rollo
- **6034**: Pernos Fríos
- **6035**: Puntos Fríos
- **7214**: FALLA DE SOLDADURA
- **50112**: Puntos Explotados

---

## 4. Tabla Relacionada: `dbo.Certificaciones` (FK `CertificacionId`)
- `id` (INT PK): Identificador numérico de la estación de impresión/certificación.
- `nombre`: Nombre legible de la estación (ej. *Estación Certificadora Prensa 01*).
- `linea`: Código de línea fabril asociada (ej. *L-01*, *L-03*).
- `estacion`: Código de celda (ej. *EST-01*, *EST-W1*).
- `ubicacion`: Bahía o nave de la planta automotriz.
