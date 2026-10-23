@echo off
TITLE SCRAP Dashboard MES Industrial - Suite Completa
echo ======================================================================
echo    INICIANDO SUITE SCRAP DASHBOARD INDUSTRIAL (MES & SQL SERVER)
echo ======================================================================
echo 1. Verificando dependencias y compilacion...
call npm run build
if %errorlevel% neq 0 (
    echo Error en compilacion. Ejecutando instalacion completa...
    call npm run install:all
    call npm run build
)
echo.
echo 2. Iniciando Backend (Puerto 3001) y Frontend (Puerto 5173)...
echo.
call npm run dev
pause
