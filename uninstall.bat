@echo off
echo.
echo  ============================================
echo   AtlasOps AI - Cleanup
echo   Removing build artifacts and dependencies
echo  ============================================
echo.

echo  Removing node_modules...
if exist node_modules rmdir /s /q node_modules
echo  [OK] node_modules removed

echo  Removing build output...
if exist .next rmdir /s /q .next
echo  [OK] .next removed

if exist out rmdir /s /q out
if exist build rmdir /s /q build

echo  Removing TypeScript build cache...
if exist tsconfig.tsbuildinfo del tsconfig.tsbuildinfo
echo  [OK] Build cache cleared

echo  Removing npm cache...
call npm cache clean --force >nul 2>nul
echo  [OK] npm cache cleared

echo.
echo  ============================================
echo   Cleanup Complete
echo  ============================================
echo.
echo   Note: .env.local and datasets were preserved.
echo   To fully reset, delete .env.local manually.
echo.
echo   To reinstall, run install.bat
echo.
pause
