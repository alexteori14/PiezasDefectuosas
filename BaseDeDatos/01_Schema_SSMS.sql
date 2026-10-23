-- =====================================================================================
-- PROYECTO: SCRAP DASHBOARD INDUSTRIAL (MES & SAP INTEGRATION)
-- SCRIPT DDL: Estructura de Base de Datos para SQL Server Management Studio (SSMS)
-- TABLA PRINCIPAL: dbo.Movimientos
-- TABLAS REFERENCIADAS: dbo.MovimientoTipo, dbo.EtiquetasCI (Razones), dbo.Certificaciones
-- =====================================================================================

USE master;
GO

-- 1. Crear la base de datos si no existe
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'SCRAP_MES')
BEGIN
    CREATE DATABASE SCRAP_MES;
    PRINT '>> Base de datos SCRAP_MES creada correctamente.';
END
GO

USE SCRAP_MES;
GO

-- =====================================================================================
-- 2. TABLA REFERENCIADA: dbo.MovimientoTipo (Tipos de movimiento)
-- =====================================================================================
IF OBJECT_ID(N'dbo.MovimientoTipo', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.MovimientoTipo (
        id INT NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        descripcion VARCHAR(255) NULL,
        activo BIT NOT NULL DEFAULT 1,
        CONSTRAINT PK_MovimientoTipo PRIMARY KEY CLUSTERED (id ASC)
    );
    PRINT '>> Tabla dbo.MovimientoTipo creada.';
END
GO

-- =====================================================================================
-- 3. TABLA REFERENCIADA: dbo.EtiquetasCI / dbo.Razones (Catálogo de razones de scrap/falla)
-- =====================================================================================
IF OBJECT_ID(N'dbo.EtiquetasCI', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.EtiquetasCI (
        Id INT IDENTITY(1,1) NOT NULL,
        IdMovimiento INT NULL,
        IdRazon INT NOT NULL,
        Descripcion VARCHAR(200) NOT NULL,
        CC_Sugerido VARCHAR(50) NULL,
        Notifica VARCHAR(50) NULL,
        PuntaCola VARCHAR(50) NULL,
        activo BIT NOT NULL DEFAULT 1,
        CONSTRAINT PK_EtiquetasCI PRIMARY KEY CLUSTERED (IdRazon ASC)
    );
    PRINT '>> Tabla dbo.EtiquetasCI creada.';
END
GO

-- =====================================================================================
-- 4. TABLA REFERENCIADA: dbo.Certificaciones (Estación de impresión / certificación)
-- =====================================================================================
IF OBJECT_ID(N'dbo.Certificaciones', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Certificaciones (
        id INT NOT NULL,
        nombre VARCHAR(150) NOT NULL,
        linea VARCHAR(50) NULL,
        estacion VARCHAR(50) NULL,
        ubicacion VARCHAR(100) NULL,
        activo BIT NOT NULL DEFAULT 1,
        CONSTRAINT PK_Certificaciones PRIMARY KEY CLUSTERED (id ASC)
    );
    PRINT '>> Tabla dbo.Certificaciones creada.';
END
GO

-- =====================================================================================
-- 5. TABLA PRINCIPAL: dbo.Movimientos
-- Exactamente acorde al esquema de SQL Server Management Studio
-- =====================================================================================
IF OBJECT_ID(N'dbo.Movimientos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Movimientos (
        id INT IDENTITY(1,1) NOT NULL,
        CertificacionId INT NOT NULL,
        MATNR VARCHAR(50) NOT NULL,
        fecha_hora DATETIME NOT NULL DEFAULT GETDATE(),
        credencial VARCHAR(50) NOT NULL,
        MovimientoTipoId INT NOT NULL,
        cantidad INT NOT NULL,
        salida BIT NOT NULL DEFAULT 0,
        retorno BIT NOT NULL DEFAULT 0,
        EmpleadoId VARCHAR(50) NULL,
        Empleado VARCHAR(250) NULL,
        procesado INT NULL DEFAULT 0,
        aprobado INT NULL DEFAULT 0, -- 0: Pendiente, 1: Aprobado, 2: Rechazado
        RazonId INT NULL,
        centro_costo VARCHAR(50) NULL,
        almacen VARCHAR(50) NULL,
        serial VARCHAR(50) NULL,
        MATNR_FG VARCHAR(50) NULL,
        nvAprobadoPor NVARCHAR(200) NULL,
        dtAprobado DATETIME NULL,

        -- Llave primaria Clustered
        CONSTRAINT PK_Movimientos PRIMARY KEY CLUSTERED (id ASC),

        -- Llaves foráneas
        CONSTRAINT FK_Movimientos_Certificacion FOREIGN KEY (CertificacionId) 
            REFERENCES dbo.Certificaciones(id),

        CONSTRAINT FK_Movimientos_MovimientoTipo FOREIGN KEY (MovimientoTipoId) 
            REFERENCES dbo.MovimientoTipo(id),

        CONSTRAINT FK_Movimientos_Razon FOREIGN KEY (RazonId) 
            REFERENCES dbo.EtiquetasCI(IdRazon)
    );
    PRINT '>> Tabla dbo.Movimientos creada.';
END
GO

-- =====================================================================================
-- 6. ÍNDICES RECOMENDADOS (Incluye los sugeridos en SSMS: missing_index)
-- =====================================================================================
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Movimientos_MATNR' AND object_id = OBJECT_ID(N'dbo.Movimientos'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Movimientos_MATNR 
        ON dbo.Movimientos (MATNR ASC);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Movimientos_Aprobado_Fecha' AND object_id = OBJECT_ID(N'dbo.Movimientos'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Movimientos_Aprobado_Fecha 
        ON dbo.Movimientos (aprobado ASC, fecha_hora DESC)
        INCLUDE (cantidad, MovimientoTipoId, RazonId, almacen, serial);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Movimientos_Serial' AND object_id = OBJECT_ID(N'dbo.Movimientos'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Movimientos_Serial 
        ON dbo.Movimientos (serial ASC);
END
GO
