@echo off
setlocal EnableDelayedExpansion

REM ================================================================
REM Batch Script to start a Docker container for a local PostgreSQL DB.
REM ================================================================

REM Set your container name.
set "DB_CONTAINER_NAME=study-abroad-postgres"

REM ------------------------------
REM 1. Check if Docker is installed.
REM ------------------------------
where docker >nul 2>&1
if errorlevel 1 (
    echo Docker is not installed. Please install Docker and try again.
    echo Docker install guide: https://docs.docker.com/engine/install/
    exit /b 1
)

REM -----------------------------------------------------------
REM 2. Check if the container is already running (suppress stderr).
REM -----------------------------------------------------------
set "RUNNING_CONTAINER="
for /f "tokens=* delims=" %%i in ('docker ps -q -f "name=%DB_CONTAINER_NAME%" 2^>nul') do (
    set "RUNNING_CONTAINER=%%i"
)
if not "!RUNNING_CONTAINER!"=="" (
    echo Database container "%DB_CONTAINER_NAME%" already running.
    exit /b 0
)

REM ---------------------------------------------------------
REM 3. Check if the container exists but is stopped (suppress stderr).
REM ---------------------------------------------------------
set "EXISTING_CONTAINER="
for /f "tokens=* delims=" %%i in ('docker ps -aq -f name=%DB_CONTAINER_NAME% 2^>nul') do (
    set "EXISTING_CONTAINER=%%i"
)
if not "!EXISTING_CONTAINER!"=="" (
    docker start %DB_CONTAINER_NAME% >nul 2>&1
    echo Existing database container "%DB_CONTAINER_NAME%" started.
    exit /b 0
)

REM -----------------------------------------------------------
REM 4. Import DATABASE_URL from .env.
REM    Expected format:
REM    DATABASE_URL=postgres://postgres:password@localhost:5433/study-abroad
REM -----------------------------------------------------------
set "DATABASE_URL="
for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
    if /i "%%a"=="DATABASE_URL" set "DATABASE_URL=%%b"
)

if "%DATABASE_URL%"=="" (
    echo DATABASE_URL not found in .env file.
    exit /b 1
)

REM -----------------------------------------------------------
REM 5. Parse DATABASE_URL to extract DB_PASSWORD and DB_PORT.
REM -----------------------------------------------------------
REM For URL: postgres://postgres:password@localhost:5433/study-abroad
REM   - The password is in token 3 when splitting by ':'.
REM   - The port is in token 4 (after ':') before the '/'.
for /f "tokens=3 delims=:" %%a in ("%DATABASE_URL%") do set "tmp=%%a"
for /f "tokens=1 delims=@" %%a in ("%tmp%") do set "DB_PASSWORD=%%a"

for /f "tokens=4 delims=:" %%a in ("%DATABASE_URL%") do set "tmp2=%%a"
for /f "tokens=1 delims=/" %%a in ("%tmp2%") do set "DB_PORT=%%a"

REM -----------------------------------------------------------
REM 7. Run the Docker container.
REM -----------------------------------------------------------
docker run -d --name %DB_CONTAINER_NAME% -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=%DB_PASSWORD% -e POSTGRES_DB=study-abroad -p %DB_PORT%:5432 postgres

if errorlevel 1 (
    echo Failed to create database container.
    exit /b 1
)

echo Database container "%DB_CONTAINER_NAME%" was successfully created.
endlocal
