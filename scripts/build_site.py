#!/usr/bin/env python3
"""Сборка языковых версий и SEO-файлов сайта «Маяк Надежды».

Что делает:
  1. Вписывает SEO-блок (canonical, hreflang, Open Graph, Twitter Card,
     Schema.org) в <head> между <!-- SEO:START --> и <!-- SEO:END -->.
  2. Собирает lv/index.html и en/index.html из index.html (русский исходник)
     и словарей LV / EN из js/i18n.js — текст сразу лежит в HTML на нужном языке.
  3. Генерирует sitemap.xml, robots.txt и 404.html.

Все адреса берутся из scripts/site.config.json (site_url). При переходе на
собственный домен поменяйте site_url и запустите скрипт заново.

Запуск (из корня репозитория):
    python3 scripts/build_site.py           — собрать файлы
    python3 scripts/build_site.py --check   — только проверить, что всё собрано
                                              (код выхода 1, если файлы устарели)

Редактировать вручную: index.html, js/i18n.js, scripts/site.config.json.
НЕ редактировать вручную: lv/index.html, en/index.html, sitemap.xml,
robots.txt, 404.html и SEO-блок в index.html — они перезаписываются.
"""
import html
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
CONFIG = json.loads((ROOT / 'scripts' / 'site.config.json').read_text(encoding='utf-8'))
SITE = CONFIG['site_url']
assert SITE.startswith('https://') and SITE.endswith('/'), 'site_url должен начинаться с https:// и заканчиваться /'
LANGS = CONFIG['languages']
DEFAULT = CONFIG['default_lang']
GENERATED_NOTE = '<!-- СГЕНЕРИРОВАНО scripts/build_site.py из index.html и js/i18n.js — не редактировать вручную -->'


def esc(text):
    """Экранирование для текста и атрибутов HTML."""
    return html.escape(text, quote=True)


def page_url(lang):
    return SITE + LANGS[lang]['path']


# ---------- Словари LV / EN из js/i18n.js ----------
def load_dicts():
    js = (ROOT / 'js' / 'i18n.js').read_text(encoding='utf-8')
    dicts = {}
    for name in ('LV', 'EN'):
        m = re.search(r'var %s = \{(.*?)\n  \};' % name, js, re.S)
        if not m:
            sys.exit('Не найден словарь %s в js/i18n.js' % name)
        body = m.group(1)
        pairs = re.findall(r"'([\w.]+)'\s*:\s*'((?:[^'\\]|\\.)*)'", body)
        unescape = lambda v: re.sub(r'\\(.)', lambda e: {'n': '\n', 't': '\t'}.get(e.group(1), e.group(1)), v)
        dicts[name.lower()] = {k: unescape(v) for k, v in pairs}
    return dicts


# ---------- SEO-блок для <head> ----------
def seo_block(lang, title, desc):
    cfg = LANGS[lang]
    url = page_url(lang)
    img = SITE + CONFIG['og_image']['path']
    c = CONFIG['church']
    lines = []
    if CONFIG.get('google_site_verification'):
        lines.append('<meta name="google-site-verification" content="%s">' % esc(CONFIG['google_site_verification']))
    lines.append('<link rel="canonical" href="%s">' % esc(url))
    for code in LANGS:
        lines.append('<link rel="alternate" hreflang="%s" href="%s">' % (code, esc(page_url(code))))
    lines.append('<link rel="alternate" hreflang="x-default" href="%s">' % esc(page_url(DEFAULT)))
    og = [
        ('og:type', 'website'),
        ('og:site_name', cfg['name']),
        ('og:title', title),
        ('og:description', desc),
        ('og:url', url),
        ('og:image', img),
        ('og:image:width', str(CONFIG['og_image']['width'])),
        ('og:image:height', str(CONFIG['og_image']['height'])),
        ('og:image:type', CONFIG['og_image']['type']),
        ('og:image:alt', cfg['og_image_alt']),
        ('og:locale', cfg['locale']),
    ] + [('og:locale:alternate', LANGS[o]['locale']) for o in LANGS if o != lang]
    lines += ['<meta property="%s" content="%s">' % (k, esc(v)) for k, v in og]
    tw = [('twitter:card', 'summary_large_image'), ('twitter:title', title),
          ('twitter:description', desc), ('twitter:image', img), ('twitter:image:alt', cfg['og_image_alt'])]
    lines += ['<meta name="%s" content="%s">' % (k, esc(v)) for k, v in tw]

    address = {'@type': 'PostalAddress', 'streetAddress': c['street_address'],
               'addressLocality': c['locality'], 'addressCountry': c['country']}
    graph = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Organization', '@id': SITE + '#organization',
                'name': cfg['name'],
                'alternateName': [LANGS[o]['name'] for o in LANGS if o != lang],
                'legalName': c['legal_name'],
                'url': SITE,
                'logo': SITE + CONFIG['logo'],
                'image': img,
                'email': c['email'],
                'telephone': c['telephone'],
                'address': address,
                'foundingDate': c['founding_year'],
                'memberOf': {'@type': 'Organization', 'name': c['member_of']['name'],
                             'alternateName': c['member_of']['alternate_name']},
                'sameAs': c['same_as'],
                'location': {'@id': SITE + '#church'},
            },
            {
                '@type': 'Church', '@id': SITE + '#church',
                'name': cfg['name'],
                'url': SITE,
                'telephone': c['telephone'],
                'address': address,
                'geo': {'@type': 'GeoCoordinates', 'latitude': c['latitude'], 'longitude': c['longitude']},
                'hasMap': c['map_url'],
                'image': img,
            },
            {
                '@type': 'WebSite', '@id': SITE + '#website',
                'url': SITE, 'name': cfg['name'],
                'inLanguage': list(LANGS),
                'publisher': {'@id': SITE + '#organization'},
            },
            {
                '@type': 'WebPage', '@id': url + '#webpage',
                'url': url, 'name': title, 'description': desc, 'inLanguage': lang,
                'isPartOf': {'@id': SITE + '#website'},
                'about': {'@id': SITE + '#organization'},
                'primaryImageOfPage': img,
            },
        ],
    }
    # </ в JSON внутри <script> недопустимо — экранируем
    data = json.dumps(graph, ensure_ascii=False, indent=2).replace('</', '<\\/')
    lines.append('<script type="application/ld+json">\n' + data + '\n</script>')
    return '\n'.join('  ' + l if not l.startswith('<script') else '  ' + l.replace('\n', '\n  ') for l in lines)


