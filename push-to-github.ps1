# Push CABAS HUB to GitHub (run in PowerShell)
# Your repo: https://github.com/Azizmohamedlarbi/cabas-hub

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "Step 1: Refresh GitHub login with repo permission (a browser window will open)..." -ForegroundColor Cyan
gh auth refresh -h github.com -s repo

Write-Host "`nStep 2: Pushing code to GitHub..." -ForegroundColor Cyan
git push -u origin main

Write-Host "`nDone. Repo: https://github.com/Azizmohamedlarbi/cabas-hub" -ForegroundColor Green
Write-Host "Next: Go to vercel.com -> Add New -> Project -> Import 'cabas-hub' -> Add env vars -> Deploy" -ForegroundColor Yellow
