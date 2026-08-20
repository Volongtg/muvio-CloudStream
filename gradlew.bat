@echo off
setlocal
set "VER=9.3.1"
if "%GRADLE_USER_HOME%"=="" set "GRADLE_USER_HOME=%USERPROFILE%\.gradle"
set "BASE=%GRADLE_USER_HOME%\gradle-bootstrap"
set "ZIP=%BASE%\gradle-%VER%-bin.zip"
set "DIST=%BASE%\gradle-%VER%"
set "URL=https://services.gradle.org/distributions/gradle-%VER%-bin.zip"

if not exist "%DIST%\bin\gradle.bat" (
  if not exist "%BASE%" mkdir "%BASE%"
  if not exist "%ZIP%" powershell -NoProfile -Command "Invoke-WebRequest -UseBasicParsing '%URL%' -OutFile '%ZIP%'"
  powershell -NoProfile -Command "Expand-Archive -Force '%ZIP%' '%BASE%'"
)
call "%DIST%\bin\gradle.bat" %*
