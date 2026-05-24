# Первый push — 5 минут, делается один раз

После этого все мои правки будут автоматически выкатываться при запуске `push.ps1`.

## Шаг 1. Проверь что у тебя установлено

В PowerShell:

```powershell
git --version
node --version
```

Если git нет — `winget install Git.Git`, потом перезапусти PowerShell.
Node нужен только для **локального превью** (`npm run dev`), для push в GitHub он не обязателен.

## Шаг 2. Включи GitHub Pages в твоём репо

1. Открой <https://github.com/datatelek/imten-site/settings/pages>
2. **Source** → выбери «**GitHub Actions**» (не «Deploy from a branch»)
3. Сохрани

## Шаг 3. Первый push

Открой PowerShell **в папке `imten`** (там, где лежат `package.json`, `astro.config.mjs`):

```powershell
cd "путь\до\папки\imten"

git init -b main
git config user.email "datatelek@gmail.com"
git config user.name "Ilya Larshin"

git remote add origin https://github.com/datatelek/imten-site.git

git add -A
git commit -m "Init: MVP сайта imten.ru на Astro 4"
git push -u origin main
```

При пуше git попросит логин и пароль:

- **Username:** `datatelek`
- **Password:** твой PAT (тот, что прислал в чат: `ghp_0Esq...`)

> На Windows git может предложить открыть браузер для авторизации — это тоже подойдёт, PAT не нужен.

## Шаг 4. Дождись зелёного билда

После push открой:

<https://github.com/datatelek/imten-site/actions>

Должен пойти workflow «Deploy to GitHub Pages». Длится 1–2 минуты. Когда станет зелёным — сайт доступен:

**🌐 <https://datatelek.github.io/imten-site/>**

## Шаг 5. Дальнейшие итерации

Теперь каждый раз, когда я обновляю файлы в этой папке (`outputs/imten/`), ты делаешь:

```powershell
./push.ps1
```

(или двойной клик по `push.ps1` в проводнике)

Это занимает 5 секунд: add → commit → push. Дальше Actions сам пересоберёт сайт.

## Если что-то пошло не так

| Ошибка | Что делать |
|---|---|
| `Authentication failed` | Проверь, что используешь PAT, а не пароль от GitHub-аккаунта |
| `Permission denied (publickey)` | Используем HTTPS, не SSH — проверь, что `git remote -v` показывает `https://...` |
| `404 не найдена` после билда | Проверь Settings → Pages → Source = GitHub Actions |
| Билд упал в Actions | Открой логи, пришли мне последние 30 строк ошибки |

---

**⚠️ После того как пройдёт первый push — отзови этот PAT и сгенерируй новый.**
Я видел токен в чате, и любой, у кого есть лог чата, тоже его видел. Это базовая гигиена секретов.

Сгенерируй новый PAT и просто перезайди в git Credential Manager — он попросит ввести логин/пароль повторно.
