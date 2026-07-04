# Barbara Yukhnjevich Portfolio Site

Это статическая версия сайта с подготовленной админкой Decap CMS. Сайт можно выложить на Netlify, а тексты, услуги, проекты, фильтры и основные настройки редактировать через `/admin/`.

## Что редактировать

- `content/site.json` — основной редактируемый контент сайта. Его меняет Decap CMS.
- `admin/config.yml` — настройки админки. Здесь нужно проверить строку `repo`.
- `assets/styles.css` — визуальный стиль, адаптивность, цвета и сетки.
- `uploads/ilovepdf_images-extracted/` — изображения работ.
- `uploads/portfolio YBA_compressed.pdf` — PDF-портфолио, если понадобится добавить кнопку скачивания.
- `assets/content.js` — запасная копия контента для локального открытия без сервера; опубликованный сайт читает `content/site.json`.

## Что заменить перед публикацией

1. В Decap CMS или в `content/site.json` заменить `hello@example.com` на реальный email.
2. При необходимости заменить строки `Behance · LinkedIn · Instagram` на реальные ссылки.
3. В `index.html` обновить SEO-текст в `<title>`, `description` и `og:*`, если нужен другой текст для поисковиков и соцсетей.
4. В `admin/config.yml` проверить строку `repo: darkedid89/barbara-yukhnjevich-site`. Она должна совпадать с реальным GitHub-репозиторием.

## Как выложить с редактированием

Рекомендуемый путь:

1. Создать GitHub-репозиторий `barbara-yukhnjevich-site`.
2. Загрузить в него содержимое этой папки.
3. В Netlify выбрать Add new project → Import from Git и подключить этот репозиторий.
4. Для Netlify указать: build command пустой, publish directory `.`.
5. В GitHub OAuth App указать callback URL: `https://barbara-yukhnjevich-site.netlify.app/callback`.
6. В Netlify добавить environment variables для OAuth:
   - `GITHUB_OAUTH_ID`
   - `GITHUB_OAUTH_SECRET`
   - `GITHUB_REPO_PRIVATE=0`
7. После публикации открыть `https://адрес-сайта/admin/` и войти через GitHub.

Важно: для нового проекта не используем Netlify Git Gateway, потому что Netlify помечает его как deprecated. Decap настроен через GitHub backend и собственный Netlify Function OAuth proxy: пользователь админки должен иметь право push в репозиторий.

## Как будут применяться правки

1. Вы меняете текст или проект в `/admin/`.
2. Decap сохраняет изменение в `content/site.json` и делает commit в GitHub.
3. Netlify автоматически публикует новую версию сайта.

## Почему это не Framer-файл

Исходный `Barbara Yukhnjevich - Home.dc.html` был прототипом Claude Design с тегами `x-dc`, `sc-for`, `sc-if` и рантаймом `support.js`. Эта версия больше не зависит от этих прототипных тегов и готова для обычного статического хостинга. Для настоящего визуального редактирования во Framer сайт нужно пересобрать внутри Framer как нативные секции/CMS.
