# IMTEN — первая настройка. Запускается ОДИН РАЗ.
# Запуск: двойной клик по start.bat (он откроет это окно).

$ErrorActionPreference = "Stop"

# Кодировка для русских букв в консоли
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Перейти в папку, где лежит скрипт (на случай, если запустили не из корня)
try {
  Set-Location -Path $PSScriptRoot
} catch { }

function Pause-Exit {
  param([int]$code = 0)
  Write-Host ""
  Write-Host "Нажми Enter, чтобы закрыть окно."
  Read-Host | Out-Null
  exit $code
}

try {
  Write-Host ""
  Write-Host "========================================================" -ForegroundColor Cyan
  Write-Host "  IMTEN - первая настройка GitHub-репозитория" -ForegroundColor Cyan
  Write-Host "========================================================" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "Папка проекта: $((Get-Location).Path)" -ForegroundColor Gray
  Write-Host ""

  # ---- 1. Проверка git ----
  Write-Host "[1/4] Проверяю, установлен ли git..." -ForegroundColor Yellow
  $gitOk = $false
  try {
    $gitVersion = & git --version 2>$null
    if ($LASTEXITCODE -eq 0) {
      Write-Host "      OK: $gitVersion" -ForegroundColor Green
      $gitOk = $true
    }
  } catch { }

  if (-not $gitOk) {
    Write-Host "      Git не найден в системе." -ForegroundColor Red
    Write-Host ""
    Write-Host "      Установи Git одним из способов:" -ForegroundColor Yellow
    Write-Host "      1) В PowerShell от админа: winget install --id Git.Git -e --source winget"
    Write-Host "      2) Скачай и установи: https://git-scm.com/download/win"
    Write-Host ""
    Write-Host "      После установки закрой это окно и запусти start.bat заново." -ForegroundColor Yellow
    Pause-Exit 1
  }

  # ---- 2. Запрос токена ----
  Write-Host ""
  Write-Host "[2/4] Введи GitHub Personal Access Token (PAT)" -ForegroundColor Yellow
  Write-Host "      (тот, который прислал в чат: ghp_0EsqDuMAH...)" -ForegroundColor Gray
  Write-Host ""
  $pat = Read-Host "      Вставь токен сюда и нажми Enter"
  $pat = $pat.Trim()
  if (-not ($pat.StartsWith("ghp_") -or $pat.StartsWith("github_pat_"))) {
    Write-Host ""
    Write-Host "      Это не похоже на GitHub-токен (должен начинаться с ghp_ или github_pat_)." -ForegroundColor Red
    Write-Host "      Скопируй токен полностью и запусти скрипт заново." -ForegroundColor Yellow
    Pause-Exit 1
  }
  Write-Host "      OK, токен принял." -ForegroundColor Green

  # ---- 3. Git init + remote ----
  Write-Host ""
  Write-Host "[3/4] Настраиваю git-репозиторий..." -ForegroundColor Yellow

  if (Test-Path ".git") {
    Write-Host "      .git уже существует - пропускаю init." -ForegroundColor Gray
  } else {
    & git init -b main | Out-Null
    Write-Host "      git init - OK" -ForegroundColor Green
  }

  & git config user.email "datatelek@gmail.com" | Out-Null
  & git config user.name "Ilya Larshin" | Out-Null

  $existingRemote = & git remote 2>$null
  if ($existingRemote -match "origin") {
    & git remote remove origin | Out-Null
  }
  & git remote add origin "https://datatelek:$pat@github.com/datatelek/imten-site.git" | Out-Null
  Write-Host "      remote origin - OK" -ForegroundColor Green

  # ---- 4. Commit + push ----
  Write-Host ""
  Write-Host "[4/4] Делаю commit и push в GitHub..." -ForegroundColor Yellow

  & git add -A | Out-Null
  $status = & git status --short
  $hasChanges = $status -and ($status -join "" -ne "")

  if ($hasChanges) {
    $count = ($status -split "`n").Count
    Write-Host "      Файлов в коммите: $count" -ForegroundColor Gray
    & git commit -m "Init: MVP сайта imten.ru на Astro 4" 2>&1 | Out-Null
  } else {
    Write-Host "      Нет изменений (видимо, всё уже закоммичено)." -ForegroundColor Gray
  }

  Write-Host "      Пушу в origin/main..." -ForegroundColor Gray
  $pushOutput = & git push -u origin main 2>&1
  $pushExitCode = $LASTEXITCODE

  if ($pushExitCode -ne 0) {
    Write-Host ""
    Write-Host "      Push не удался. Вывод:" -ForegroundColor Red
    Write-Host $pushOutput -ForegroundColor Red
    Write-Host ""
    Write-Host "      Возможные причины:" -ForegroundColor Yellow
    Write-Host "      - неверный PAT или у него нет прав 'repo' и 'workflow'"
    Write-Host "      - репозиторий не существует или не пустой"
    Write-Host "      - проблемы с интернетом"
    Pause-Exit 1
  }

  Write-Host "      Push успешный!" -ForegroundColor Green

  # Прячем токен в remote (git Credential Manager его уже запомнил)
  & git remote set-url origin "https://github.com/datatelek/imten-site.git" | Out-Null

  # ---- Финал ----
  Write-Host ""
  Write-Host "========================================================" -ForegroundColor Cyan
  Write-Host "  ВСЁ ГОТОВО! Push прошёл." -ForegroundColor Green
  Write-Host "========================================================" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "ОСТАЛОСЬ ОДНО ДЕЙСТВИЕ (важно):" -ForegroundColor Yellow
  Write-Host ""
  Write-Host "  1. Открой в браузере:" -ForegroundColor White
  Write-Host "     https://github.com/datatelek/imten-site/settings/pages" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "  2. В поле Source выбери: GitHub Actions" -ForegroundColor White
  Write-Host "     (не Deploy from a branch!)" -ForegroundColor Gray
  Write-Host ""
  Write-Host "  3. Если есть кнопка Save - нажми её." -ForegroundColor White
  Write-Host ""
  Write-Host "После этого подожди 1-2 минуты и открой:" -ForegroundColor White
  Write-Host "  https://github.com/datatelek/imten-site/actions" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "Когда workflow станет зелёным - сайт жив по адресу:" -ForegroundColor White
  Write-Host "  https://datatelek.github.io/imten-site/" -ForegroundColor Green
  Write-Host ""
  Write-Host "ДАЛЬШЕ:" -ForegroundColor Yellow
  Write-Host "  Когда Claude обновит файлы - двойной клик по push.ps1" -ForegroundColor White
  Write-Host "  (или запусти через тот же start.bat по аналогии)" -ForegroundColor White
  Write-Host ""

  Pause-Exit 0

} catch {
  Write-Host ""
  Write-Host "========================================================" -ForegroundColor Red
  Write-Host "  ОШИБКА:" -ForegroundColor Red
  Write-Host "========================================================" -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  Write-Host ""
  Write-Host "Скопируй это сообщение и пришли Claude." -ForegroundColor Yellow
  Pause-Exit 1
}
