-- =====================================================================================
-- PROYECTO: SCRAP DASHBOARD INDUSTRIAL (MES & SAP INTEGRATION)
-- VISTAS Y PROCEDIMIENTOS ALMACENADOS PARA SQL SERVER MANAGEMENT STUDIO (SSMS)
-- =====================================================================================

USE SCRAP_MES;
GO

-- 1. Vista Completa: vw_MovimientosDetalle
-- Cruza dbo.Movimientos con dbo.MovimientoTipo, dbo.EtiquetasCI y dbo.Certificaciones
IF OBJECT_ID(N'dbo.vw_MovimientosDetalle', N'V') IS NOT NULL
    DROP VIEW dbo.vw_MovimientosDetalle;
GO

CREATE VIEW dbo.vw_MovimientosDetalle AS
SELECT 
    m.id,
    m.CertificacionId,
    c.nombre AS CertificacionNombre,
    c.linea AS Linea,
    c.estacion AS Estacion,
    m.MATNR,
    m.MATNR_FG,
    m.fecha_hora,
    CONVERT(VARCHAR(10), m.fecha_hora, 120) AS fecha,
    CONVERT(VARCHAR(5), m.fecha_hora, 108) AS hora,
    m.credencial,
    m.EmpleadoId,
    m.Empleado,
    m.MovimientoTipoId,
    t.nombre AS MovimientoTipoNombre,
    m.RazonId,
    r.Descripcion AS RazonDescripcion,
    m.cantidad,
    m.salida,
    m.retorno,
    m.procesado,
    m.aprobado,
    CASE 
        WHEN m.aprobado = 1 THEN 'Aprobado'
        WHEN m.aprobado = 2 THEN 'Rechazado'
        ELSE 'Pendiente'
    END AS EstatusTexto,
    m.centro_costo,
    m.almacen,
    m.serial,
    m.nvAprobadoPor,
    m.dtAprobado,
    -- Costo estimado unitario y total para integración financiera
    ISNULL(r.CC_Sugerido, '150.00') AS CostoUnitarioEstimado,
    m.cantidad * CAST(ISNULL(r.CC_Sugerido, '150.00') AS DECIMAL(10,2)) AS CostoTotalEstimado
FROM dbo.Movimientos m
LEFT JOIN dbo.MovimientoTipo t ON m.MovimientoTipoId = t.id
LEFT JOIN dbo.EtiquetasCI r ON m.RazonId = r.IdRazon
LEFT JOIN dbo.Certificaciones c ON m.CertificacionId = c.id;
GO

-- 2. Procedimiento Almacenado: sp_AprobarMovimiento
IF OBJECT_ID(N'dbo.sp_AprobarMovimiento', N'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_AprobarMovimiento;
GO

CREATE PROCEDURE dbo.sp_AprobarMovimiento
    @MovimientoId INT,
    @AprobadoPor NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Movimientos
    SET aprobado = 1,
        nvAprobadoPor = @AprobadoPor,
        dtAprobado = GETDATE()
    WHERE id = @MovimientoId;

    SELECT @@ROWCOUNT AS FilasAfectadas;
END
GO

-- 3. Procedimiento Almacenado: sp_RechazarMovimiento
IF OBJECT_ID(N'dbo.sp_RechazarMovimiento', N'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_RechazarMovimiento;
GO

CREATE PROCEDURE dbo.sp_RechazarMovimiento
    @MovimientoId INT,
    @RechazadoPor NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Movimientos
    SET aprobado = 2,
        nvAprobadoPor = @RechazadoPor,
        dtAprobado = GETDATE()
    WHERE id = @MovimientoId;

    SELECT @@ROWCOUNT AS FilasAfectadas;
END
GO
