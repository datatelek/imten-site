# imten.ru — статический сайт на Astro 4

Корпоративный сайт digital-агентства IMTEN. Стек: **Astro 4 + Markdown Content Collections + ванильный CSS**. Деплой — статика на TimeWeb shared (Apache + PHP только для формы заявок).

Проект собран строго по ТЗ `2026-05-19-imten-redesign-tz.md`.

---

## TL;DR — как запустить превью

1. Установи Node.js 20+ (рекомендую через nvm-windows или volta).
2. Установка зависимостей:
   ```bash
   cd imten
   npm install
   ```
3. Локальный dev-сервер:
   ```bash
   npm run dev
   ```
   Открыть [http://localhost:4321](http://localhost:4321).
4. **Превью по временной ссылке (Netlify Drop):**
   ```bash
   npm run build
   ```
   → собирается папка `dist/`.
   → открой [app.netlify.com/drop](https://app.netlify.com/drop), перетащи в браузер папку `dist/` целиком.
   → за 30 секунд получишь URL вида `https://random-name-12345.netlify.app`. Ссылка живёт, пока её сам не удалишь.

---

## Что лежит где

```
imten/
├── public/                    # Статика — копируется в dist как есть
│   ├── .htaccess              # Редиректы, кэш, security headers (для TimeWeb)
│   ├── robots.txt
│   ├── manifest.webmanifest
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   └── assets/og/             # OG-картинки для соцсетей (1200×630)
│
├── api/                       # PHP-обработчик формы — копируется в dist/api/
│   ├── contact.php            # Приём заявок → Telegram + email
│   ├── .env.example           # Шаблон для секретов (TG_BOT_TOKEN и т.д.)
│   ├── .env                   # ❗ Создаётся вручную, не в git
│   └── .htaccess              # Запрет доступа к .env и log/ из веба
│
├── src/
│   ├── content/               # ← ВСЕ ТЕКСТЫ ЖИВУТ ЗДЕСЬ
│   │   ├── config.ts          # Zod-схемы для frontmatter
│   │   ├── pages/             # Markdown страниц
│   │   │   ├── _index.md      # Главная
│   │   │   ├── about.md
│   │   │   ├── contacts.md
│   │   │   ├── privacy.md
│   │   │   ├── services/      # 14 файлов услуг
│   │   │   └── industries/    # 6 файлов индустрий + хаб
│   │   ├── cases/             # 7 кейсов
│   │   └── blog/              # Создавать по мере необходимости
│   ├── layouts/               # BaseLayout, ServicePage, IndustryPage, CasePage, BlogPost
│   ├── components/            # Hero, ServiceCard, FAQAccordion, ContactForm, Schema и т.д.
│   ├── pages/                 # Роутинг Astro (.astro файлы)
│   ├── styles/global.css      # Все стили в одном файле
│   └── utils/                 # schema-generators, format
│
├── _source/                   # Снятый контент со старого imten.ru (только для миграции)
├── astro.config.mjs
├── tsconfig.json
├── package.json
├── deploy.sh                  # Скрипт деплоя на TimeWeb через rsync
├── README.md                  # Этот файл
├── CONTENT_GUIDE.md           # Инструкция по правке контента
├── CONTENT_REQUESTS.md        # Что нужно от Ильи (список плейсхолдеров)
└── PROJECT_STATUS.md          # Чек-лист приёмки по ТЗ
```

---

## Требования

- **Node.js ≥ 20** (Astro 4 не работает на 18)
- **npm ≥ 10**
- **PHP ≥ 8.0** на хостинге (для `/api/contact.php`)
- Apache 2.4+ с модулями `mod_rewrite`, `mod_headers`, `mod_deflate`, `mod_expires` — на TimeWeb всё это есть из коробки

---

## Установка и запуск

### Локальная разработка

```bash
git clone <repo>  # или просто перейти в папку
cd imten
npm install      # ставит 200+ пакетов, ~1.5 мин на хорошем интернете
npm run dev      # запускает dev-сервер с HMR на http://localhost:4321
```

### Прод-сборка

```bash
npm run build    # собирает статику в dist/
npm run preview  # запускает dist/ локально на http://localhost:4321
```

После сборки `dist/` содержит:

- HTML всех страниц (статический, готов к раздаче Apache)
- `_astro/` — хешированные JS/CSS-бандлы
- `api/` — PHP-обработчик формы (копируется автоматически через плагин в `astro.config.mjs`)
- `.htaccess` — конфиг Apache
- `sitemap-index.xml` + `sitemap-0.xml` — для поисковиков
- `robots.txt`, `manifest.webmanifest`, `favicon.svg`, `apple-touch-icon.png`

---

## Превью по временной ссылке

Согласовали: **Netlify Drop**. Это самый простой способ — без CLI, без логина, бесплатно.

1. Запусти билд:
   ```bash
   npm run build
   ```
2. Открой в браузере: **<https://app.netlify.com/drop>**
3. Перетащи папку **`dist/`** (целиком, не содержимое) в указанную область.
4. Через 20–30 секунд Netlify вернёт URL вида `https://glowing-shrek-a1b2c3.netlify.app`.
5. Ссылка живёт неограниченно, пока её сам не удалишь.

> **Важно про форму на превью.** На Netlify нет PHP, поэтому `/api/contact.php` отвечать не будет. Это нормально — превью смотрим визуально и по структуре, форму проверяем после деплоя на TimeWeb.

---

## Деплой на TimeWeb

Три варианта, выбирай по вкусу:

### Вариант A. SFTP вручную

1. `npm run build`
2. Открой SFTP-клиент (FileZilla, Cyberduck, VS Code SSH).
3. Подключись к TimeWeb (хост, логин, пароль — в панели управления).
4. Удали старое содержимое `public_html/` (предварительно сделай бэкап через панель TimeWeb).
5. Загрузи **содержимое** `dist/` (а не саму папку) в `public_html/`.
6. Не забудь скопировать `dist/.htaccess` (FTP-клиенты иногда скрывают точечные файлы).
7. Создай на сервере `public_html/api/.env` с реальными секретами (см. `api/.env.example`). Через .htaccess он закрыт от веба, но проверь curl-ом, что отвечает 403.

### Вариант B. Git на TimeWeb

В панели TimeWeb → раздел Git → подключи репозиторий. TimeWeb забирает уже собранный `dist/` (билд должен делаться в CI или локально, потом commit `dist/`).

> Сейчас в `.gitignore` стоит `dist/` — если используешь этот вариант, временно его уберёшь или сделаешь отдельную ветку `deploy` с собранной статикой.

### Вариант C. Скрипт `deploy.sh` (быстрее всех при ручных правках)

В корне проекта есть `deploy.sh`:

```bash
./deploy.sh
```

Он делает `npm run build` + `rsync` в `public_html/` на TimeWeb. Перед первым запуском:

1. Сгенерируй SSH-ключ и добавь его в TimeWeb (Панель → SSH).
2. Открой `deploy.sh` и подставь свои `TIMEWEB_USER` и `TIMEWEB_HOST`.
3. `chmod +x deploy.sh`.

---

## Настройка `/api/contact.php`

1. На сервере создай файл `public_html/api/.env`:
   ```env
   TG_BOT_TOKEN=12345678:AAAA-замени-на-реальный
   TG_CHAT_ID=123456789
   MAIL_TO=i@imten.ru
   MAIL_FROM=noreply@imten.ru
   ```
2. Создай Telegram-бота через [@BotFather](https://t.me/BotFather), получи токен.
3. Узнай `chat_id` своего чата через [@userinfobot](https://t.me/userinfobot) или сделай тестовый POST через curl.
4. Проверь, что секреты не светятся из веба:
   ```bash
   curl -I https://imten.ru/api/.env   # должен быть 403
   curl -I https://imten.ru/api/log/   # должен быть 403
   ```
5. Сделай тестовую заявку через форму — должно прийти в Telegram + на email.

---

## Чек-лист пост-деплоя

- [ ] Все URL из карты ТЗ возвращают 200
- [ ] Старые URL (например, `/services.html`) возвращают 301 на новые
- [ ] HTTPS работает, HSTS включён
- [ ] Я.Метрика 16455472 фиксирует визиты (отчёт «По минутам»)
- [ ] Форма отправляет в Telegram и на email
- [ ] `curl -I https://imten.ru/_astro/global.HASH.css` → `Cache-Control: public, max-age=31536000, immutable`
- [ ] [securityheaders.com](https://securityheaders.com/?q=imten.ru) ≥ A
- [ ] Lighthouse Performance ≥ 90 на mobile, ≥ 95 на desktop
- [ ] Сайт добавлен в Я.Вебмастер и Google Search Console, sitemap отправлен

---

## Что НЕ сделано (намеренно, по ТЗ)

- Дизайн «с нуля» — взят референс структуры, чистый функциональный CSS. Если нужен премиум-дизайн — отдельная итерация с дизайнером.
- Контент по 10 страницам услуг и 6 индустриям написан в виде stub с пометками `{{ЗАПРОС_КОНТЕНТА}}` — список см. `CONTENT_REQUESTS.md`.
- Не настроены CRM-интеграции (Bitrix24/amoCRM) — отдельная задача.
- Блог пустой — добавишь статьи по мере необходимости.

---

## Дальнейшие шаги

См. `PROJECT_STATUS.md` — там полный чек-лист приёмки и что осталось.
