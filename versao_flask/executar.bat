@echo off
title Passagem de Turno MKTZAP
echo ===================================================
echo     Iniciando Servidor Flask - Passagem de Turno
echo ===================================================
echo.
echo 1. Abrindo o navegador em http://127.0.0.1:5000 ...
timeout /t 2 /nobreak >nul
start http://127.0.0.1:5000
echo 2. Executando app.py ...
python app.py
pause
