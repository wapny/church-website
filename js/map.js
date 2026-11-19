/* =====================================================================
   Интерактивная карта в разделе «Контакты» (Leaflet + OpenStreetMap).

   - Координаты, масштаб: атрибуты data-lat, data-lng, data-zoom у
     <div id="church-map"> в index.html. Сейчас там здание
     Rīga, Parādes iela 4 по данным OpenStreetMap.
   - Если Leaflet не загрузился (нет интернета, CDN недоступен),
     остаётся прежняя картинка карты со ссылкой.
   ===================================================================== */
(function () {
  'use strict';

  var box = document.getElementById('church-map');
  if (!box || !window.L) return;

  var lat = parseFloat(box.getAttribute('data-lat'));
  var lng = parseFloat(box.getAttribute('data-lng'));
  var zoom = parseInt(box.getAttribute('data-zoom'), 10) || 16;
  if (isNaN(lat) || isNaN(lng)) return;

  var ADDRESS = 'Rīga, Parādes iela 4';
  var t = function (key, fallback) {
    if (!window.I18N) return fallback;
    var v = window.I18N.t(key);
    return v === key ? fallback : v;
  };

  /* убираем запасную картинку — дальше работает настоящая карта */
  var fallback = box.querySelector('.contacts__map-fallback');
  if (fallback) fallback.remove();

  var map = L.map(box, {
    center: [lat, lng],
    zoom: zoom,
    minZoom: 3,
    maxZoom: 19,
    zoomControl: true,
    /* колесо мыши не перехватывает прокрутку страницы;
       оно включается после клика по карте и выключается, когда мышь уходит */
    scrollWheelZoom: false
  });

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
  }).addTo(map);

  map.on('click focus', function () { map.scrollWheelZoom.enable(); });
  map.on('mouseout blur', function () { map.scrollWheelZoom.disable(); });

  /* значок-метка в стиле сайта (тот же, что у адреса в контактах) */
  var pin = L.icon({
    iconUrl: 'assets/icon-pin.svg',
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -40]
  });

  var marker = L.marker([lat, lng], { icon: pin, keyboard: true, title: ADDRESS }).addTo(map);

  function popupHtml() {
    return '<strong>' + t('map.church', 'Церковь «Маяк Надежды»') + '</strong><br>' + ADDRESS;
  }
  marker.bindPopup(popupHtml());

  function applyLang() {
    marker.setPopupContent(popupHtml());
    var label = t('contacts.mapAlt', 'Карта: ' + ADDRESS);
    box.setAttribute('aria-label', label);
    if (marker._icon) marker._icon.setAttribute('alt', ADDRESS);
  }
  applyLang();
  document.addEventListener('langchange', applyLang);

  /* размер контейнера меняется на разных экранах — пересчитываем карту */
  if ('ResizeObserver' in window) {
    new ResizeObserver(function () { map.invalidateSize(); }).observe(box);
  }
  window.addEventListener('load', function () { map.invalidateSize(); });
})();
