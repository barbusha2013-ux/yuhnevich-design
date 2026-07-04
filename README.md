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

1. В Decap CMS или в `content/site.json` проверить контактный email `hello@yuhnevich.com`.
2. При необходимости заменить строки `Behance · LinkedIn · Instagram` на реальные ссылки.
3. В `index.html` обновить SEO-текст в `<title>`, `description` и `og:*`, если нужен другой текст для поисковиков и соцсетей.
4. В `admin/config.yml` проверить строку `repo: barbusha2013-ux/yuhnevich-design`. Она должна совпадать с реальным GitHub-репозиторием.

## Как выложить с редактированием

Рекомендуемый путь:

1. Создать GitHub-репозиторий `yuhnevich-design`.
2. Загрузить в него содержимое этой папки.
3. В Netlify выбрать Add new project → Import from Git и подключить этот репозиторий.
4. Для Netlify указать: build command пустой, publish directory `.`.
5. В GitHub OAuth App указать callback URL: `https://yuhnevich.com/callback`.
6. В Netlify добавить environment variables для OAuth:
   - `GITHUB_OAUTH_ID`
   - `GITHUB_OAUTH_SECRET`
   - `GITHUB_REPO_PRIVATE=0`
7. После публикации открыть `https://адрес-сайта/admin/` и войти через GitHub.

## Подключение домена `yuhnevich.com`

Сайт опубликован в Netlify как `yuhnevich-design.netlify.app`. Основной домен: `https://yuhnevich.com/`.

1. В Netlify открыть проект `yuhnevich-design` -> Domain management -> Production domains.
2. Добавить custom domain `yuhnevich.com` и сделать его primary domain. Netlify также добавит `www.yuhnevich.com`.
3. В GitHub OAuth App `yuhnevich-design-cms` обновить Authorization callback URL на `https://yuhnevich.com/callback`.
4. В Cloudflare добавить сайт `yuhnevich.com` в аккаунт, выбрать Free plan и дождаться пары nameserver-ов Cloudflare.
5. В Spaceship у домена `yuhnevich.com` заменить nameserver-ы на те два значения, которые выдал Cloudflare.
6. В Cloudflare -> DNS -> Records добавить записи для Netlify:
   - `CNAME` для `@` -> `apex-loadbalancer.netlify.com`, Proxy status: DNS only.
   - `CNAME` для `www` -> `yuhnevich-design.netlify.app`, Proxy status: DNS only.
7. В Netlify нажать Verify DNS configuration и дождаться HTTPS-сертификата.

## Почта `hello@yuhnevich.com`

Переадресация делается через Cloudflare Email Routing на `barbusha2013@gmail.com`.

1. В Cloudflare открыть `yuhnevich.com` -> Compute -> Email Service -> Email Routing.
2. Onboard Domain и разрешить Cloudflare автоматически добавить Email Routing DNS records.
3. Проверить, что Cloudflare добавил MX-записи на `route1.mx.cloudflare.net`, `route2.mx.cloudflare.net`, `route3.mx.cloudflare.net`, SPF TXT `v=spf1 include:_spf.mx.cloudflare.net ~all` и DKIM TXT, который Cloudflare выдаст для домена.
4. В Destination Addresses добавить `barbusha2013@gmail.com`.
5. Открыть письмо от Cloudflare в Gmail и подтвердить адрес. До подтверждения правило будет выключено.
6. В Routing Rules создать правило: email pattern `hello`, domain `yuhnevich.com`, action `Send to an email`, destination `barbusha2013@gmail.com`.
7. Отправить тестовое письмо на `hello@yuhnevich.com` и проверить входящие/спам в Gmail.

Важно: для нового проекта не используем Netlify Git Gateway, потому что Netlify помечает его как deprecated. Decap настроен через GitHub backend и собственный Netlify Function OAuth proxy: пользователь админки должен иметь право push в репозиторий.

## Как будут применяться правки

1. Вы меняете текст или проект в `/admin/`.
2. Decap сохраняет изменение в `content/site.json` и делает commit в GitHub.
3. Netlify автоматически публикует новую версию сайта.

## Почему это не Framer-файл

Исходный `Barbara Yukhnjevich - Home.dc.html` был прототипом Claude Design с тегами `x-dc`, `sc-for`, `sc-if` и рантаймом `support.js`. Эта версия больше не зависит от этих прототипных тегов и готова для обычного статического хостинга. Для настоящего визуального редактирования во Framer сайт нужно пересобрать внутри Framer как нативные секции/CMS.
