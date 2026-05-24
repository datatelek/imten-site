#!/usr/bin/env bash
# IMTEN — деплой статики на TimeWeb через rsync.
# Запуск: ./deploy.sh
# Перед первым запуском:
#  1. Сгенерируй SSH-ключ и добавь его в TimeWeb (Панель → SSH).
#  2. Подставь TIMEWEB_USER и TIMEWEB_HOST ниже (или вынеси в ~/.ssh/config).
#  3. chmod +x deploy.sh

set -euo pipefail

# ============ КОНФИГ — подставь свои значения ============
TIMEWEB_USER="user-cdXXXX"                      # логин SSH TimeWeb
TIMEWEB_HOST="ssh.timeweb.com"                  # или конкретный сервер
REMOTE_PATH="/home/${TIMEWEB_USER}/imten.ru/public_html/"
# =========================================================

echo "→ Сборка статики (npm run build)"
npm run build

echo
echo "→ Деплой rsync → ${TIMEWEB_USER}@${TIMEWEB_HOST}:${REMOTE_PATH}"
rsync -avz --delete \
  --exclude '.env' \
  --exclude 'api/.env' \
  --exclude 'api/log' \
  dist/ "${TIMEWEB_USER}@${TIMEWEB_HOST}:${REMOTE_PATH}"

echo
echo "✓ Готово. Проверь https://imten.ru"
echo "  Не забудь, что api/.env создаётся на сервере вручную (исключён из rsync)."
