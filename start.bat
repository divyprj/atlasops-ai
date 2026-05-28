@echo off
echo.
echo  ============================================
echo   AtlasOps AI - Development Server
echo   Operational Intelligence Infrastructure
echo  ============================================
echo.

:: Verify node_modules
if not exist node_modules (
    echo  [ERROR] Dependencies not installed.
    echo  Run install.bat first.
    pause
    exit /b 1
)

:: Show environment
for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo  Runtime:     Node.js %NODE_VER%
echo  Framework:   Next.js 15
echo  Analytics:   6 deterministic engines
echo  LLM:         Groq llama-3.3-70b (optional)
echo.

:: Check Groq key
findstr /C:"GROQ_API_KEY" .env.local >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo  Groq LLM:    Configured
) else (
    echo  Groq LLM:    Not configured (statistical analytics only)
)

echo.
echo  Starting development server...
echo  Local:       http://localhost:3000
echo  Network:     Available on your local network
echo.
echo  Press Ctrl+C to stop the server
echo  ============================================
echo.

call npm run dev
