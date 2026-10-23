# Diagrama Entidad-Relación (ER): Base de Datos SSMS

```mermaid
erDiagram
    MOVIMIENTOS {
        int id PK "Clave primaria autoincremental"
        int CertificacionId FK "Estación de impresión / certificación"
        varchar MATNR "Número de parte defectuosa corriendo"
        datetime fecha_hora "Fecha y hora del movimiento"
        varchar credencial "Número de nómina del solicitante"
        int MovimientoTipoId FK "Tipo de movimiento (1..8)"
        int cantidad "Cantidad de piezas no conformes"
        bit salida "Bandera de egreso inventario"
        bit retorno "Bandera de retorno"
        varchar EmpleadoId "ID empleado"
        varchar Empleado "Nombre de empleado"
        int procesado "Estado de procesamiento ERP"
        int aprobado "0: Pendiente, 1: Aprobado, 2: Rechazado"
        int RazonId FK "Causa raíz (EtiquetasCI)"
        varchar centro_costo "Centro de costo a descargar"
        varchar almacen "Caracteres del almacén (ALM-99, etc)"
        varchar serial "ID etiqueta impresa (Folio marbete)"
        varchar MATNR_FG "Número de parte producto terminado"
        nvarchar nvAprobadoPor "Nombre del supervisor aprobador"
        datetime dtAprobado "Fecha y hora de aprobación"
    }

    MOVIMIENTO_TIPO {
        int id PK "1..8"
        varchar nombre "Scrap, Retrabajo, Calidad, etc."
        varchar descripcion "Descripción operativa"
        bit activo "Estado activo"
    }

    ETIQUETAS_CI {
        int Id "Identificador secuencial"
        int IdMovimiento "Referencia al movimiento"
        int IdRazon PK "5001, 5002, 5010, 4142..."
        varchar Descripcion "Arrugas, Fisura, Poro..."
        varchar CC_Sugerido "Centro de costo o costo estimado"
        varchar Notifica "Regla de notificación"
        varchar PuntaCola "Marca punta/cola de bobina"
        bit activo "Estado activo"
    }

    CERTIFICACIONES {
        int id PK "101, 102, 103..."
        varchar nombre "Nombre de estación certificadora"
        varchar linea "L-01, L-02, L-03..."
        varchar estacion "EST-01, EST-W1..."
        varchar ubicacion "Prensas, Soldadura, etc."
        bit activo "Estado activo"
    }

    MOVIMIENTOS }o--|| CERTIFICACIONES : "FK_Movimientos_Certificacion"
    MOVIMIENTOS }o--|| MOVIMIENTO_TIPO : "FK_Movimientos_MovimientoTipo"
    MOVIMIENTOS }o--o| ETIQUETAS_CI : "FK_Movimientos_Razon (RazonId -> IdRazon)"
```

### Relaciones Clave:
1. **`dbo.Movimientos` -> `dbo.Certificaciones`**: Cada movimiento queda sellado en la estación o celda donde se emite la etiqueta física (`CertificacionId`).
2. **`dbo.Movimientos` -> `dbo.MovimientoTipo`**: Cada transacción se tipifica numéricamente (1: Scrap, 2: Retrabajo en Línea, 3: Calidad, etc.).
3. **`dbo.Movimientos` -> `dbo.EtiquetasCI`**: Se vincula el código de falla automotriz mediante `RazonId` hacia `IdRazon` (5001 = Arrugas, 5010 = Fisura, etc.).
