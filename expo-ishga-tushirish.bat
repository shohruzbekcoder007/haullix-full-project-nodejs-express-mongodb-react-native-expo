@echo off
chcp 65001 >nul
cd /d "%~dp0haullix-mobile-expo"
if not exist node_modules call npm install
call npx expo start --web
pause
