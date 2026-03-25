# Monitoring Ringan (Step 2)

## Tujuan
Cek cepat status web + API tanpa setup observability yang kompleks.

## Script
- `scripts/healthcheck-light.ps1`

## Cara pakai (manual)
```powershell
pwsh -File scripts/healthcheck-light.ps1
```
atau di PowerShell Windows:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/healthcheck-light.ps1
```

## Exit code
- `0` = sehat
- `2` = ada service gagal

## Output
- WEB_RESTOMAP
- WEB_RESTOBUILDER
- API_ROOT

## Quick Fix jika gagal
- Restart API:
```powershell
cd apps/api; npm run dev
```
- Restart Web:
```powershell
cd apps/web; npm run dev
```

## (Opsional) Jalankan berkala via Task Scheduler
- Trigger: setiap 15 menit
- Action: jalankan command healthcheck script
- Simpan output ke log file jika perlu.
