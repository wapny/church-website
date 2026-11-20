/* =====================================================================
   «Служения»: библейское место для каждого служения.
   Нажатие на фото или название открывает небольшое окно со стихами.

   Переводы:
   - RU — Синодальный перевод;
   - LV — латышская Библия 1965 года (опечатки оцифровки исправлены);
   - EN — King James Version (KJV).
   Нумерация Псалмов отличается: Синодальный Пс 91:15–16 =
   латышский Пс 92:15–16 = KJV Пс 92:14–15 (один и тот же текст).
   ===================================================================== */
(function () {
  'use strict';

  var SOURCE = {
    ru: 'Синодальный перевод',
    lv: 'Bībele, 1965. gada izdevums',
    en: 'King James Version'
  };
  var CLOSE = { ru: 'Закрыть', lv: 'Aizvērt', en: 'Close' };

  /* ключ = data-verse у карточки служения в index.html */
  var VERSES = {
    children: {
      ru: { title: 'Детское служение', ref: 'Марка 10:14', v: [
        [14, 'Увидев то, Иисус вознегодовал и сказал им: пустите детей приходить ко Мне и не препятствуйте им, ибо таковых есть Царствие Божие.']] },
      lv: { title: 'Bērnu kalpošana', ref: 'Marka 10:14', v: [
        [14, 'Bet Jēzus, to redzēdams, apskaitās un tiem sacīja: „Laidiet bērniņus pie manis, neliedziet tiem, jo tādiem pieder Dieva valstība.“']] },
      en: { title: 'Children’s ministry', ref: 'Mark 10:14', v: [
        [14, 'But when Jesus saw it, he was much displeased, and said unto them, Suffer the little children to come unto me, and forbid them not: for of such is the kingdom of God.']] }
    },
    youth: {
      ru: { title: 'Молодёжное служение', ref: 'Притчи 22:6', v: [
        [6, 'Наставь юношу при начале пути его: он не уклонится от него, когда и состарится.']] },
      lv: { title: 'Jauniešu kalpošana', ref: 'Salamana pamācības 22:6', v: [
        [6, 'Māci savam bērnam viņa ceļu, no tā viņš neatstājas arī tad, kad viņš jau vecs kļuvis.']] },
      en: { title: 'Youth ministry', ref: 'Proverbs 22:6', v: [
        [6, 'Train up a child in the way he should go: and when he is old, he will not depart from it.']] }
    },
    golden: {
      ru: { title: 'Золотой век', ref: 'Псалом 91:15–16', v: [
        [15, 'они и в старости плодовиты, сочны и свежи,'],
        [16, 'чтобы возвещать, что праведен Господь, твердыня моя, и нет неправды в Нем.']] },
      lv: { title: 'Zelta vecums', ref: 'Psalms 92:15–16', v: [
        [15, 'Vēl vecumā viņi nes augļus, ir sulīgi un zaļi,'],
        [16, 'lai paustu, ka tas Kungs ir taisns, mana patvēruma klints, un tajā nav netaisnības.']] },
      en: { title: 'Golden Age', ref: 'Psalm 92:14–15', v: [
        [14, 'They shall still bring forth fruit in old age; they shall be fat and flourishing;'],
        [15, 'To shew that the LORD is upright: he is my rock, and there is no unrighteousness in him.']] }
    },
    praise: {
      ru: { title: 'Прославление', ref: 'Псалом 150:1–6', v: [
        [1, 'Аллилуия. Хвалите Бога во святыне Его, хвалите Его на тверди силы Его.'],
        [2, 'Хвалите Его по могуществу Его, хвалите Его по множеству величия Его.'],
        [3, 'Хвалите Его со звуком трубным, хвалите Его на псалтири и гуслях.'],
        [4, 'Хвалите Его с тимпаном и ликами, хвалите Его на струнах и органе.'],
        [5, 'Хвалите Его на звучных кимвалах, хвалите Его на кимвалах громогласных.'],
        [6, 'Все дышащее да хвалит Господа! Аллилуия.']] },
      lv: { title: 'Slavināšana', ref: 'Psalms 150:1–6', v: [
        [1, 'Alelujā! Teiciet Dievu Viņa svētajā vietā, teiciet Viņu Viņa varas spēcīgajā cietoksnī — debesu izplatījumā!'],
        [2, 'Teiciet Viņu par Viņa lielajiem darbiem, teiciet to Kungu Viņa varenās godības dēļ!'],
        [3, 'Teiciet Viņu ar bazūnes skaņām, teiciet Viņu ar stabulēm un koklēm!'],
        [4, 'Teiciet Viņu ar bungām un vijīgām dejām, teiciet Viņu ar stīgu un flautas skaņām!'],
        [5, 'Teiciet Viņu ar skanīgiem zvārguļiem, teiciet Viņu ar gaviļu zvaniem!'],
        [6, 'Visi, kam dvaša, lai slavē to Kungu! Alelujā!']] },
      en: { title: 'Worship', ref: 'Psalm 150:1–6', v: [
        [1, 'Praise ye the LORD. Praise God in his sanctuary: praise him in the firmament of his power.'],
        [2, 'Praise him for his mighty acts: praise him according to his excellent greatness.'],
        [3, 'Praise him with the sound of the trumpet: praise him with the psaltery and harp.'],
        [4, 'Praise him with the timbrel and dance: praise him with stringed instruments and organs.'],
        [5, 'Praise him upon the loud cymbals: praise him upon the high sounding cymbals.'],
        [6, 'Let every thing that hath breath praise the LORD. Praise ye the LORD.']] }
    },
    social: {
      ru: { title: 'Социальное служение', ref: 'Матфея 25:35–40', v: [
        [35, 'ибо алкал Я, и вы дали Мне есть; жаждал, и вы напоили Меня; был странником, и вы приняли Меня;'],
        [36, 'был наг, и вы одели Меня; был болен, и вы посетили Меня; в темнице был, и вы пришли ко Мне.'],
        [37, 'Тогда праведники скажут Ему в ответ: Господи! когда мы видели Тебя алчущим, и накормили? или жаждущим, и напоили?'],
        [38, 'когда мы видели Тебя странником, и приняли? или нагим, и одели?'],
        [39, 'когда мы видели Тебя больным, или в темнице, и пришли к Тебе?'],
        [40, 'И Царь скажет им в ответ: истинно говорю вам: так как вы сделали это одному из сих братьев Моих меньших, то сделали Мне.']] },
      lv: { title: 'Sociālā kalpošana', ref: 'Mateja 25:35–40', v: [
        [35, 'Jo es biju izsalcis, un jūs esat mani paēdinājuši; es biju izslāpis un jūs esat mani dzirdinājuši; es biju svešinieks, un jūs esat mani uzņēmuši.'],
        [36, 'Es biju pliks, un jūs esat mani apģērbuši; es biju slims, un jūs esat mani apmeklējuši; es biju cietumā, un jūs esat nākuši pie manis.'],
        [37, 'Tad taisnie atbildēs viņam un sacīs: Kungs, kad mēs esam tevi redzējuši izsalkušu un tevi paēdinājuši? Vai izslāpušu un tevi dzirdinājuši?'],
        [38, 'Kad mēs esam tevi redzējuši kā svešinieku un tevi uzņēmuši? Vai pliku un tevi apģērbuši?'],
        [39, 'Kad mēs esam tevi redzējuši slimu vai cietumā un nākuši pie tevis?'],
        [40, 'Tad ķēniņš tiem atbildēs un sacīs: Patiesi es jums saku: ko jūs darījuši vienam no šiem maniem vismazākiem brāļiem, to jūs esat man darījuši.']] },
      en: { title: 'Social ministry', ref: 'Matthew 25:35–40', v: [
        [35, 'For I was an hungred, and ye gave me meat: I was thirsty, and ye gave me drink: I was a stranger, and ye took me in:'],
        [36, 'Naked, and ye clothed me: I was sick, and ye visited me: I was in prison, and ye came unto me.'],
        [37, 'Then shall the righteous answer him, saying, Lord, when saw we thee an hungred, and fed thee? or thirsty, and gave thee drink?'],
        [38, 'When saw we thee a stranger, and took thee in? or naked, and clothed thee?'],
        [39, 'Or when saw we thee sick, or in prison, and came unto thee?'],
        [40, 'And the King shall answer and say unto them, Verily I say unto you, Inasmuch as ye have done it unto one of the least of these my brethren, ye have done it unto me.']] }
    },
    recovery: {
      ru: { title: 'Восстановление', ref: 'Притчи 24:11', v: [
        [11, 'Спасай взятых на смерть, и неужели откажешься от обреченных на убиение?']] },
      lv: { title: 'Atveseļošanās', ref: 'Salamana pamācības 24:11', v: [
        [11, 'Glābi tos, kurus nevainīgus taisās nonāvēt, un neatraujies no tiem, kurus paredz nomākt un nožņaugt.']] },
      en: { title: 'Recovery', ref: 'Proverbs 24:11', v: [
        [11, 'If thou forbear to deliver them that are drawn unto death, and those that are ready to be slain;']] }
    }
  };

  var cards = document.querySelectorAll('.ministry[data-verse]');
  if (!cards.length) return;

  var lang = function () { return (window.I18N && window.I18N.get()) || 'ru'; };

  /* ---------- окно ---------- */
  var overlay = document.createElement('div');
  overlay.className = 'verse-pop';
  overlay.hidden = true;
  overlay.innerHTML =
    '<div class="verse-pop__card" role="dialog" aria-modal="true" aria-labelledby="verse-pop-title">' +
      '<button class="verse-pop__close" type="button"><span aria-hidden="true">×</span></button>' +
      '<h3 class="verse-pop__title" id="verse-pop-title"></h3>' +
      '<p class="verse-pop__ref"></p>' +
      '<div class="verse-pop__text"></div>' +
      '<p class="verse-pop__src"></p>' +
    '</div>';
  document.body.appendChild(overlay);

  var card = overlay.querySelector('.verse-pop__card');
  var closeBtn = overlay.querySelector('.verse-pop__close');
  var titleEl = overlay.querySelector('.verse-pop__title');
  var refEl = overlay.querySelector('.verse-pop__ref');
  var textEl = overlay.querySelector('.verse-pop__text');
  var srcEl = overlay.querySelector('.verse-pop__src');

  var openKey = '', lastFocus = null, hideTimer = 0;

  function render() {
    var l = lang();
    var d = VERSES[openKey] && (VERSES[openKey][l] || VERSES[openKey].ru);
    if (!d) return;
    titleEl.textContent = d.title;
    refEl.textContent = d.ref;
    textEl.textContent = '';
    d.v.forEach(function (pair) {
      var p = document.createElement('p');
      var n = document.createElement('sup');
      n.className = 'verse-pop__num';
      n.textContent = pair[0];
      p.appendChild(n);
      p.appendChild(document.createTextNode(' ' + pair[1]));
      textEl.appendChild(p);
    });
    srcEl.textContent = SOURCE[l] || SOURCE.ru;
    closeBtn.setAttribute('aria-label', CLOSE[l] || CLOSE.ru);
  }

  function open(key, from) {
    if (!VERSES[key]) return;
    clearTimeout(hideTimer);
    openKey = key;
    lastFocus = from || document.activeElement;
    render();
    textEl.scrollTop = 0;
    overlay.hidden = false;
    /* следующий кадр — чтобы сработала анимация появления */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { overlay.classList.add('is-open'); });
    });
    closeBtn.focus({ preventScroll: true });
  }

  function close() {
    if (overlay.hidden || !openKey) return;
    openKey = '';
    overlay.classList.remove('is-open');
    hideTimer = setTimeout(function () { overlay.hidden = true; }, 320);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  closeBtn.addEventListener('click', close);
  /* нажатие за пределами окна */
  overlay.addEventListener('click', function (e) { if (!card.contains(e.target)) close(); });
  document.addEventListener('keydown', function (e) {
    if (overlay.hidden) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') { e.preventDefault(); closeBtn.focus(); } // фокус остаётся в окне
  });
  document.addEventListener('langchange', function () { if (openKey) render(); });

  /* ---------- карточки: фото и название открывают окно ---------- */
  cards.forEach(function (li) {
    var key = li.getAttribute('data-verse');
    li.querySelectorAll('.ministry__photo, .ministry__name').forEach(function (el) {
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-haspopup', 'dialog');
      el.addEventListener('click', function () { open(key, el); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(key, el); }
      });
    });
  });
})();
