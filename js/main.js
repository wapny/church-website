(function () {
  'use strict';

  /* ---------- Мобильное меню ---------- */
  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav__toggle');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    var label = toggle.querySelector('.sr-only');
    var tr = window.I18N ? window.I18N.t : function (k) { return k === 'menu.close' ? 'Закрыть меню' : 'Открыть меню'; };
    if (label) label.textContent = tr(open ? 'menu.close' : 'menu.open');
  }

  toggle.addEventListener('click', function () {
    setMenu(!nav.classList.contains('is-open'));
  });

  nav.querySelectorAll('.nav__links a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target)) setMenu(false);
  });

  /* ---------- Логотип: плавно наверх, к первому экрану ---------- */
  var logo = document.querySelector('[data-to-top]');
  if (logo) {
    logo.addEventListener('click', function (e) {
      e.preventDefault();
      setMenu(false);
      var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Закреплённое меню: уменьшаем при прокрутке ---------- */
  var SCROLL_AT = 40;
  var ticking = false;

  /* Заголовки «О нас», «Собрания», «Трансляция», «Служения» плавно исчезают,
     когда уходят вверх под меню. Прозрачность зависит от положения на экране. */
  var fadeTitles = [].slice.call(document.querySelectorAll(
    '#about .title--xl, #meetings .title--xl, #broadcast .title--xl, #ministries .title--xl'));
  var FADE_FULL = 150; // выше этой линии (от верха окна) заголовок виден полностью
  var FADE_GONE = 70;  // на этой линии он уже исчез

  function updateFades() {
    fadeTitles.forEach(function (el) {
      var top = el.getBoundingClientRect().top;
      var o = Math.min(1, Math.max(0, (top - FADE_GONE) / (FADE_FULL - FADE_GONE)));
      el.style.opacity = o < 1 ? o.toFixed(2) : '';
    });
  }

  function updateNav() {
    nav.classList.toggle('is-scrolled', window.scrollY > SCROLL_AT);
    updateFades();
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateNav);
    }
  }, { passive: true });
  window.addEventListener('resize', updateFades);
  updateNav();

  /* ---------- Фон «Наша история» ----------
     В макете тёмная полоса фона приходится на заголовок
     «Социальное служение - наш приоритет!». На узких экранах текст
     переносится по-другому, поэтому сдвигаем фон так, чтобы полоса
     оставалась под этим заголовком. */
  var history = document.querySelector('.history');
  var lead2 = document.querySelector('.history__lead2');
  var BAND_CENTER = 388; // центр заголовка от верха секции в макете, px

  function alignHistoryBg() {
    if (!history || !lead2) return;
    var center = lead2.offsetTop + lead2.offsetHeight / 2;
    var shift = Math.max(0, Math.round(center - BAND_CENTER));
    history.style.setProperty('--bg-shift', shift + 'px');
    /* чёткое фото должно заканчиваться выше заголовка «Собрания» */
    var bg = history.querySelector('.history__bg');
    var sharpH = Math.max(320, history.offsetHeight - (bg ? bg.offsetTop : 0) - 90);
    history.style.setProperty('--sharp-h', sharpH + 'px');
  }

  var raf = 0;
  function schedule() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(alignHistoryBg);
  }

  window.addEventListener('resize', schedule);
  window.addEventListener('load', alignHistoryBg);
  /* при смене языка меняется высота текста — пересчитываем фон */
  document.addEventListener('langchange', function () {
    setMenu(nav.classList.contains('is-open'));
    schedule();
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignHistoryBg);
  alignHistoryBg();

  /* ---------- «Наша история»: сначала чёткое фото, потом размытие и текст ----------
     При каждом появлении раздела полсекунды видно чёткое фото церкви.
     Затем оно размывается, и проявляются заголовки и тексты. */
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var photo = history && history.querySelector('.history__bg-inner img');
  if (history && photo && !calm && 'IntersectionObserver' in window) {
    var sharp = document.createElement('img');
    sharp.className = 'history__sharp';
    sharp.alt = '';
    sharp.setAttribute('aria-hidden', 'true');
    sharp.src = photo.currentSrc || photo.src;
    history.querySelector('.history__bg').appendChild(sharp);
    history.classList.add('is-intro');

    /* Каждый раз, когда раздел снова появляется на экране (листаем вниз или вверх),
       сначала видно чёткое фото, через 0,5 с оно размывается и проявляется текст. */
    var introTimer = 0;
    var enter = new IntersectionObserver(function (entries) {
      var inView = entries.some(function (e) { return e.isIntersecting; });
      clearTimeout(introTimer);
      if (inView && history.classList.contains('is-intro')) {
        introTimer = setTimeout(function () { history.classList.remove('is-intro'); }, 500);
      }
    }, { rootMargin: '0px 0px -40% 0px' });
    enter.observe(history);

    /* когда раздел полностью ушёл с экрана — готовим следующий показ */
    var away = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) return;
      clearTimeout(introTimer);
      history.classList.add('is-intro');
    });
    away.observe(history);
  }

  /* ---------- Трансляция с YouTube: LIVE или последнее воскресное богослужение ----------
     Какое видео показывать, решает робот GitHub Actions (.github/workflows/youtube.yml):
     он проверяет канал через YouTube Data API и записывает результат в data/broadcast.json.
     Сайт только читает этот файл — без ключа и без расхода квоты — и перечитывает его
     раз в минуту, поэтому плеер сам переключится, когда начнётся или закончится эфир.
     Видео не запускается само: посетитель нажимает Play.
     Если файл недоступен, показывается видео из data-video-id, а если нет и его —
     картинка со ссылкой на канал. */
  var box = document.getElementById('yt-box');
  if (box) {
    var ytStatus = document.getElementById('yt-status');
    var srcUrl = box.getAttribute('data-src') || '';
    var fallbackVid = (box.getAttribute('data-video-id') || '').trim();
    var frame = null, shownVid = '', state = null, blocked = false;
    var isId = function (id) { return /^[\w-]{11}$/.test(id || ''); };

    var setFrameTitle = function () {
      if (frame) frame.title = window.I18N.t(state && state.live ? 'broadcast.playerLive' : 'broadcast.player');
    };

    var showVideo = function (id) {
      if (blocked || !isId(id) || id === shownVid) return; // то же видео — не перезагружаем плеер
      if (frame) frame.remove();
      frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0';
      frame.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen';
      frame.allowFullscreen = true;
      frame.loading = 'lazy';
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      setFrameTitle();
      box.appendChild(frame);
      box.classList.add('has-video');
      shownVid = id;
    };

    /* подпись над видео: «Прямой эфир» или «Последняя трансляция · дата» */
    var renderStatus = function () {
      if (!ytStatus) return;
      var live = state && state.live, rec = state && state.latest;
      if (live && shownVid === live.videoId) {
        ytStatus.textContent = window.I18N.t('broadcast.live');
        ytStatus.className = 'broadcast__status is-live';
        ytStatus.hidden = false;
      } else if (rec && shownVid === rec.videoId) {
        var text = window.I18N.t('broadcast.recorded');
        var d = rec.startedAt ? new Date(rec.startedAt) : null;
        if (d && !isNaN(d)) {
          var locale = { ru: 'ru-RU', lv: 'lv-LV', en: 'en-GB' }[window.I18N.get()] || 'ru-RU';
          try {
            text += ' · ' + d.toLocaleDateString(locale, { day: 'numeric', month: 'long', timeZone: 'Europe/Riga' });
          } catch (e) { /* старый браузер — без даты */ }
        }
        ytStatus.textContent = text;
        ytStatus.className = 'broadcast__status';
        ytStatus.hidden = false;
      } else {
        ytStatus.hidden = true;
      }
    };

    var apply = function () {
      var live = state && state.live, rec = state && state.latest;
      var id = (live && isId(live.videoId)) ? live.videoId
        : (rec && isId(rec.videoId)) ? rec.videoId : fallbackVid;
      showVideo(id);
      setFrameTitle();
      renderStatus();
    };

    var load = function () {
      if (!srcUrl || !window.fetch) return;
      fetch(srcUrl + (srcUrl.indexOf('?') < 0 ? '?' : '&') + 't=' + Date.now(), { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (data) { state = data; apply(); })
        .catch(function () { /* сеть или файл недоступны — остаётся то, что уже показано */ });
    };

    apply();   // сразу показываем запасное видео, пока читается файл
    load();

    /* перечитываем раз в минуту, пока вкладка открыта и видна */
    setInterval(function () { if (!document.hidden) load(); }, 60000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) load(); });
    document.addEventListener('langchange', function () { setFrameTitle(); renderStatus(); });

    /* если встраивание заблокировано (например, в окне предпросмотра), остаётся картинка со ссылкой */
    document.addEventListener('securitypolicyviolation', function (e) {
      if (/youtube/.test(e.blockedURI || '') && frame) {
        blocked = true;
        frame.remove();
        frame = null; shownVid = '';
        box.classList.remove('has-video');
        renderStatus();
      }
    });
  }

  /* ---------- Форма обратной связи ----------
     Если в data-endpoint указан адрес сервиса форм (например Formspree),
     сообщение уходит туда. Если адрес пустой, форма показывает подсказку. */
  var form = document.getElementById('contact-form');
  if (form) {
    var statusEl = form.querySelector('.cform__status');
    var btn = form.querySelector('.cform__btn');
    var lastKey = '';

    function say(key, kind) {
      lastKey = key;
      statusEl.textContent = window.I18N.t(key);
      statusEl.className = 'cform__status' + (kind ? ' is-' + kind : '');
    }
    document.addEventListener('langchange', function () {
      if (lastKey) statusEl.textContent = window.I18N.t(lastKey);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.elements._gotcha && form.elements._gotcha.value) return; // бот

      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var message = form.elements.message.value.trim();
      var okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!name || !message || !okEmail) { say('form.invalid', 'error'); return; }

      var endpoint = (form.getAttribute('data-endpoint') || '').trim();
      if (!/^https:\/\//.test(endpoint) || !window.fetch) { say('form.demo', 'info'); return; }
      if (btn.disabled) return; // уже отправляем

      /* язык, на котором написано сообщение, — чтобы было видно в письме */
      var langField = form.elements._language;
      if (langField && window.I18N) langField.value = window.I18N.get();

      btn.disabled = true;
      form.setAttribute('aria-busy', 'true');
      say('form.sending', 'info');

      /* если сервер не ответил за 20 секунд — показываем ошибку */
      var ctrl = window.AbortController ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 20000);

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
        signal: ctrl ? ctrl.signal : undefined
      }).then(function (r) {
        /* Formspree отвечает JSON: { ok: true } или { errors: [...] } */
        return r.json().catch(function () { return {}; }).then(function (data) {
          if (!r.ok || (data && data.errors)) {
            var err = new Error('HTTP ' + r.status);
            err.details = data && data.errors;
            throw err;
          }
        });
      }).then(function () {
        form.reset();
        say('form.ok', 'ok');
      }).catch(function (err) {
        if (window.console && err) console.warn('Форма не отправлена:', err.message, err.details || '');
        say(navigator.onLine === false ? 'form.offline' : 'form.error', 'error');
      }).then(function () {
        clearTimeout(timer);
        btn.disabled = false;
        form.removeAttribute('aria-busy');
      });
    });
  }

  /* ---------- Пожертвования: кнопки «Скопировать реквизиты» ----------
     Копируются реквизиты только своей карточки, подписи — на текущем языке сайта:
       Маяк Надежды
       Получатель: …
       Банк: …
       IBAN: LV49HABA0551059126455   (без пробелов — из data-copy) */
  var donateStatus = document.getElementById('donate-status');
  var tr = function (k) { return window.I18N ? window.I18N.t(k) : k; };

  function cardText(card) {
    var lines = [card.querySelector('.req__name').textContent.trim()];
    card.querySelectorAll('.req__row').forEach(function (row) {
      var dd = row.querySelector('dd');
      lines.push(row.querySelector('dt').textContent.trim() + ': ' + (dd.getAttribute('data-copy') || dd.textContent.trim()));
    });
    return lines.join('\n');
  }

  // Запасной способ для старых браузеров и страниц без HTTPS
  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () {
        if (!legacyCopy(text)) throw new Error('copy failed');
      });
    }
    return legacyCopy(text) ? Promise.resolve() : Promise.reject(new Error('copy failed'));
  }

  function selectDetails(card) {
    var sel = window.getSelection && window.getSelection();
    if (!sel) return;
    var range = document.createRange();
    range.selectNodeContents(card.querySelector('.req__list'));
    sel.removeAllRanges();
    sel.addRange(range);
  }

  document.querySelectorAll('.req__copy').forEach(function (btn) {
    var card = btn.closest('.req');
    var timer;
    btn.addEventListener('click', function () {
      copyText(cardText(card)).then(function () {
        document.querySelectorAll('.req__copy.is-copied').forEach(function (b) { if (b !== btn) b.classList.remove('is-copied'); });
        btn.classList.add('is-copied');
        if (donateStatus) donateStatus.textContent = tr('donate.copied');
        clearTimeout(timer);
        timer = setTimeout(function () {
          btn.classList.remove('is-copied');
          if (donateStatus) donateStatus.textContent = '';
        }, 2200);
      }).catch(function () {
        // Не получилось — выделяем реквизиты, чтобы их можно было скопировать вручную
        selectDetails(card);
        if (donateStatus) donateStatus.textContent = tr('donate.copyFail');
        window.alert(tr('donate.copyFail'));
      });
    });
  });
})();
