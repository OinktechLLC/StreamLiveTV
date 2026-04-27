/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  KinoFlex Embed — v1.0                                       ║
 * ║  Партнёрский скрипт. Вставьте на свой сайт:                  ║
 * ║                                                              ║
 * ║  <div class="kinoflex-player"                                ║
 * ║       data-kp-id="12345"                                     ║
 * ║       data-type="series">                                    ║
 * ║  </div>                                                      ║
 * ║  <script src="https://kinoflex.ru/embed/player.js"           ║
 * ║          data-publisher-id="ВАШ_ID"></script>                ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
(function (window, document) {
  'use strict';

  // ── Конфиг (вшитый, можно менять под свой домен) ─────────────
  var KFE = {
    version:     '1.0.0',
    cdnBase:     'https://kinoflex.ru',          // ← замените на свой домен
    vastUrl:     'https://vast.yomeno.xyz/vast?spot_id=1488670',
    skipAfter:   5,
    kpApiKey:    '960dc4e3-9eae-4072-8f0c-98a5ed6c0d2a',
    publisherId: (document.currentScript && document.currentScript.getAttribute('data-publisher-id')) || 'default',

    // Источники — порядок = приоритет
    sources: [
      { id: 'namy',    label: 'Namy',        url: function(k,s,e){ return 'https://api.namy.ws/embed/movie/'+k+'?season='+s+'&episode='+e; } },
      { id: 'atomics', label: 'Atomics',     url: function(k,s,e){ return 'https://api1690380040.atomics.ws/embed/kp/'+k+'?season='+s+'&episode='+e; } },
      { id: 'marts',   label: 'Marts',       url: function(k,s,e){ return 'https://api.marts.ws/embed/movie/'+k+'?season='+s+'&episode='+e; } },
      { id: 'domem',   label: 'Domem',       url: function(k,s,e){ return 'https://api.domem.ws/embed/movie/'+k+'?season='+s+'&episode='+e; } },
      { id: 'obrut',   label: 'Obrut',       url: function(k,s,e){ return 'https://5414e3c9.obrut.show/embed/kDN?kinopoisk_id='+k+'&season='+s+'&episode='+e; } },
      { id: 'embess',  label: 'Embess',      url: function(k,s,e){ return 'https://api.embess.ws/embed/kp/'+k+'?season='+s+'&episode='+e; } },
      { id: 'lutube',  label: 'Lutube',      url: function(k,s,e){ return 'https://lutube.base44.app/embed/'+k+'?season='+s+'&episode='+e; } },
      { id: 'plvideo', label: 'PlVideo',     url: function(k,s,e){ return 'https://plvideo.base44.app/embed/'+k+'?season='+s+'&episode='+e; } },
      { id: 'cdnvh',   label: 'CDNvideoHub', url: null, type: 'cdnvh' },
      { id: 'vk',      label: 'VK',          url: null, type: 'search', q: function(t,y){ return 'https://vk.com/video?q='+encodeURIComponent(t+' '+y); } },
      { id: 'rutube',  label: 'Rutube',      url: null, type: 'search', q: function(t,y){ return 'https://rutube.ru/search/?query='+encodeURIComponent(t+' '+y); } },
      { id: 'youtube', label: 'YouTube',     url: null, type: 'search', q: function(t,y){ return 'https://www.youtube.com/results?search_query='+encodeURIComponent(t+' '+y); } },
    ],
  };

  // ── CSS инъекция ──────────────────────────────────────────────
  var CSS = [
    '@import url("https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@400;600;700&display=swap");',
    '.kfe-wrap{--kfe-bg:#000;--kfe-surf:#0f0f18;--kfe-surf2:#181825;--kfe-brd:#252538;--kfe-red:#e63946;--kfe-gold:#ffd60a;--kfe-green:#4caf50;--kfe-muted:#7070a0;--kfe-txt:#f0f0f8;',
    'font-family:"Manrope",sans-serif;background:var(--kfe-bg);color:var(--kfe-txt);position:relative;width:100%;user-select:none;}',
    '.kfe-wrap *{box-sizing:border-box;margin:0;padding:0;}',

    // Topbar
    '.kfe-bar{background:var(--kfe-surf);border-bottom:1px solid var(--kfe-brd);padding:0 10px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-height:44px;}',
    '.kfe-logo{font-family:"Bebas Neue",sans-serif;font-size:17px;color:var(--kfe-red);letter-spacing:3px;text-decoration:none;flex-shrink:0;}',
    '.kfe-logo span{color:var(--kfe-gold);}',
    '.kfe-sep{width:1px;height:18px;background:var(--kfe-brd);flex-shrink:0;}',
    '.kfe-lbl{font-size:9px;color:var(--kfe-muted);text-transform:uppercase;letter-spacing:1px;white-space:nowrap;}',
    '.kfe-ctl{display:flex;align-items:center;gap:4px;flex-wrap:wrap;}',

    // Selects
    '.kfe-sel{background:var(--kfe-surf2);border:1px solid var(--kfe-brd);color:var(--kfe-txt);padding:3px 18px 3px 7px;border-radius:4px;font-size:11px;font-family:inherit;outline:none;cursor:pointer;appearance:none;',
    'background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'5\'%3E%3Cpath d=\'M0 0l4 5 4-5z\' fill=\'%238080a0\'/%3E%3C/svg%3E");',
    'background-repeat:no-repeat;background-position:right 5px center;transition:border-color .2s;min-width:52px;}',
    '.kfe-sel:hover{border-color:var(--kfe-red);}',

    // Buttons
    '.kfe-btn{background:var(--kfe-surf2);border:1px solid var(--kfe-brd);color:var(--kfe-txt);padding:3px 8px;border-radius:4px;font-size:10px;cursor:pointer;white-space:nowrap;transition:all .15s;font-family:inherit;}',
    '.kfe-btn:hover{border-color:var(--kfe-red);color:var(--kfe-red);}',
    '.kfe-btn.kfe-on{background:var(--kfe-red);border-color:var(--kfe-red);color:#fff;}',

    // Source chips
    '.kfe-chip{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:10px;border:1px solid var(--kfe-brd);font-size:10px;cursor:pointer;transition:all .15s;background:var(--kfe-surf2);white-space:nowrap;color:var(--kfe-txt);}',
    '.kfe-chip:hover{border-color:var(--kfe-red);}',
    '.kfe-chip.kfe-on{border-color:var(--kfe-red);background:rgba(230,57,70,.2);}',
    '.kfe-dot{width:4px;height:4px;border-radius:50%;flex-shrink:0;}',
    '.kfe-dot-g{background:var(--kfe-green);}',
    '.kfe-dot-y{background:var(--kfe-gold);animation:kfe-blink 1s infinite;}',
    '@keyframes kfe-blink{0%,100%{opacity:1}50%{opacity:.2}}',

    // Episode panel
    '.kfe-epp{background:var(--kfe-surf);border-bottom:1px solid var(--kfe-brd);padding:6px 10px;display:none;max-height:140px;overflow-y:auto;}',
    '.kfe-epp.kfe-open{display:block;}',
    '.kfe-epg{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;}',
    '.kfe-ep{width:32px;height:32px;background:var(--kfe-surf2);border:1px solid var(--kfe-brd);color:var(--kfe-txt);border-radius:4px;font-size:10px;cursor:pointer;transition:all .15s;font-family:inherit;display:flex;align-items:center;justify-content:center;}',
    '.kfe-ep:hover{border-color:var(--kfe-red);color:var(--kfe-red);}',
    '.kfe-ep.kfe-on{background:var(--kfe-red);border-color:var(--kfe-red);color:#fff;}',

    // Player area
    '.kfe-area{position:relative;width:100%;background:#000;}',
    '.kfe-frame{width:100%;height:100%;border:none;display:none;position:absolute;inset:0;}',
    '.kfe-cdn{width:100%;height:100%;display:none;position:absolute;inset:0;background:#000;}',
    '.kfe-cdn video-player{display:block;width:100%;height:100%;}',

    // Search overlay
    '.kfe-so{position:absolute;inset:0;background:var(--kfe-surf);display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:20px;text-align:center;}',
    '.kfe-so.kfe-show{display:flex;}',
    '.kfe-so-ttl{font-family:"Bebas Neue",sans-serif;font-size:20px;letter-spacing:2px;}',
    '.kfe-so-sub{color:var(--kfe-muted);font-size:12px;}',
    '.kfe-so-link{background:var(--kfe-red);color:#fff;padding:10px 22px;border-radius:6px;font-size:13px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:6px;}',

    // AD overlay
    '.kfe-ad{position:absolute;inset:0;z-index:100;background:#000;display:none;flex-direction:column;}',
    '.kfe-ad.kfe-show{display:flex;}',
    '.kfe-ad video{width:100%;flex:1;min-height:0;object-fit:contain;background:#000;}',
    '.kfe-ad-lbl{position:absolute;top:8px;left:8px;background:rgba(230,57,70,.9);color:#fff;padding:2px 7px;border-radius:3px;font-size:9px;letter-spacing:1px;text-transform:uppercase;}',
    '.kfe-ad-bar{position:absolute;bottom:8px;right:8px;display:flex;align-items:center;gap:6px;}',
    '.kfe-ad-timer{background:rgba(0,0,0,.8);color:#fff;padding:4px 10px;border-radius:3px;font-size:11px;}',
    '.kfe-ad-skip{background:var(--kfe-red);color:#fff;border:none;padding:4px 12px;border-radius:3px;font-size:11px;cursor:pointer;display:none;font-family:inherit;}',
    '.kfe-ad-skip.kfe-show{display:block;}',

    // Spinner / Error
    '.kfe-spin-wrap,.kfe-err-wrap{position:absolute;inset:0;z-index:50;background:#000;display:none;flex-direction:column;align-items:center;justify-content:center;gap:10px;}',
    '.kfe-spinner{width:36px;height:36px;border:3px solid var(--kfe-brd);border-top-color:var(--kfe-red);border-radius:50%;animation:kfe-rot .7s linear infinite;}',
    '@keyframes kfe-rot{to{transform:rotate(360deg)}}',
    '.kfe-spin-txt{color:var(--kfe-muted);font-size:11px;}',
    '.kfe-err-ico{font-size:36px;}',
    '.kfe-err-ttl{font-family:"Bebas Neue",sans-serif;font-size:20px;letter-spacing:2px;}',
    '.kfe-err-sub{color:var(--kfe-muted);font-size:12px;text-align:center;}',
    '.kfe-err-btn{background:var(--kfe-red);color:#fff;border:none;padding:7px 18px;border-radius:4px;font-size:12px;cursor:pointer;font-family:inherit;}',

    // Bottom bar
    '.kfe-bot{background:var(--kfe-surf);border-top:1px solid var(--kfe-brd);padding:0 10px;height:24px;display:flex;align-items:center;gap:6px;font-size:10px;color:var(--kfe-muted);}',
    '.kfe-qb{background:var(--kfe-gold);color:#000;padding:1px 5px;border-radius:2px;font-weight:700;font-size:9px;}',
    '.kfe-brand{margin-left:auto;font-family:"Bebas Neue",sans-serif;font-size:13px;letter-spacing:2px;color:var(--kfe-red);text-decoration:none;}',
  ].join('');

  function injectCSS() {
    if (document.getElementById('kfe-styles')) return;
    var s = document.createElement('style');
    s.id = 'kfe-styles';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // ── State helpers ─────────────────────────────────────────────
  var STORE_G = 'kfe_g';
  function loadState(kpId) {
    try {
      var g = JSON.parse(localStorage.getItem(STORE_G) || '{}');
      var f = JSON.parse(localStorage.getItem('kfe_' + kpId) || '{}');
      return {
        source:      g.source      || KFE.sources[0].id,
        translation: g.translation || 'multi',
        season:      parseInt(f.season)  || 1,
        episode:     parseInt(f.episode) || 1,
      };
    } catch(e) { return { source: KFE.sources[0].id, translation: 'multi', season: 1, episode: 1 }; }
  }
  function saveState(kpId, st) {
    try {
      var g = JSON.parse(localStorage.getItem(STORE_G) || '{}');
      g.source = st.source; g.translation = st.translation;
      localStorage.setItem(STORE_G, JSON.stringify(g));
      var f = { season: st.season, episode: st.episode };
      localStorage.setItem('kfe_' + kpId, JSON.stringify(f));
    } catch(e) {}
  }

  // ── KP API: fetch season/episode counts ───────────────────────
  async function fetchSeasons(kpId) {
    try {
      var r = await fetch('https://kinopoiskapiunofficial.tech/api/v2.2/films/' + kpId + '/seasons', {
        headers: { 'X-API-KEY': KFE.kpApiKey, 'Content-Type': 'application/json' }
      });
      var d = await r.json();
      if (d.items && d.items.length) {
        var map = {};
        d.items.forEach(function(s) { map[s.number] = s.episodes ? s.episodes.length : 16; });
        return { total: d.items.length, map: map };
      }
    } catch(e) {}
    return { total: 4, map: { 1:16, 2:16, 3:20, 4:16 } };
  }

  // ── VAST ──────────────────────────────────────────────────────
  async function fetchVASTUrl(vastUrl) {
    try {
      var proxy = 'https://corsproxy.io/?' + encodeURIComponent(vastUrl);
      var r = await fetch(proxy, { signal: AbortSignal.timeout(5000) });
      var xml = await r.text();
      var doc = (new DOMParser()).parseFromString(xml, 'text/xml');
      var mf = doc.querySelector('MediaFile');
      if (mf) return mf.textContent.trim();
    } catch(e) {}
    return null;
  }

  // ── Build a single player instance ───────────────────────────
  async function buildPlayer(container) {
    var kpId   = container.getAttribute('data-kp-id') || '464963';
    var type   = container.getAttribute('data-type')  || 'movie';  // movie | series
    var title  = container.getAttribute('data-title') || '';
    var year   = container.getAttribute('data-year')  || '';
    var height = container.getAttribute('data-height') || '500';

    var st = loadState(kpId);
    var seasons = { total: 1, map: {} };
    if (type === 'series') seasons = await fetchSeasons(kpId);

    var srcMap = {};
    KFE.sources.forEach(function(s) { srcMap[s.id] = s; });
    var srcOrder = KFE.sources.map(function(s) { return s.id; });

    // ── Render HTML ──────────────────────────────────────────
    var uid = 'kfe_' + Math.random().toString(36).slice(2, 8);
    container.innerHTML = buildHTML(uid, type, st, seasons, parseInt(height));
    container.classList.add('kfe-wrap');

    // ── Refs ─────────────────────────────────────────────────
    var $ = function(sel) { return container.querySelector(sel); };

    var frame     = $('#' + uid + '_frame');
    var cdn       = $('#' + uid + '_cdn');
    var so        = $('#' + uid + '_so');
    var soLink    = $('#' + uid + '_soLink');
    var soTtl     = $('#' + uid + '_soTtl');
    var soSub     = $('#' + uid + '_soSub');
    var area      = $('#' + uid + '_area');
    var epp       = $('#' + uid + '_epp');
    var epg       = $('#' + uid + '_epg');
    var adWrap    = $('#' + uid + '_ad');
    var adVid     = $('#' + uid + '_adVid');
    var adTimer   = $('#' + uid + '_adTimer');
    var adSkip    = $('#' + uid + '_adSkip');
    var spinWrap  = $('#' + uid + '_spin');
    var spinTxt   = $('#' + uid + '_spinTxt');
    var errWrap   = $('#' + uid + '_err');
    var selSeason = $('#' + uid + '_selS');
    var selEp     = $('#' + uid + '_selE');
    var botSrc    = $('#' + uid + '_botSrc');
    var botEp     = $('#' + uid + '_botEp');
    var botTitle  = $('#' + uid + '_botTitle');
    var srcsRow   = $('#' + uid + '_srcs');

    var adDone = false;

    // ── Build source chips ────────────────────────────────────
    function renderChips() {
      srcsRow.innerHTML = '';
      KFE.sources.forEach(function(src) {
        var d = document.createElement('div');
        d.className = 'kfe-chip' + (src.id === st.source ? ' kfe-on' : '');
        d.dataset.src = src.id;
        var dotCls = (src.type === 'search') ? 'kfe-dot kfe-dot-y' : 'kfe-dot kfe-dot-g';
        d.innerHTML = '<span class="' + dotCls + '"></span>' + src.label;
        d.onclick = function() { switchSrc(src.id); };
        srcsRow.appendChild(d);
      });
    }

    // ── Build episode grid ────────────────────────────────────
    function renderEpGrid() {
      var count = (seasons.map[st.season] || 16);
      var epsn = container.querySelector('.kfe-epg-s');
      if (epsn) epsn.textContent = st.season;
      epg.innerHTML = '';
      for (var i = 1; i <= count; i++) {
        (function(ep) {
          var b = document.createElement('button');
          b.className = 'kfe-ep' + (ep === st.episode ? ' kfe-on' : '');
          b.textContent = ep;
          b.dataset.ep = ep;
          b.onclick = function() {
            st.episode = ep;
            selEp.value = ep;
            save(); highlightEp(); if (adDone) loadPlayer();
          };
          epg.appendChild(b);
        })(i);
      }
    }

    function highlightEp() {
      container.querySelectorAll('.kfe-ep').forEach(function(b) {
        b.classList.toggle('kfe-on', parseInt(b.dataset.ep) === st.episode);
      });
    }

    // ── Build selects ─────────────────────────────────────────
    function renderSelEp() {
      var count = (seasons.map[st.season] || 16);
      selEp.innerHTML = '';
      for (var i = 1; i <= count; i++) {
        var o = new Option(i, i);
        if (i === st.episode) o.selected = true;
        selEp.appendChild(o);
      }
    }

    // ── Apply translation buttons ─────────────────────────────
    function applyTr() {
      container.querySelectorAll('[data-tr]').forEach(function(b) {
        b.classList.toggle('kfe-on', b.dataset.tr === st.translation);
      });
    }

    // ── Load player ───────────────────────────────────────────
    function hideAll() {
      frame.style.display = 'none'; frame.src = '';
      cdn.style.display = 'none'; cdn.innerHTML = '';
      so.classList.remove('kfe-show');
    }

    function showSpin(txt) {
      spinTxt.textContent = txt || 'Загрузка...';
      spinWrap.style.display = 'flex';
      errWrap.style.display = 'none';
    }
    function hideSpin() { spinWrap.style.display = 'none'; }
    function showErr() { hideSpin(); errWrap.style.display = 'flex'; }

    function updateBot() {
      var src = srcMap[st.source];
      if (botTitle) botTitle.textContent = title || '—';
      if (botSrc)   botSrc.textContent   = src ? src.label : '—';
      if (botEp)    botEp.textContent     = (type === 'series') ? 'S' + st.season + 'E' + st.episode : 'Фильм';
    }

    function save() { saveState(kpId, st); }

    function loadPlayer() {
      var src = srcMap[st.source];
      if (!src) return;
      hideAll(); showSpin('Загрузка: ' + src.label + '...');

      if (src.type === 'cdnvh') {
        loadCDN(src);
      } else if (src.type === 'search') {
        loadSearch(src);
      } else {
        loadIframe(src);
      }
      updateBot(); save();
    }

    function loadIframe(src) {
      var url = src.url(kpId, st.season, st.episode);
      frame.src = url;
      frame.style.display = 'block';
      var tid = setTimeout(hideSpin, 9000);
      frame.onload = function() { clearTimeout(tid); hideSpin(); };
    }

    function loadCDN(src) {
      cdn.innerHTML = '';
      cdn.style.display = 'block';
      var vp = document.createElement('video-player');
      vp.setAttribute('data-publisher-id', '1617');
      vp.setAttribute('data-title-id', kpId);
      vp.setAttribute('data-aggregator', 'kp');
      cdn.appendChild(vp);
      if (!document.querySelector('script[data-kfe-cdn]')) {
        var sc = document.createElement('script');
        sc.src = 'https://player.cdnvideohub.com/s2/stable/video-player.umd.js';
        sc.async = true; sc.dataset.kfeCdn = '1';
        sc.onload = hideSpin; sc.onerror = showErr;
        document.head.appendChild(sc);
      } else { setTimeout(hideSpin, 1500); }
    }

    function loadSearch(src) {
      var url = src.q(title || 'фильм', year);
      var names = { vk: 'ВКонтакте', rutube: 'Rutube', youtube: 'YouTube' };
      soTtl.textContent = 'Поиск на ' + (names[src.engine || src.id] || src.label);
      soSub.textContent = title ? '"' + title + '" — выберите на платформе' : 'Введите название в поиске';
      soLink.href = url;
      soLink.textContent = '↗ Открыть ' + (names[src.engine || src.id] || src.label);
      so.classList.add('kfe-show');
      hideSpin();
    }

    // ── Source switch ─────────────────────────────────────────
    function switchSrc(id) {
      st.source = id;
      save();
      container.querySelectorAll('.kfe-chip').forEach(function(c) {
        c.classList.toggle('kfe-on', c.dataset.src === id);
      });
      if (adDone) loadPlayer();
    }

    function tryNext() {
      var idx = srcOrder.indexOf(st.source);
      st.source = srcOrder[(idx + 1) % srcOrder.length];
      container.querySelectorAll('.kfe-chip').forEach(function(c) {
        c.classList.toggle('kfe-on', c.dataset.src === st.source);
      });
      save(); if (adDone) loadPlayer();
    }

    // ── Events ────────────────────────────────────────────────
    // Translation buttons
    container.querySelectorAll('[data-tr]').forEach(function(b) {
      b.onclick = function() {
        st.translation = b.dataset.tr;
        save(); applyTr(); if (adDone) loadPlayer();
      };
    });

    // Season select
    if (selSeason) {
      selSeason.onchange = function() {
        st.season = parseInt(selSeason.value);
        st.episode = 1;
        save(); renderSelEp(); renderEpGrid(); if (adDone) loadPlayer();
      };
    }

    // Episode select
    if (selEp) {
      selEp.onchange = function() {
        st.episode = parseInt(selEp.value);
        save(); highlightEp(); if (adDone) loadPlayer();
      };
    }

    // Episode panel toggle
    var btnEpp = $('#' + uid + '_btnEpp');
    if (btnEpp) {
      btnEpp.onclick = function() {
        epp.classList.toggle('kfe-open');
      };
    }

    // Error next
    var errBtn = $('#' + uid + '_errBtn');
    if (errBtn) errBtn.onclick = tryNext;

    // ── AD ────────────────────────────────────────────────────
    var adInterval;
    async function runAd() {
      var mediaUrl = await fetchVASTUrl(KFE.vastUrl);
      adWrap.classList.add('kfe-show');

      if (mediaUrl) {
        adVid.src = mediaUrl;
        adVid.play().catch(function() { skipAd(); });
        adVid.onended = skipAd;
        adVid.onerror = skipAd;
      }

      var secs = 30;
      adTimer.textContent = 'Реклама: ' + secs + ' сек';
      adInterval = setInterval(function() {
        secs--;
        adTimer.textContent = 'Реклама: ' + secs + ' сек';
        if (secs <= (30 - KFE.skipAfter)) adSkip.classList.add('kfe-show');
        if (secs <= 0) skipAd();
      }, 1000);
    }

    function skipAd() {
      clearInterval(adInterval);
      adWrap.classList.remove('kfe-show');
      if (adVid) { adVid.pause(); adVid.src = ''; }
      adDone = true;
      loadPlayer();
    }

    adSkip.onclick = skipAd;

    // ── Init ──────────────────────────────────────────────────
    renderChips(); applyTr();
    if (type === 'series') { renderSelEp(); renderEpGrid(); }
    updateBot();
    runAd();
  }

  // ── Build HTML string ─────────────────────────────────────────
  function buildHTML(uid, type, st, seasons, height) {
    var isSeries = (type === 'series');
    var seriesCtl = isSeries ? [
      '<div class="kfe-ctl">',
        '<span class="kfe-lbl">Сезон</span>',
        '<select class="kfe-sel" id="' + uid + '_selS">',
          buildOptions(1, seasons.total, st.season),
        '</select>',
      '</div>',
      '<div class="kfe-ctl">',
        '<span class="kfe-lbl">Серия</span>',
        '<select class="kfe-sel" id="' + uid + '_selE">',
          buildOptions(1, seasons.map[st.season] || 16, st.episode),
        '</select>',
      '</div>',
      '<div class="kfe-sep"></div>',
    ].join('') : '<select style="display:none" id="' + uid + '_selS"></select><select style="display:none" id="' + uid + '_selE"></select>';

    var eppBtn = isSeries ? '<div class="kfe-sep"></div><button class="kfe-btn" id="' + uid + '_btnEpp">📋 Серии</button>' : '';
    var eppPanel = isSeries ? [
      '<div class="kfe-epp" id="' + uid + '_epp">',
        '<span style="font-size:9px;color:var(--kfe-muted);text-transform:uppercase;letter-spacing:1px">Сезон <span class="kfe-epg-s">' + st.season + '</span> — все серии</span>',
        '<div class="kfe-epg" id="' + uid + '_epg"></div>',
      '</div>',
    ].join('') : '';

    return [
      // TOPBAR
      '<div class="kfe-bar">',
        '<a class="kfe-logo" href="https://kinoflex.ru" target="_blank" rel="noopener">Kino<span>Flex</span></a>',
        '<div class="kfe-sep"></div>',
        seriesCtl,
        '<div class="kfe-ctl">',
          '<span class="kfe-lbl">Озвучка</span>',
          '<button class="kfe-btn' + (st.translation === 'multi' ? ' kfe-on' : '') + '" data-tr="multi">Многоголосый</button>',
          '<button class="kfe-btn' + (st.translation === 'orig'  ? ' kfe-on' : '') + '" data-tr="orig">Оригинал</button>',
          '<button class="kfe-btn' + (st.translation === 'sub'   ? ' kfe-on' : '') + '" data-tr="sub">Субтитры</button>',
        '</div>',
        '<div class="kfe-sep"></div>',
        '<div class="kfe-ctl"><span class="kfe-lbl">Источник</span><div style="display:flex;gap:4px;flex-wrap:wrap" id="' + uid + '_srcs"></div></div>',
        eppBtn,
      '</div>',

      // EPISODE PANEL
      eppPanel,

      // PLAYER AREA
      '<div class="kfe-area" id="' + uid + '_area" style="height:' + height + 'px">',

        // AD
        '<div class="kfe-ad" id="' + uid + '_ad">',
          '<span class="kfe-ad-lbl">Реклама</span>',
          '<video id="' + uid + '_adVid" playsinline muted></video>',
          '<div class="kfe-ad-bar">',
            '<div class="kfe-ad-timer" id="' + uid + '_adTimer">Реклама: 30 сек</div>',
            '<button class="kfe-ad-skip" id="' + uid + '_adSkip">Пропустить ›</button>',
          '</div>',
        '</div>',

        // SPINNER
        '<div class="kfe-spin-wrap" id="' + uid + '_spin" style="display:none">',
          '<div class="kfe-spinner"></div>',
          '<div class="kfe-spin-txt" id="' + uid + '_spinTxt">Загрузка...</div>',
        '</div>',

        // ERROR
        '<div class="kfe-err-wrap" id="' + uid + '_err" style="display:none">',
          '<div class="kfe-err-ico">⚡</div>',
          '<div class="kfe-err-ttl">Источник недоступен</div>',
          '<div class="kfe-err-sub">Попробуйте другой источник</div>',
          '<button class="kfe-err-btn" id="' + uid + '_errBtn">Следующий →</button>',
        '</div>',

        // IFRAME
        '<iframe class="kfe-frame" id="' + uid + '_frame" allowfullscreen allow="autoplay; fullscreen" referrerpolicy="no-referrer"></iframe>',

        // CDN
        '<div class="kfe-cdn" id="' + uid + '_cdn"></div>',

        // SEARCH
        '<div class="kfe-so" id="' + uid + '_so">',
          '<div class="kfe-so-ttl" id="' + uid + '_soTtl">Поиск</div>',
          '<div class="kfe-so-sub" id="' + uid + '_soSub">Выберите видео на платформе</div>',
          '<a class="kfe-so-link" id="' + uid + '_soLink" href="#" target="_blank" rel="noopener">↗ Открыть</a>',
        '</div>',

      '</div>',

      // BOTTOM BAR
      '<div class="kfe-bot">',
        '<span class="kfe-qb">HD</span>',
        '<span id="' + uid + '_botTitle">—</span>',
        '<span>•</span>',
        '<span id="' + uid + '_botSrc">—</span>',
        '<span>•</span>',
        '<span id="' + uid + '_botEp">—</span>',
        '<a class="kfe-brand" href="https://kinoflex.ru" target="_blank">KINOFLEX</a>',
      '</div>',
    ].join('');
  }

  function buildOptions(from, to, selected) {
    var out = '';
    for (var i = from; i <= to; i++) {
      out += '<option value="' + i + '"' + (i === selected ? ' selected' : '') + '>' + i + '</option>';
    }
    return out;
  }

  // ── Auto-init all .kinoflex-player containers ─────────────────
  function init() {
    injectCSS();
    var containers = document.querySelectorAll('.kinoflex-player');
    containers.forEach(function(c) {
      if (c.dataset.kfeInit) return;
      c.dataset.kfeInit = '1';
      buildPlayer(c);
    });
  }

  // ── Run ───────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API for dynamic usage
  window.KinoFlex = { init: init, build: buildPlayer };

})(window, document);
