-- =====================================================================================
-- PROYECTO: SCRAP DASHBOARD INDUSTRIAL (MES & SAP INTEGRATION)
-- SCRIPT SEEDS: Datos Maestros y de Ejemplo para SQL Server Management Studio (SSMS)
-- =====================================================================================

USE SCRAP_MES;
GO

-- 1. Insertar Catálogo de Tipos de Movimiento (dbo.MovimientoTipo)
MERGE dbo.MovimientoTipo AS target
USING (VALUES
    (1, 'Scrap', 'Material descartado no conforme sin posibilidad de recuperación', 1),
    (2, 'Retrabajo en Linea', 'Pieza con retrabajo inmediato en la celda o estación', 1),
    (3, 'Calidad', 'Muestra o retención enviada al laboratorio de calidad / CMM', 1),
    (4, 'Cuarentena', 'Lote bloqueado en espera de dictamen técnico IATF', 1),
    (5, 'Calidad Reingreso', 'Pieza liberada tras inspección de calidad que reingresa a producción', 1),
    (6, 'metal Finish', 'Acondicionamiento superficial o pulido en bahía de acabado metálico', 1),
    (7, 'Traspaleo', 'Movimiento logístico de cambio de rack o contenedor', 1),
    (8, 'Impresion Parcial', 'Etiqueta o troquelado con impresión incompleta o ilegible', 1)
) AS source (id, nombre, descripcion, activo)
ON target.id = source.id
WHEN MATCHED THEN
    UPDATE SET target.nombre = source.nombre, target.descripcion = source.descripcion, target.activo = source.activo
WHEN NOT MATCHED THEN
    INSERT (id, nombre, descripcion, activo) VALUES (source.id, source.nombre, source.descripcion, source.activo);
GO

-- 2. Insertar Catálogo de Certificaciones / Estaciones de Impresión (dbo.Certificaciones)
MERGE dbo.Certificaciones AS target
USING (VALUES
    (101, 'Estación Certificadora Prensa 01', 'L-01', 'EST-01', 'Área de Estampado Pesado Transfer', 1),
    (102, 'Estación Certificadora Prensa 02', 'L-02', 'EST-02', 'Área de Prensas Tándem', 1),
    (103, 'Celda Certificación Soldadura A', 'L-03', 'EST-W1', 'Nave de Soldadura Robótica', 1),
    (104, 'Celda Certificación Soldadura B', 'L-03', 'EST-W2', 'Nave de Soldadura Robótica', 1),
    (105, 'Estación Final Metal Finish 01', 'L-05', 'EST-MF1', 'Bahía de Acabados de Chapa', 1),
    (106, 'Mesa de Calidad y CMM Central', 'CAL-01', 'LAB-CMM', 'Laboratorio Metrológico', 1),
    (107, 'Bahía de Cuarentena e Inspección', 'CUA-01', 'ALM-05', 'Almacén de Bloqueo', 1)
) AS source (id, nombre, linea, estacion, ubicacion, activo)
ON target.id = source.id
WHEN MATCHED THEN
    UPDATE SET target.nombre = source.nombre, target.linea = source.linea, target.estacion = source.estacion, target.ubicacion = source.ubicacion, target.activo = source.activo
WHEN NOT MATCHED THEN
    INSERT (id, nombre, linea, estacion, ubicacion, activo) VALUES (source.id, source.nombre, source.linea, source.estacion, source.ubicacion, source.activo);
GO

