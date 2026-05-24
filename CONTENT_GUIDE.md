# Как править контент imten.ru

Все тексты живут в `src/content/`. Каждая страница — один `.md` файл с **YAML frontmatter** (между `---` ... `---`) и **Markdown-телом** ниже.

## Структура `.md` файла на примере

```markdown
---
title: "Название страницы — что увидит браузер"
slug: "context-ads/yandex-direct"
url: "/services/context-ads/yandex-direct"

seo:
  title: "Тег <title> до 60 символов"
  description: "Тег <meta description>, 150–160 символов"
  canonical: "https://imten.ru/services/context-ads/yandex-direct"

hero:
  h1: "Большой заголовок страницы"
  subtitle: "Подзаголовок"
  ctas:
    - { label: "Кнопка", href: "#contact-form", primary: true }
  metrics:
    - { value: "87", label: "проектов" }

pains:
  - "Текст боли 1"
  - "Текст боли 2"

included:
  - { title: "Что входит, пункт 1", desc: "Описание" }

process:
  - { num: 1, title: "Шаг 1", desc: "...", days: "1–3 дня" }

pricing:
  intro: "Текст перед тарифами"
  plans:
    - name: "Старт"
      price: "35 000 ₽/мес"
      target: "Кому подходит"
      features: ["Пункт 1", "Пункт 2"]
      highlighted: false

faq:
  - q: "Вопрос?"
    a: "Ответ. \n\nС переносами строк через \\n\\n."

reviews: ["dental-clinic-owner"]
relatedCases: ["dental-clinic", "it-education"]
---

# Заголовок основного текста

Это основной Markdown-текст ниже всех структурированных блоков. Сюда пишем свободно:
обзоры, сравнения, длинные пояснения. Поддерживается всё стандартное Markdown:

- списки
- **жирный**
- _курсив_
- [ссылки](https://example.com)

| Сравнение | Колонка 1 | Колонка 2 |
|---|---|---|
| Параметр | Значение | Значение |

## Подзаголовки H2

Текст разделяется на блоки H2 → H3.
```

---

## Что и где правится

| Что хочется изменить | Где править |
|---|---|
| H1 страницы | `hero.h1` в frontmatter |
| Кнопки CTA в hero | `hero.ctas` (массив) |
| Метрики «9 лет / 87 проектов» | `hero.metrics` |
| Title и Description в выдаче | `seo.title`, `seo.description` |
| OG-картинка | `seo.ogImage` (положить в `public/assets/og/`) |
| Боли клиентов | `pains` (массив строк) |
| Что входит в услугу | `included` (массив `{title, desc}`) |
| Процесс работы | `process` (массив `{num, title, desc, days}`) |
| Тарифы | `pricing.plans` (массив объектов) |
| FAQ | `faq` (массив `{q, a}`) |
| Кейсы для блока «Кейсы по услуге» | `relatedCases` (массив ID кейсов) |
| Длинный текст ниже блоков | После `---` в Markdown |

---

## Frontmatter — обязательные поля

Любая страница в `src/content/pages/` обязана иметь:

- `title` — строка
- `seo.title` — строка до 60 символов
- `seo.description` — строка 150–160 символов

Если забыть — сборка упадёт с ошибкой Zod-валидации (это хорошо: пустых тегов не будет).

---

## Добавить новую страницу услуги

1. Скопировать файл из `src/content/pages/services/`, например, `context-ads--yandex-direct.md`.
2. Переименовать. Формат имени: `{категория}--{слаг}.md` для вложенных, или `{слаг}.md` для верхнего уровня.
3. В frontmatter поправить:
   - `title`
   - `slug` (без «services/», например `context-ads/google-display`)
   - `url` (полный путь, например `/services/context-ads/google-display`)
   - `parent` (slug родителя, если 2-уровневая)
   - `seo.*`
   - `hero.*`
4. Заполнить блоки `pains`, `included`, `process`, `pricing`, `faq`.
5. Указать `relatedCases` — массив slug-ов кейсов из `src/content/cases/`.
6. После `---` написать длинный текст.
7. `npm run build` → проверить, что страница появилась.

---

## Добавить новый кейс

1. В `src/content/cases/` создать файл, например `my-new-case.md`.
2. Frontmatter:
   ```yaml
   ---
   title: "Название кейса"
   client: "Имя клиента или (NDA)"
   industry: "medical"     # один из: medical, realty, ecommerce, education, b2b, logistics, other
   services: ["context-ads"]  # массив slug-ов услуг (без /services/)
   period: "июль 2025"
   budget: "150 000 ₽/мес"
   sortOrder: 80           # порядок в списке (меньше = выше)
   summary: "Короткое описание для карточки"

   hero:
     h1: "Заголовок кейса"
     metrics:
       - { value: "326", label: "лидов", growth: "+x10" }

   seo:
     title: "..."
     description: "..."
   ---

   ## Задача
   Описание проблемы клиента.

   ## Что мы сделали
   ...

   ## Результаты
   ...
   ```
3. Кейс автоматически появится:
   - на `/cases` в общем списке;
   - в блоке «Кейсы по услуге» на странице каждой услуги из `services`;
   - в блоке «Кейсы в этой нише» на странице индустрии (по `industry`).

---

## Добавить статью в блог

1. В `src/content/blog/` создать `my-post.md`:
   ```yaml
   ---
   title: "Название статьи"
   description: "Краткое описание для блока «другие статьи» и для соцсетей"
   pubDate: 2026-06-01
   updatedDate: 2026-06-10  # опционально
   tags: ["seo", "wordpress"]
   cover: "/assets/og/my-post.png"  # опционально
   ---

   Текст статьи в Markdown.
   ```
2. После сборки статья появится на `/blog`.
3. Чтобы временно скрыть — `draft: true` в frontmatter.

---

## Картинки

- Кладёшь в `public/assets/images/`.
- Ссылаешься в Markdown как `![alt](/assets/images/file.webp)`.
- Старайся сразу в WebP (через TinyPNG, Squoosh).
- Для OG-картинок — 1200×630, в `public/assets/og/`.

---

## Я.Метрика и счётчики

Я.Метрика 16455472 подключена через Partytown в `src/layouts/BaseLayout.astro`.
Если нужно добавить GTM / Meta Pixel / Clarity — туда же, через `<script type="text/partytown">`.

---

## Что НЕ делать

- Не править файлы в `src/components/` и `src/layouts/` без понимания Astro — это сломает разом 30+ страниц.
- Не править `astro.config.mjs` без необходимости.
- Не коммитить файлы из `dist/` или `node_modules/` (они в `.gitignore`).
- Не вставляй сырой HTML в Markdown без необходимости — это сломает рендеринг шаблонов.
- Не удаляй обязательные поля из frontmatter — сборка упадёт.
