/* =====================================================================
   Языки сайта: русский (по умолчанию), латышский, английский.

   Как это работает:
   - В index.html у каждого переводимого элемента есть атрибут data-i18n="ключ"
     (текст), data-i18n-html (текст с переносами строк), data-i18n-alt (подпись
     картинки), data-i18n-aria (подпись для экранных читалок) или
     data-i18n-ph (подсказка в поле формы).
   - Русский текст берётся прямо из index.html, поэтому здесь его нет.
   - Латышский (lv) и английский (en) тексты лежат ниже. Чтобы поправить
     перевод — найдите ключ и измените строку.
   ===================================================================== */
(function () {
  'use strict';

  var LANGS = ['ru', 'lv', 'en'];
  var STORE_KEY = 'mayak-lang';

  /* Тексты, которых нет в HTML (меню, сообщения формы) — русская версия. */
  var RU_EXTRA = {
    'broadcast.player': 'Последняя трансляция церкви «Маяк Надежды»',
    'broadcast.playerLive': 'Прямой эфир церкви «Маяк Надежды»',
    'broadcast.live': 'Прямой эфир',
    'broadcast.recorded': 'Последняя трансляция',
    'map.church': 'Церковь «Маяк Надежды»',
    'menu.open': 'Открыть меню',
    'menu.close': 'Закрыть меню',
    'form.sending': 'Отправляем…',
    'form.ok': 'Спасибо! Ваше сообщение отправлено. Мы ответим вам на указанную почту.',
    'form.invalid': 'Пожалуйста, заполните все поля и проверьте адрес электронной почты.',
    'form.error': 'Не удалось отправить сообщение. Попробуйте ещё раз или напишите нам на ceribubaka@gmail.com.',
    'form.demo': 'Форма ещё не подключена к почте. Пока напишите нам на ceribubaka@gmail.com.',
    'form.offline': 'Нет подключения к интернету. Проверьте соединение и попробуйте ещё раз.',
    'donate.copyFail': 'Не удалось скопировать. Выделите реквизиты и скопируйте их вручную.'
  };

  var LV = {
    'meta.title': 'Draudze «Cerību Bāka» — Rīga',
    'meta.desc': 'Draudze «Cerību Bāka» Rīgā: sociālā kalpošana, sapulču grafiks, tiešraides, kontakti un rekvizīti ziedojumiem.',

    'lang.group': 'Valoda',
    'nav.label': 'Galvenā navigācija',
    'nav.logo': 'Cerību Bāka — uz augšu',
    'nav.logoAlt': 'Cerību Bāka',
    'nav.about': 'par mums',
    'nav.meetings': 'sapulces',
    'nav.broadcast': 'tiešraide',
    'nav.ministries': 'kalpošanas',
    'nav.contacts': 'kontakti',
    'menu.open': 'Atvērt izvēlni',
    'menu.close': 'Aizvērt izvēlni',

    'hero.label': 'Laipni lūdzam',
    'hero.title': 'Laipni<br>lūdzam',

    'about.title': 'Par mums',
    'about.pastorsAlt': 'Pastori Aleksandrs un Nelija Vapne',
    'about.pastors': 'Pastori Aleksandrs un Nelija Vapne',
    'about.church': 'Draudze «Cerību Bāka»',
    'about.text': '— tā ir dzīva kristiešu kopiena, kas apvieno aktīvu sociālo kalpošanu ar mesiāniskā virziena attīstību. Mūsu vēsture sākās pirms vairāk nekā 10 gadiem ar praktisku palīdzību cilvēkiem, un šodien šīs vērtības mums joprojām ir galvenās.',

    'history.title': 'Mūsu vēsture',
    'history.p1': 'Kalpošana izauga no labdarības fonda Kraukļu fonds («Krauku fonds») darbības, kas palīdzēja trūcīgām ģimenēm un cilvēkiem krīzes situācijās. Par fonda darbu vienā no attālajiem Rīgas rajoniem atbildēja Aleksandrs Vapne.',
    'history.p2': 'Tajā laikā Kungs vairāku kalpotāju sirdīs ielika vienu un to pašu atklāsmi par draudzes dibināšanu — šo vārdu viņi sadzirdēja vienlaikus, savā starpā nesarunājuši. 2015. gadā Aleksandrs un Nelija Vapne tika iesvētīti pastora kalpošanai, un draudze «Cerību Bāka» tika oficiāli apstiprināta.',
    'history.lead2': 'Sociālā kalpošana — mūsu prioritāte!',
    'history.intro': 'Mēs ticam, ka ticība ir spēcīga darbos. Mūsu draudze aktīvi atbalsta tos, kam nepieciešama palīdzība un gādība:',
    'history.li1': 'Palīdzība cilvēkiem ar dažādām atkarībām.',
    'history.li2': 'Atbalsts trūcīgām ģimenēm un cilvēkiem grūtās dzīves situācijās.',
    'history.li3': 'Gādība un kalpošana vecāka gadagājuma cilvēkiem.',
    'history.li4': 'Atbalsts cilvēkiem ar invaliditāti.',
    'history.outro': 'Draudzē tiek atvērti un aktīvi attīstīti arī virzieni bērniem, pusaudžiem un jauniešiem.',

    'meetings.title': 'Sapulces',
    'day.mon': 'Pr',
    'day.tue': 'Ot',
    'day.thu': 'Ce',
    'day.sun': 'Sv',
    'day.sat': 'Se',
    'slot.prayer': 'Lūgšana',
    'slot.home': 'Mājas grupas',
    'slot.bible': 'Bībeles seminārs',
    'slot.sunday': 'Svētdienas dievkalpojums',
    'slot.shofar': 'Šofar draudze',
    'shofar.p1': 'Mesiāniskā draudze «Šofar»',
    'shofar.p2': 'Pastoram Aleksandram Vapnem ir ebreju saknes. 2020. gadā, pēc viņa tēva, mesiāniskā pastora Leonīda Vapnes aiziešanas mūžībā, Aleksandrs pārņēma kalpošanu, apvienojot tēva draudzi ar draudzi «Cerību Bāka».',
    'shofar.p3': 'Šodien mesiāniskais virziens ir viena no draudzes galvenajām prioritātēm. Draudzē «Šofar» mēs godājam Bībeles tradīcijas, studējam Vārdu un sestdienās svinam Šabatu.',

    'broadcast.title': 'Tiešraide',
    'broadcast.aria': 'Skatīties tiešraides vietnē YouTube',
    'broadcast.note': 'Pievienojies mūsu YouTube kanālam — tur tiek translētas lūgšanas, Bībeles semināri un svētdienas dievkalpojumi!',
    'broadcast.player': 'Pēdējā «Cerību Bāka» draudzes tiešraide',
    'broadcast.playerLive': '«Cerību Bāka» draudzes tiešraide',
    'broadcast.live': 'Tiešraide',
    'broadcast.recorded': 'Pēdējā tiešraide',

    'ministries.title': 'Kalpošanas',
    'm.children': 'Bērnu',
    'm.youth': 'Jauniešu',
    'm.golden': 'Zelta vecums',
    'm.praise': 'Slavināšana',
    'm.social': 'Sociālā',
    'm.recovery': 'Atveseļošanās',
    'm.childrenAlt': 'Bērnu kalpošana',
    'm.youthAlt': 'Jauniešu kalpošana',
    'm.goldenAlt': 'Kalpošana «Zelta vecums»',
    'm.praiseAlt': 'Slavināšana',
    'm.socialAlt': 'Sociālā kalpošana',
    'm.recoveryAlt': 'Palīdzība atkarīgajiem',

    'contacts.title': 'Kontakti',
    'contacts.mapAria': 'Atvērt adresi kartē',
    'contacts.mapAlt': 'Karte: Rīga, Parādes iela 4',
    'map.church': 'Draudze «Cerību Bāka»',

    'form.title': 'Raksti mums',
    'form.lead': 'Uzdod jautājumu vai pastāsti, kā mēs varam palīdzēt — mēs atbildēsim.',
    'form.name': 'Vārds',
    'form.email': 'E-pasts',
    'form.message': 'Ziņojums',
    'form.namePh': 'Tavs vārds',
    'form.emailPh': 'tavs@epasts.lv',
    'form.messagePh': 'Uzraksti savu ziņojumu',
    'form.submit': 'Nosūtīt',
    'form.sending': 'Sūtām…',
    'form.ok': 'Paldies! Tavs ziņojums nosūtīts. Mēs atbildēsim uz norādīto e-pastu.',
    'form.invalid': 'Lūdzu, aizpildi visus laukus un pārbaudi e-pasta adresi.',
    'form.error': 'Neizdevās nosūtīt ziņojumu. Mēģini vēlreiz vai raksti mums uz ceribubaka@gmail.com.',
    'form.demo': 'Veidlapa vēl nav pieslēgta e-pastam. Pagaidām raksti mums uz ceribubaka@gmail.com.',
    'form.offline': 'Nav interneta savienojuma. Pārbaudi savienojumu un mēģini vēlreiz.',

    'donate.title': 'Ziedojumi',
    'donate.sub': 'Atbalstīt mūsu kalpošanu',
    'donate.church': 'Cerību Bāka',
    'donate.shofar': 'Šofar',
    'donate.recipient': 'Saņēmējs',
    'donate.bank': 'Banka',
    'donate.copy': 'Kopēt rekvizītus',
    'donate.copied': 'Nokopēts!',
    'donate.copyChurch': 'Kopēt rekvizītus: Cerību Bāka',
    'donate.copyShofar': 'Kopēt rekvizītus: Šofar',
    'donate.copyFail': 'Neizdevās nokopēt. Iezīmē rekvizītus un nokopē tos manuāli.',
    'donate.thanks': 'Paldies par tavu atbalstu!',
    'donate.thanksText': 'Tavs ieguldījums palīdz mums nest cilvēkiem Dieva mīlestību, cerību un Dieva Vārdu.',

    'footer.p1': 'Mūsu draudze ir Latvijas vasarsvētku draudžu centra locekle'
  };

  var EN = {
    'meta.title': 'Lighthouse of Hope Church — Riga',
    'meta.desc': 'Lighthouse of Hope Church in Riga: social ministry, meeting schedule, live broadcasts, contacts and bank details for donations.',

    'lang.group': 'Language',
    'nav.label': 'Main navigation',
    'nav.logo': 'Lighthouse of Hope — back to top',
    'nav.logoAlt': 'Lighthouse of Hope',
    'nav.about': 'about',
    'nav.meetings': 'meetings',
    'nav.broadcast': 'broadcast',
    'nav.ministries': 'ministries',
    'nav.contacts': 'contacts',
    'menu.open': 'Open menu',
    'menu.close': 'Close menu',

    'hero.label': 'Welcome',
    'hero.title': 'Welcome',

    'about.title': 'About us',
    'about.pastorsAlt': 'Pastors Alexander and Nelia Vapne',
    'about.pastors': 'Pastors Alexander and Nelia Vapne',
    'about.church': 'Lighthouse of Hope Church',
    'about.text': '— is a living Christian community that combines active social ministry with the growth of the Messianic movement. Our story began more than 10 years ago with practical help for people, and today these values remain our priority.',

    'history.title': 'Our history',
    'history.p1': 'The ministry grew out of the work of the charitable foundation Kraukļu fonds (the “Ravens Foundation”), which helped low-income families and people in crisis. Alexander Vapne was responsible for the foundation’s work in one of Riga’s remote districts.',
    'history.p2': 'At that time the Lord placed the same revelation about founding a church on the hearts of several ministers — they heard this word at the same moment, without having agreed beforehand. In 2015 Alexander and Nelia Vapne were ordained to pastoral ministry, and the Lighthouse of Hope church was officially established.',
    'history.lead2': 'Social ministry is our priority!',
    'history.intro': 'We believe that faith is strong in deeds. Our church actively supports those who need help and care:',
    'history.li1': 'Help for people struggling with various addictions.',
    'history.li2': 'Support for low-income families and people in difficult life circumstances.',
    'history.li3': 'Care and ministry for the elderly.',
    'history.li4': 'Support for people with disabilities.',
    'history.outro': 'The church also runs active and growing programs for children, teenagers and young people.',

    'meetings.title': 'Meetings',
    'day.mon': 'Mon',
    'day.tue': 'Tue',
    'day.thu': 'Thu',
    'day.sun': 'Sun',
    'day.sat': 'Sat',
    'slot.prayer': 'Prayer',
    'slot.home': 'Home groups',
    'slot.bible': 'Bible seminar',
    'slot.sunday': 'Sunday service',
    'slot.shofar': 'Shofar community',
    'shofar.p1': 'Messianic community “Shofar”',
    'shofar.p2': 'Pastor Alexander Vapne has Jewish roots. In 2020, after the passing of his father, Messianic pastor Leonid Vapne, Alexander took over the ministry, merging his father’s community with the Lighthouse of Hope church.',
    'shofar.p3': 'Today the Messianic movement is one of the church’s key priorities. In the Shofar community we honor biblical traditions, study the Word and keep Shabbat on Saturdays.',

    'broadcast.title': 'Broadcast',
    'broadcast.aria': 'Watch broadcasts on YouTube',
    'broadcast.note': 'Visit our YouTube channel — prayer meetings, Bible seminars and Sunday services are streamed there!',
    'broadcast.player': 'Latest broadcast from Lighthouse of Hope Church',
    'broadcast.playerLive': 'Live broadcast from Lighthouse of Hope Church',
    'broadcast.live': 'Live now',
    'broadcast.recorded': 'Latest broadcast',

    'ministries.title': 'Ministries',
    'm.children': 'Children',
    'm.youth': 'Youth',
    'm.golden': 'Golden Age',
    'm.praise': 'Worship',
    'm.social': 'Social',
    'm.recovery': 'Recovery',
    'm.childrenAlt': 'Children’s ministry',
    'm.youthAlt': 'Youth ministry',
    'm.goldenAlt': '“Golden Age” ministry',
    'm.praiseAlt': 'Worship',
    'm.socialAlt': 'Social ministry',
    'm.recoveryAlt': 'Help for people with addictions',

    'contacts.title': 'Contacts',
    'contacts.mapAria': 'Open the address on the map',
    'contacts.mapAlt': 'Map: Rīga, Parādes iela 4',
    'map.church': 'Lighthouse of Hope Church',

    'form.title': 'Write to us',
    'form.lead': 'Ask a question or tell us how we can help — we will get back to you.',
    'form.name': 'Name',
    'form.email': 'Email',
    'form.message': 'Message',
    'form.namePh': 'Your name',
    'form.emailPh': 'you@example.com',
    'form.messagePh': 'Write your message',
    'form.submit': 'Send',
    'form.sending': 'Sending…',
    'form.ok': 'Thank you! Your message has been sent. We will reply to the email you provided.',
    'form.invalid': 'Please fill in all fields and check your email address.',
    'form.error': 'We could not send your message. Please try again or write to us at ceribubaka@gmail.com.',
    'form.demo': 'The form is not connected to email yet. For now, please write to us at ceribubaka@gmail.com.',
    'form.offline': 'No internet connection. Please check your connection and try again.',

    'donate.title': 'Donations',
    'donate.sub': 'Support our ministry',
    'donate.church': 'Lighthouse of Hope',
    'donate.shofar': 'Shofar',
    'donate.recipient': 'Recipient',
    'donate.bank': 'Bank',
    'donate.copy': 'Copy bank details',
    'donate.copied': 'Copied!',
    'donate.copyChurch': 'Copy bank details: Lighthouse of Hope',
    'donate.copyShofar': 'Copy bank details: Shofar',
    'donate.copyFail': 'Could not copy. Please select the details and copy them manually.',
    'donate.thanks': 'Thank you for your support!',
    'donate.thanksText': 'Your gift helps us bring God’s love, hope and the Word of God to people.',

    'footer.p1': 'Our church is a member of the Latvian Pentecostal Churches Center'
  };

  var DICT = { lv: LV, en: EN };
  var ru = {};          // русские тексты — собираем из самой страницы
  for (var k in RU_EXTRA) ru[k] = RU_EXTRA[k];

  var KINDS = [
    { attr: 'data-i18n',       get: function (el) { return el.textContent; },          set: function (el, v) { el.textContent = v; } },
    { attr: 'data-i18n-html',  get: function (el) { return el.innerHTML; },            set: function (el, v) { el.innerHTML = v; } },
    { attr: 'data-i18n-alt',   get: function (el) { return el.getAttribute('alt'); },  set: function (el, v) { el.setAttribute('alt', v); } },
    { attr: 'data-i18n-aria',  get: function (el) { return el.getAttribute('aria-label'); }, set: function (el, v) { el.setAttribute('aria-label', v); } },
    { attr: 'data-i18n-ph',    get: function (el) { return el.getAttribute('placeholder'); }, set: function (el, v) { el.setAttribute('placeholder', v); } }
  ];

  var metaDesc = document.querySelector('meta[name="description"]');
  ru['meta.title'] = document.title;
  ru['meta.desc'] = metaDesc ? metaDesc.getAttribute('content') : '';

  KINDS.forEach(function (kind) {
    document.querySelectorAll('[' + kind.attr + ']').forEach(function (el) {
      var key = el.getAttribute(kind.attr);
      if (!(key in ru)) ru[key] = kind.get(el);
    });
  });

  var current = 'ru';

  function t(key) {
    var table = current === 'ru' ? ru : DICT[current];
    if (table && key in table) return table[key];
    return key in ru ? ru[key] : key;
  }

  function apply() {
    KINDS.forEach(function (kind) {
      document.querySelectorAll('[' + kind.attr + ']').forEach(function (el) {
        kind.set(el, t(el.getAttribute(kind.attr)));
      });
    });
    document.documentElement.lang = current;
    document.title = t('meta.title');
    if (metaDesc) metaDesc.setAttribute('content', t('meta.desc'));

    document.querySelectorAll('[data-lang]').forEach(function (btn) {
      var on = btn.getAttribute('data-lang') === current;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function setLang(lang, save) {
    if (LANGS.indexOf(lang) === -1) lang = 'ru';
    current = lang;
    if (save) {
      try { localStorage.setItem(STORE_KEY, lang); } catch (e) { /* без сохранения тоже работает */ }
    }
    apply();
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
  }

  window.I18N = { t: t, set: function (l) { setLang(l, true); }, get: function () { return current; } };

  document.querySelectorAll('[data-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () { setLang(btn.getAttribute('data-lang'), true); });
  });

  var saved = null;
  try { saved = localStorage.getItem(STORE_KEY); } catch (e) { /* ignore */ }
  if (saved && saved !== 'ru') setLang(saved, false);
  else apply();
})();