-- 3. Insertar Catálogo de Razones de Falla (dbo.EtiquetasCI)
MERGE dbo.EtiquetasCI AS target
USING (VALUES
    (553, 5001, 'Arrugas', NULL, NULL, NULL, 1),
    (553, 5002, 'Barreno Dañado', NULL, NULL, NULL, 1),
    (553, 5003, 'Blank Dañado', NULL, NULL, NULL, 1),
    (553, 5004, 'Blank mal Dimensionado', NULL, NULL, NULL, 1),
    (553, 5005, 'Blank Sucio', NULL, NULL, NULL, 1),
    (553, 5006, 'Cambio de Ingenieria', NULL, NULL, NULL, 1),
    (553, 5007, 'Deformacion en Outer', NULL, NULL, NULL, 1),
    (553, 5008, 'Daño por Equipo', NULL, NULL, NULL, 1),
    (553, 5009, 'Falta de Material', NULL, NULL, NULL, 1),
    (553, 5010, 'Fisura', NULL, NULL, NULL, 1),
    (553, 5011, 'Golpe en Proceso', NULL, NULL, NULL, 1),
    (553, 5012, 'Mal Engargolado', NULL, NULL, NULL, 1),
    (553, 5013, 'Mala Apariencia', NULL, NULL, NULL, 1),
    (553, 5014, 'Mala Reparación/Mal Ensamble', NULL, NULL, NULL, 1),
    (553, 5015, 'Material Fuera de Especificación', NULL, NULL, NULL, 1),
    (553, 5017, 'Pieza Dañada por Troquel', NULL, NULL, NULL, 1),
    (553, 5018, 'Pieza Fuera de Dimensión', NULL, NULL, NULL, 1),
    (553, 5019, 'Poros en Acero', NULL, NULL, NULL, 1),
    (553, 5020, 'Poros en Laser', NULL, NULL, NULL, 1),
    (553, 5021, 'Primera y Ultima pza', NULL, NULL, NULL, 1),
    (553, 5022, 'Problema de Proyecto', NULL, NULL, NULL, 1),
    (553, 5023, 'Problemas de Soldadura', NULL, NULL, NULL, 1),
    (553, 5024, 'Punta y Cola de Rollo', NULL, NULL, NULL, 1),
    (553, 5025, 'Rollo Dañado', NULL, NULL, NULL, 1),
    (553, 5026, 'Tear Down', NULL, NULL, NULL, 1),
    (553, 5027, 'Try Outs (Pruebas en Prensa)', NULL, NULL, NULL, 1),
    (553, 4142, 'OXIDO CAL / COMP', NULL, NULL, NULL, 1),
    (553, 4143, 'LAMINACION CAL / COMP', NULL, NULL, NULL, 1),
    (553, 4144, 'ESCORIACION', NULL, NULL, NULL, 1),
    (553, 4145, 'CONTAMINACION', NULL, NULL, NULL, 1),
    (553, 4146, 'MANCHA SOLUCION COMP / CAL', NULL, NULL, NULL, 1),
    (553, 4147, 'ONDULACIO/PLANICIDAD', NULL, NULL, NULL, 1),
    (553, 4148, 'LIBERACION CALIDAD', NULL, NULL, NULL, 1),
    (553, 4149, 'LIB STACKER 1-2', NULL, NULL, NULL, 1),
    (553, 4150, 'FALLA P DE LIB STACK', NULL, NULL, NULL, 1),
    (553, 4151, 'GOLPES APILADOR', NULL, NULL, NULL, 1),
    (553, 4152, 'GOLPE DE GUIAS', NULL, NULL, NULL, 1),
    (553, 4153, 'MARCA DE RODAJAS MTTO / MATR', NULL, NULL, NULL, 1),
    (553, 4154, 'RAYAS TROQUEL', NULL, NULL, NULL, 1),
    (553, 4155, 'RAYAS LIFTERS MTTO / MATR', NULL, NULL, NULL, 1),
    (553, 4156, 'MARCA DE FLEJE', NULL, NULL, NULL, 1),
    (553, 4157, 'MARCA DE ROLLO', NULL, NULL, NULL, 1),
    (553, 4158, 'ROLLO CON RAYAS', NULL, NULL, NULL, 1),
    (553, 4159, 'MAL CORTE', NULL, NULL, NULL, 1),
    (553, 4160, 'CENTRADO DE ROLLO PROD / MTTO', NULL, NULL, NULL, 1),
    (553, 4161, 'FALLA DE LOOP', NULL, NULL, NULL, 1),
    (553, 4162, 'MARCA DE SCRAP', NULL, NULL, NULL, 1),
    (553, 4163, 'TELESCOPEO', NULL, NULL, NULL, 1),
    (553, 4164, 'TELESCOPICO', NULL, NULL, NULL, 1),
    (553, 4165, 'DAÑO POR MANEJO', NULL, NULL, NULL, 1),
    (553, 4166, 'ROLLO CONTAMINADO', NULL, NULL, NULL, 1),
    (553, 4167, 'MARCAS DE NIVELADOR', NULL, NULL, NULL, 1),
    (553, 6032, 'Punta de Rollo', NULL, NULL, NULL, 1),
    (553, 6033, 'Cola de Rollo', NULL, NULL, NULL, 1),
    (553, 6034, 'Pernos Frios', NULL, NULL, NULL, 1),
    (553, 6035, 'Puntos Frios', NULL, NULL, NULL, 1),
    (553, 7214, 'FALLA DE SOLDADURA', NULL, NULL, NULL, 1),
    (553, 50112, 'Puntos Explotados', NULL, NULL, NULL, 1)
) AS source (IdMovimiento, IdRazon, Descripcion, CC_Sugerido, Notifica, PuntaCola, activo)
ON target.IdRazon = source.IdRazon
WHEN MATCHED THEN
    UPDATE SET target.Descripcion = source.Descripcion, target.IdMovimiento = source.IdMovimiento, target.activo = source.activo