def put_seo(page, block):
    new, n = re.subn(r'(<!-- SEO:START[^>]*-->\n).*?(  <!-- SEO:END -->)',
                     lambda m: m.group(1) + block + '\n' + m.group(2), page, flags=re.S)
    if n != 1:
        sys.exit('В index.html не найдены метки <!-- SEO:START --> / <!-- SEO:END -->')
    return new


# ---------- Перевод страницы ----------
def translate(page, lang, d):
    missing = set()

    def tr(key):
        if key not in d:
            missing.add(key)
            return None
        return d[key]

    # текст: data-i18n (как textContent) и data-i18n-html (как innerHTML)
    def text_sub(m):
        key, body = m.group('key'), m.group('body')
        if m.group('kind') == '' and '<' in body:
            sys.exit('data-i18n="%s": внутри элемента есть разметка — используйте data-i18n-html' % key)
        v = tr(key)
        if v is None:
            return m.group(0)
        v = esc(v) if m.group('kind') == '' else v
        return m.group('open') + v + m.group('close')

    page = re.sub(r'(?P<open><(?P<tag>[a-zA-Z0-9]+)\b[^>]*?\sdata-i18n(?P<kind>|-html)="(?P<key>[^"]+)"[^>]*>)'
                  r'(?P<body>.*?)(?P<close></(?P=tag)>)', text_sub, page, flags=re.S)

    # атрибуты: alt, aria-label, placeholder
    attr_of = {'alt': 'alt', 'aria': 'aria-label', 'ph': 'placeholder'}

    def tag_sub(m):
        tag = m.group(0)
        for kind, attr in attr_of.items():
            km = re.search(r'\sdata-i18n-%s="([^"]+)"' % kind, tag)
            if km:
                v = tr(km.group(1))
                if v is not None:
                    tag, n = re.subn(r'(\s%s=")[^"]*(")' % attr, lambda a: a.group(1) + esc(v) + a.group(2), tag)
                    if n != 1:
                        sys.exit('У элемента с data-i18n-%s="%s" нет атрибута %s' % (kind, km.group(1), attr))
        return tag

    page = re.sub(r'<[a-zA-Z][^>]*\sdata-i18n-(?:alt|aria|ph)="[^"]*"[^>]*>', tag_sub, page)

    if missing:
        sys.exit('Нет перевода (%s) для ключей: %s — добавьте их в js/i18n.js' % (lang, ', '.join(sorted(missing))))

    # язык документа, заголовок, описание, язык формы
    page = page.replace('<html lang="%s">' % DEFAULT, '<html lang="%s">' % lang, 1)
    page = re.sub(r'<title>.*?</title>', lambda m: '<title>%s</title>' % esc(d['meta.title']), page, count=1)
    page = re.sub(r'(<meta name="description" content=")[^"]*(")', lambda m: m.group(1) + esc(d['meta.desc']) + m.group(2), page, count=1)
    page = page.replace('name="_language" value="%s"' % DEFAULT, 'name="_language" value="%s"' % lang, 1)

    # активная ссылка языка
    page = page.replace(' class="is-active" aria-current="true"', '')
    page = re.sub(r'(<a href="[^"]*" data-lang="%s"[^>]*?)>' % lang, r'\1 class="is-active" aria-current="true">', page, count=1)
    return page


