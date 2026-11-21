# SEO и языковые версии сайта

## Как устроено

| Адрес | Язык | Файл |
|---|---|---|
| `https://wapny.github.io/church-website/` | RU (основной, x-default) | `index.html` — **исходник, правится вручную** |
| `https://wapny.github.io/church-website/lv/` | LV | `lv/index.html` — генерируется |
| `https://wapny.github.io/church-website/en/` | EN | `en/index.html` — генерируется |

- Тексты LV и EN хранятся в `js/i18n.js` (словари `LV` и `EN`).
- Скрипт `scripts/build_site.py` собирает `lv/index.html` и `en/index.html` из `index.html` и словарей — поисковики видят каждый язык как отдельную страницу со своим текстом.
- Он же вписывает SEO-блок в `<head>` всех трёх страниц (canonical, hreflang, Open Graph, Twitter Card, Schema.org) и создаёт `sitemap.xml`, `robots.txt`, `404.html`.
- Адрес сайта и сведения о церкви для разметки — в `scripts/site.config.json`.
- Переключатель RU / LV / EN — обычные ссылки. Выбранный язык запоминается: если посетитель выбрал LV или EN, при следующем открытии главной страницы он попадёт на свою версию.

## Главное правило

После **любой** правки `index.html`, `js/i18n.js` или `scripts/site.config.json`:

```
python3 scripts/build_site.py
```

и закоммитить все изменённые файлы (включая `lv/`, `en/`, `sitemap.xml`).
Проверить, что ничего не забыто: `python3 scripts/build_site.py --check`.

Не правьте вручную `lv/index.html`, `en/index.html`, `sitemap.xml`, `robots.txt`, `404.html` и блок между `<!-- SEO:START -->` и `<!-- SEO:END -->` — они перезаписываются.

## Переход на собственный домен

1. В `scripts/site.config.json` заменить `site_url` на новый адрес (с `/` в конце), например `https://example.lv/`.
2. `python3 scripts/build_site.py`, коммит, push.
3. Подключить домен в настройках GitHub Pages (Settings → Pages → Custom domain).
4. После подключения начнёт действовать `robots.txt` (он работает только в корне домена).
5. В Google Search Console — см. ниже, раздел «После подключения домена».

## Google Search Console

1. https://search.google.com/search-console → «Добавить ресурс» → тип **«Префикс URL»** → `https://wapny.github.io/church-website/`.
2. Способ подтверждения **«HTML-тег»**: скопировать из тега только значение `content="…"`, вписать его в `google_site_verification` в `scripts/site.config.json`, запустить сборку, опубликовать — затем нажать «Подтвердить».
3. «Файлы Sitemap» → отправить `sitemap.xml` (полный адрес: `https://wapny.github.io/church-website/sitemap.xml`).
4. «Проверка URL» → по очереди три адреса (RU, LV, EN) → «Запросить индексирование».
5. Через 1–2 недели — отчёт «Страницы» (индексирование) и «Улучшения».

Проверка разметки: https://search.google.com/test/rich-results и https://validator.schema.org/ ;
предпросмотр ссылки в соцсетях: https://developers.facebook.com/tools/debug/ (кнопка «Scrape Again» обновляет кэш Facebook).

### После подключения домена
- Добавить ресурс типа **«Домен»** (подтверждение через DNS-запись TXT у регистратора).
- Отправить sitemap нового домена.
- GitHub Pages сам перенаправит старые адреса github.io на новый домен (301).

## Вне сайта
Профиль **Google Business Profile** (карточка на Google Картах) с тем же названием, адресом, телефоном и ссылкой на сайт — самое сильное средство для поиска «церковь Рига».