WHEN NOT MATCHED THEN
    INSERT (IdMovimiento, IdRazon, Descripcion, CC_Sugerido, Notifica, PuntaCola, activo)
    VALUES (source.IdMovimiento, source.IdRazon, source.Descripcion, source.CC_Sugerido, source.Notifica, source.PuntaCola, source.activo);
GO

-- 4. Insertar Registros de Ejemplo en dbo.Movimientos
-- (Con estatus 0: Pendiente, 1: Aprobado, 2: Rechazado)
IF NOT EXISTS (SELECT 1 FROM dbo.Movimientos WHERE serial = 'ETQ-2026-90412')
BEGIN
    INSERT INTO dbo.Movimientos (
        CertificacionId, MATNR, fecha_hora, credencial, MovimientoTipoId,
        cantidad, salida, retorno, EmpleadoId, Empleado,
        procesado, aprobado, RazonId, centro_costo, almacen,
        serial, MATNR_FG, nvAprobadoPor, dtAprobado
    ) VALUES 
    (101, 'MAT-849201', '2026-10-23 07:24:00', 'EMP-3041', 1, 14, 1, 0, 'EMP-3041', 'Jorge Martínez R.', 0, 0, 5001, 'CC-ESTAMP', 'ALM-99', 'ETQ-2026-90412', 'FG-CX9-FND-LH', NULL, NULL),
    (103, 'MAT-334109', '2026-10-23 08:15:00', 'EMP-1984', 1, 8, 1, 0, 'EMP-1984', 'Miguel Ángel Cruz', 0, 0, 5010, 'CC-SOLDAD', 'ALM-99', 'ETQ-2026-90413', 'FG-CX9-DR-RR', NULL, NULL),
    (101, 'MAT-990214', '2026-10-23 06:45:00', 'EMP-4421', 1, 3, 1, 0, 'EMP-4421', 'Roberto Morales G.', 1, 1, 5017, 'CC-ESTAMP', 'ALM-99', 'ETQ-2026-90410', 'FG-CX9-HOOD', 'Ing. Carlos Mendoza', '2026-10-23 07:15:00'),
    (104, 'MAT-776201', '2026-10-23 07:05:00', 'EMP-2210', 2, 6, 1, 0, 'EMP-2210', 'Esteban Garza L.', 0, 1, 7214, 'CC-SOLDAD', 'ALM-12', 'ETQ-2026-90411', 'FG-CX9-PIL-B', 'Ing. Sandra Lozano', '2026-10-23 07:30:00'),
    (105, 'MAT-554102', '2026-10-23 09:10:00', 'EMP-5531', 6, 4, 1, 0, 'EMP-5531', 'Daniela Ríos P.', 0, 0, 5013, 'CC-FINISH', 'ALM-12', 'ETQ-2026-90414', 'FG-CX9-TG-OUT', NULL, NULL),
    (107, 'MAT-112940', '2026-10-23 09:30:00', 'EMP-8840', 4, 25, 1, 0, 'EMP-8840', 'Fernando Ruiz T.', 0, 0, 4145, 'CC-CALIDAD', 'ALM-05', 'ETQ-2026-90415', 'FG-RAW-ST-COIL', NULL, NULL),
    (101, 'MAT-849201', '2026-10-22 15:20:00', 'EMP-3041', 1, 12, 1, 0, 'EMP-3041', 'Jorge Martínez R.', 1, 1, 5001, 'CC-ESTAMP', 'ALM-99', 'ETQ-2026-90390', 'FG-CX9-FND-LH', 'Ing. Carlos Mendoza', '2026-10-22 16:00:00'),
    (103, 'MAT-334109', '2026-10-22 17:40:00', 'EMP-1984', 1, 5, 1, 0, 'EMP-1984', 'Miguel Ángel Cruz', 0, 2, 5011, 'CC-SOLDAD', 'ALM-12', 'ETQ-2026-90395', 'FG-CX9-DR-RR', 'Ing. Carlos Mendoza', '2026-10-22 18:10:00'),
    (102, 'MAT-661204', '2026-10-23 10:00:00', 'EMP-1102', 8, 2, 1, 0, 'EMP-1102', 'Alejandro Vega', 0, 0, 5004, 'CC-ESTAMP', 'ALM-02', 'ETQ-2026-90416', 'FG-CX9-ROOF', NULL, NULL);
    PRINT '>> Registros de ejemplo insertados en dbo.Movimientos.';
END
GO