def rebase(page, prefix='../'):
    """Относительные адреса страницы из корня → для страницы в подпапке (lv/, en/)."""
    def fix(m):
        attr, url = m.group(1), m.group(2)
        if re.match(r'(?:[a-z][a-z0-9+.-]*:|#|/|\?)', url, re.I) or url == '':
            return m.group(0)
        if url in ('./', '.'):
            url = ''
        return '%s="%s%s"' % (attr, prefix, url)
    return re.sub(r'\b(src|href|data-src|poster)="([^"]*)"', fix, page)


# ---------- sitemap.xml, robots.txt, 404.html ----------
def sitemap():
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
           '        xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for lang in LANGS:
        out.append('  <url>')
        out.append('    <loc>%s</loc>' % esc(page_url(lang)))
        for code in LANGS:
            out.append('    <xhtml:link rel="alternate" hreflang="%s" href="%s"/>' % (code, esc(page_url(code))))
        out.append('    <xhtml:link rel="alternate" hreflang="x-default" href="%s"/>' % esc(page_url(DEFAULT)))
        out.append('  </url>')
    out.append('</urlset>')
    return '\n'.join(out) + '\n'


def robots():
    return ('# Сгенерировано scripts/build_site.py.\n'
            '# Поисковики читают robots.txt только в корне домена. На github.io/church-website/\n'
            '# этот файл не действует (и не мешает); заработает после подключения своего домена.\n'
            'User-agent: *\n'
            'Allow: /\n'
            '\n'
            'Sitemap: %ssitemap.xml\n' % SITE)


def page_404(dicts):
    base = urlparse(SITE).path  # «/church-website/», на своём домене — «/»
    names = {l: LANGS[l]['name'] for l in LANGS}
    rows = [
        ('ru', 'Страница не найдена', 'На главную'),
        ('lv', 'Lapa nav atrasta', 'Uz sākumlapu'),
        ('en', 'Page not found', 'Go to the home page'),
    ]
    items = '\n'.join(
        '      <p lang="%s"><strong>%s</strong><br><a href="%s%s">%s — %s</a></p>'
        % (l, esc(t), base, LANGS[l]['path'], esc(go), esc(names[l])) for l, t, go in rows)
    return '''<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>404 — %(name)s</title>
  <link rel="icon" type="image/png" sizes="32x32" href="%(base)sfavicon-v6-32x32.png">
  <link rel="icon" href="%(base)sfavicon-v6.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Rubik:wght@500&display=swap" rel="stylesheet">
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px 16px; box-sizing: border-box;
           font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #060606;
           background: linear-gradient(180deg, #fff 0%%, #ff9d68 55%%, #92bdff 100%%) fixed; }
    main { max-width: 440px; width: 100%%; text-align: center; padding: 32px 28px; border-radius: 28px;
           background: linear-gradient(136.49deg, #fff2e0 14.644%%, #ffd4ab 85.356%%); box-shadow: 0 5px 18px rgba(0,0,0,.25); }
    img { width: 96px; height: 96px; }
    h1 { margin: 8px 0 20px; font-family: "Rubik", "Inter", sans-serif; font-weight: 500; font-size: 56px; line-height: 1; }
    p { margin: 0 0 16px; font-size: 18px; line-height: 26px; }
    a { color: #060606; }
  </style>
</head>
<body>
  <main>
    <img src="%(base)sicon-v6-192x192.png" alt="">
    <h1>404</h1>
%(items)s
  </main>
</body>
</html>
''' % {'name': esc(names[DEFAULT]), 'base': base, 'items': items}


# ---------- Сборка ----------
def build():
    dicts = load_dicts()
    src = (ROOT / 'index.html').read_text(encoding='utf-8')
    ru_title = re.search(r'<title>(.*?)</title>', src, re.S).group(1)
    ru_desc = re.search(r'<meta name="description" content="([^"]*)"', src).group(1)
    ru_title, ru_desc = html.unescape(ru_title), html.unescape(ru_desc)

    files = {}
    ru_page = put_seo(src, seo_block('ru', ru_title, ru_desc))
    files['index.html'] = ru_page
    for lang in ('lv', 'en'):
        d = dicts[lang]
        page = put_seo(src, seo_block(lang, d['meta.title'], d['meta.desc']))
        page = translate(page, lang, d)
        page = rebase(page)
        page = page.replace('<!DOCTYPE html>\n', '<!DOCTYPE html>\n' + GENERATED_NOTE + '\n', 1)
        files[LANGS[lang]['path'] + 'index.html'] = page
    files['sitemap.xml'] = sitemap()
    files['robots.txt'] = robots()
    files['404.html'] = page_404(dicts)
    return files


def main():
    check = '--check' in sys.argv
    files = build()
    stale = []
    for rel, content in files.items():
        path = ROOT / rel
        old = path.read_text(encoding='utf-8') if path.exists() else None
        if old != content:
            stale.append(rel)
            if not check:
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(content, encoding='utf-8')
    if check:
        if stale:
            print('Устарели (запустите python3 scripts/build_site.py):', ', '.join(stale))
            sys.exit(1)
        print('Все файлы собраны и актуальны.')
    else:
        print('Обновлено:', ', '.join(stale) if stale else 'ничего — всё уже актуально')


if __name__ == '__main__':
    main()
