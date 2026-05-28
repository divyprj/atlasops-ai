@echo off
echo.
echo  ============================================
echo   AtlasOps AI - Installation
echo   Operational Intelligence Infrastructure
echo  ============================================
echo.

:: Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo  [ERROR] Node.js is not installed.
    echo  Please install Node.js 18+ from https://nodejs.org
    exit /b 1
)

:: Show Node version
for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo  [OK] Node.js %NODE_VER% detected

:: Check npm
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo  [ERROR] npm is not installed.
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VER=%%i
echo  [OK] npm v%NPM_VER% detected

echo.
echo  Installing dependencies...
echo.
call npm install

if %ERRORLEVEL% neq 0 (
    echo.
    echo  [ERROR] Dependency installation failed.
    exit /b 1
)

echo.
echo  Validating TypeScript configuration...
call npx tsc --noEmit >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo  [WARN] TypeScript validation has warnings. Run 'npx tsc --noEmit' for details.
) else (
    echo  [OK] TypeScript configuration valid
)

:: Create .env.local if not exists
if not exist .env.local (
    echo  Creating .env.local from template...
    copy .env.example .env.local >nul 2>nul
    echo  [OK] .env.local created - configure your API keys
) else (
    echo  [OK] .env.local already exists
)

echo.
echo  ============================================
echo   Installation Complete
echo  ============================================
echo.
echo   Next steps:
echo     1. Configure .env.local with your API keys
echo     2. Run start.bat to launch dev server
echo     3. Upload a dataset to begin analysis
echo.
echo   Datasets available in /datasets folder:
echo     - ecommerce_orders.csv  (120 records)
echo     - saas_metrics.csv      (60 records)
echo     - travel_operations.csv (100 records)
echo     - logistics_operations.csv (110 records)
echo.
pause
