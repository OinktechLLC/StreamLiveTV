// KinoFlex — shared UI (nav + footer)
(function() {
  var loc = window.location.pathname;
  var d = (loc.match(/\//g) || []).length - 1;
  var r = d <= 1 ? './' : '../';

  var nav = document.getElementById('kf-nav');
  if (nav) nav.innerHTML = [
    '<a href="' + r + 'landing/index.html" class="logo">Kino<span>Flex</span></a>',
    '<ul>',
      '<li><a href="' + r + 'landing/index.html#how">Как работает</a></li>',
      '<li><a href="' + r + 'landing/index.html#connect">Подключение</a></li>',
      '<li><a href="' + r + 'landing/index.html#sources">Источники</a></li>',
      '<li><a href="' + r + 'partner/index.html" class="cta">Партнёрам</a></li>',
    '</ul>',
  ].join('');

  var foot = document.getElementById('kf-foot');
  if (foot) foot.innerHTML = [
    '<div class="kf-foot-grid">',
      '<div>',
        '<span class="flogo">Kino<span>Flex</span></span>',
        '<p class="fdesc">Видеобалансер нового поколения. Один скрипт — все источники: VK, Rutube, YouTube, CDNvideoHub и другие.</p>',
      '</div>',
      '<div><h4>Навигация</h4><ul>',
        '<li><a href="' + r + 'landing/index.html">Главная</a></li>',
        '<li><a href="' + r + 'landing/index.html#connect">Подключение</a></li>',
        '<li><a href="' + r + 'partner/index.html">Партнёрам</a></li>',
      '</ul></div>',
      '<div><h4>Документы</h4><ul>',
        '<li><a href="' + r + 'docs/privacy.html">Конфиденциальность</a></li>',
        '<li><a href="' + r + 'docs/terms.html">Соглашение</a></li>',
        '<li><a href="' + r + 'docs/dmca.html">DMCA</a></li>',
        '<li><a href="' + r + 'docs/cookies.html">Cookie</a></li>',
      '</ul></div>',
      '<div><h4>Контакты</h4><ul>',
        '<li><a href="mailto:ginkdev@mail.ru">ginkdev@mail.ru</a></li>',
        '<li><a href="' + r + 'partner/index.html">Партнёрство</a></li>',
      '</ul></div>',
    '</div>',
    '<div class="kf-foot-bot">',
      '<span class="copy">© ' + new Date().getFullYear() + ' KinoFlex. Все права защищены.</span>',
      '<div class="flinks">',
        '<a href="' + r + 'docs/privacy.html">Конфиденциальность</a>',
        '<a href="' + r + 'docs/terms.html">Соглашение</a>',
        '<a href="' + r + 'docs/dmca.html">DMCA</a>',
        '<a href="' + r + 'docs/cookies.html">Cookie</a>',
      '</div>',
    '</div>',
  ].join('');
})();
