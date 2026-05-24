# IMTEN — быстрый push в GitHub (Windows PowerShell)
# Запуск: правый клик → "Run with PowerShell" или ./push.ps1 в терминале
# Что делает: git add -A → commit → push. GitHub Actions сам соберёт сайт.

$ErrorActionPreference = "Stop"

$msg = if ($args.Count -gt 0) { $args -join " " } else { "Update $(Get-Date -Format 'yyyy-MM-dd HH:mm')" }

Write-Host "→ git add -A" -ForegroundColor Cyan
git add -A

$status = git status --short
if (-not $status) {
  Write-Host "Нечего пушить — нет изменений." -ForegroundColor Yellow
  exit 0
}

Write-Host "→ Изменённые файлы:" -ForegroundColor Cyan
Write-Host $status

Write-Host "→ git commit -m `"$msg`"" -ForegroundColor Cyan
git commit -m $msg

Write-Host "→ git push" -ForegroundColor Cyan
git push

Write-Host ""
Write-Host "Готово. GitHub Actions начал сборку:" -ForegroundColor Green
Write-Host "  https://github.com/datatelek/imten-site/actions" -ForegroundColor Green
Write-Host "Когда workflow станет зелёным (через 1–2 мин), сайт обновится:" -ForegroundColor Green
Write-Host "  https://datatelek.github.io/imten-site/" -ForegroundColor Green
