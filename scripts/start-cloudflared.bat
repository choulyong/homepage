@echo off
REM Cloudflared Tunnel Auto-Start Script
REM This script starts the Cloudflared tunnel on system boot

echo [%date% %time%] Starting Cloudflared Tunnel... >> C:\cloudflared-startup.log

REM Wait for network connectivity
timeout /t 10 /nobreak >nul

REM Start Cloudflared Tunnel
cd C:\Users\choul\.cloudflared
cloudflared tunnel run n8n-tunnel

echo [%date% %time%] Cloudflared Tunnel started >> C:\cloudflared-startup.log
