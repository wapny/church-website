#!/usr/bin/env python3
"""
Обновляет data/broadcast.json — какую трансляцию показывать на сайте.

Запускается роботом GitHub Actions (.github/workflows/youtube.yml).
Ключ YouTube Data API берётся из переменной окружения YOUTUBE_API_KEY
(GitHub Secret) и никуда не записывается.

Логика:
  - live   — видео канала, которое прямо сейчас в эфире (статус LIVE на YouTube);
  - latest — последняя ЗАВЕРШЁННАЯ трансляция, начавшаяся в воскресенье
             по времени Риги (Europe/Riga). Обычные загрузки и эфиры
             в другие дни не подходят.

Расход квоты: 2 единицы за запуск (playlistItems.list + videos.list)
из бесплатных 10 000 в день. Посетители сайта квоту не расходуют.

Файл перезаписывается только когда что-то действительно изменилось,
чтобы не создавать лишних коммитов.

Проверка без интернета:  python3 scripts/update_broadcast.py --fixture файл.json
"""
import json
import os
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

CHANNEL_ID = 'UCyS2wgp9y7N8Ow-o_OWytlg'   # ЦЕРКОВЬ МАЯК НАДЕЖДЫ (@mayaknadezdi)
UPLOADS_PLAYLIST = 'UU' + CHANNEL_ID[2:]  # плейлист «Загрузки» канала
RIGA = ZoneInfo('Europe/Riga')
OUT = os.environ.get('BROADCAST_OUT') or os.path.join(
    os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'broadcast.json')
API = 'https://www.googleapis.com/youtube/v3/'


def api(method, **params):
    params['key'] = os.environ['YOUTUBE_API_KEY']
    url = API + method + '?' + urllib.parse.urlencode(params)
    try:
        with urllib.request.urlopen(url, timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        # текст ошибки от Google без ключа (ключ в URL не печатаем)
        body = e.read().decode('utf-8', 'replace')[:500]
        raise SystemExit(f'YouTube API {method}: HTTP {e.code}: {body}')


def fetch_videos():
    """Последние 25 видео канала со статусом трансляции."""
    items = api('playlistItems', part='contentDetails', playlistId=UPLOADS_PLAYLIST,
                maxResults=25).get('items', [])
    ids = [i['contentDetails']['videoId'] for i in items]
    if not ids:
        return []
    return api('videos', part='snippet,liveStreamingDetails,status',
               id=','.join(ids), maxResults=25).get('items', [])


def parse_time(s):
    return datetime.fromisoformat(s.replace('Z', '+00:00')) if s else None


def can_show(v):
    st = v.get('status', {})
    return st.get('privacyStatus') == 'public' and st.get('embeddable', True)


def info(v):
    lsd = v.get('liveStreamingDetails', {})
    return {
        'videoId': v['id'],
        'title': v['snippet']['title'],
        'startedAt': lsd.get('actualStartTime'),
        'endedAt': lsd.get('actualEndTime'),
    }


def choose(videos):
    live, ended_sunday = [], []
    for v in videos:
        if not can_show(v):
            continue
        lsd = v.get('liveStreamingDetails') or {}
        start, end = parse_time(lsd.get('actualStartTime')), parse_time(lsd.get('actualEndTime'))
        if not start:
            continue  # обычное видео или ещё не начавшийся эфир
        if v['snippet'].get('liveBroadcastContent') == 'live' and not end:
            live.append((start, v))
        elif end and start.astimezone(RIGA).weekday() == 6:  # 6 = воскресенье
            ended_sunday.append((start, v))
    pick = lambda lst: info(max(lst, key=lambda x: x[0])[1]) if lst else None
    return pick(live), pick(ended_sunday)


def main():
    if '--fixture' in sys.argv:  # проверка логики на сохранённом ответе API
        with open(sys.argv[sys.argv.index('--fixture') + 1], encoding='utf-8') as f:
            videos = json.load(f)['items']
    else:
        if not os.environ.get('YOUTUBE_API_KEY'):
            raise SystemExit('Нет YOUTUBE_API_KEY (GitHub Secret)')
        videos = fetch_videos()

    old = {}
    if os.path.exists(OUT):
        with open(OUT, encoding='utf-8') as f:
            old = json.load(f)

    live, latest = choose(videos)
    if latest is None:
        latest = old.get('latest')  # в последних 25 видео воскресных нет — оставляем прежнюю запись

    new = {'channelId': CHANNEL_ID, 'live': live, 'latest': latest}
    if {k: old.get(k) for k in new} == new:
        print('Без изменений:', 'LIVE ' + live['videoId'] if live else 'запись ' + (latest or {}).get('videoId', '—'))
        return

    new['changedAt'] = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(new, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print('Обновлено:', json.dumps(new, ensure_ascii=False))


if __name__ == '__main__':
    main()
