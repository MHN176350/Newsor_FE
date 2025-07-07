@echo off
REM Build and deployment script for Newsor Frontend (Windows)

setlocal enabledelayedexpansion

echo 🚀 Newsor Frontend Build Script

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Get build type from first argument, default to 'dev'
set BUILD_TYPE=%1
if "%BUILD_TYPE%"=="" set BUILD_TYPE=dev

if "%BUILD_TYPE%"=="dev" (
    echo [INFO] Building development version...
    docker build -f Dockerfile -t newsor-frontend:dev .
    if errorlevel 1 (
        echo [ERROR] Development build failed!
        exit /b 1
    )
    echo [INFO] ✅ Development build completed!
    echo.
    echo To run the development version:
    echo docker run -p 3000:3000 newsor-frontend:dev
) else if "%BUILD_TYPE%"=="prod" (
    echo [INFO] Building production version...
    docker build -f Dockerfile.prod -t newsor-frontend:prod .
    if errorlevel 1 (
        echo [ERROR] Production build failed!
        exit /b 1
    )
    echo [INFO] ✅ Production build completed!
    echo.
    echo To run the production version:
    echo docker run -p 3000:80 newsor-frontend:prod
) else if "%BUILD_TYPE%"=="compose" (
    echo [INFO] Building and starting with Docker Compose...
    docker-compose down --remove-orphans
    docker-compose build
    if errorlevel 1 (
        echo [ERROR] Docker Compose build failed!
        exit /b 1
    )
    docker-compose up -d
    if errorlevel 1 (
        echo [ERROR] Docker Compose up failed!
        exit /b 1
    )
    echo [INFO] ✅ Docker Compose setup completed!
    echo.
    echo Services are running:
    echo - Frontend: http://localhost:3000
    echo.
    echo To view logs: docker-compose logs -f
    echo To stop services: docker-compose down
) else if "%BUILD_TYPE%"=="clean" (
    echo [INFO] Cleaning up Docker images and containers...
    docker-compose down --remove-orphans --volumes
    docker system prune -f
    for /f "tokens=3" %%i in ('docker images ^| findstr newsor-frontend') do docker rmi %%i 2>nul
    echo [INFO] ✅ Cleanup completed!
) else (
    echo [ERROR] Invalid build type. Use: dev, prod, compose, or clean
    echo.
    echo Usage:
    echo   build.bat dev      - Build development version
    echo   build.bat prod     - Build production version (with Nginx)
    echo   build.bat compose  - Build and run with Docker Compose
    echo   build.bat clean    - Clean up Docker resources
    exit /b 1
)

endlocal
