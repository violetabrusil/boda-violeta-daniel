/* Invitación Violeta & Daniel — lógica */
(function () {
  'use strict';

  /* ---------- Datos de la boda ---------- */
  var WA_NUMBER = '593998252106';
  var WA_MESSAGE = 'Hola Violeta y Daniel, confirmo mi asistencia a su boda. ❤️';
  // 17 de octubre de 2026, 3:00 PM, hora de Ecuador (UTC-5)
  var TARGET = new Date('2026-10-17T15:00:00-05:00').getTime();

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Enlaces: WhatsApp y Google Calendar ---------- */
  var wa = $('#waBtn');
  if (wa) wa.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(WA_MESSAGE);

  var cal = $('#calBtn');
  if (cal) {
    var details =
      'Ceremonia civil 3:00 PM · Registro Civil River Mall, Sangolquí.\n\n' +
      'Recepción 5:00 PM · Casa Comunal del Conjunto Jardines del Chamizal.';
    var params = new URLSearchParams({
      action: 'TEMPLATE',
      text: 'Boda Violeta & Daniel',
      // Hora local de Ecuador, indicada con ctz (sin "Z")
      dates: '20261017T150000/20261017T190000',
      ctz: 'America/Guayaquil',
      details: details,
      location: 'Sangolquí, Ecuador'
    });
    cal.href = 'https://calendar.google.com/calendar/render?' + params.toString();
  }

  /* ---------- Animaciones al hacer scroll ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Menú discreto ---------- */
  var menuBtn = $('#menuBtn'), menuPanel = $('#menuPanel');
  function closeMenu() {
    menuPanel.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
  }
  menuBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = menuPanel.hidden;
    menuPanel.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  menuPanel.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeMenu(); });
  document.addEventListener('click', function (e) {
    if (!menuPanel.hidden && !menuPanel.contains(e.target)) closeMenu();
  });

  /* ---------- Fotografías con placeholder elegante ---------- */
  var photos = $$('.ph');
  function markEmpty(ph) { ph.classList.add('empty'); }
  photos.forEach(function (ph) {
    var img = $('img', ph);
    if (!img) return;
    img.addEventListener('error', function () { markEmpty(ph); });
    img.addEventListener('load', function () { ph.classList.remove('empty'); });
    if (img.complete && img.naturalWidth === 0) markEmpty(ph);
  });

  /* ---------- Cuenta regresiva ---------- */
  var cD = $('#cDias'), cH = $('#cHoras'), cM = $('#cMin'), cS = $('#cSeg');
  var clock = $('#clock'), clockDone = $('#clockDone');
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function tick() {
    var diff = TARGET - Date.now();
    if (diff <= 0) {
      clock.hidden = true; clockDone.hidden = false;
      return false;
    }
    var s = Math.floor(diff / 1000);
    var d = Math.floor(s / 86400); s -= d * 86400;
    var h = Math.floor(s / 3600); s -= h * 3600;
    var m = Math.floor(s / 60); s -= m * 60;
    cD.textContent = pad(d); cH.textContent = pad(h); cM.textContent = pad(m); cS.textContent = pad(s);
    return true;
  }
  if (tick()) {
    var timer = setInterval(function () { if (!tick()) clearInterval(timer); }, 1000);
  }

  /* ---------- Reproductor de música ---------- */
  var audio = $('#audio'), player = $('#player'), playBtn = $('#playBtn');
  var bar = $('#progressBar'), dot = $('#progressDot'), prog = $('#progress');
  var tCur = $('#tCur'), tDur = $('#tDur'), status = $('#playerStatus');

  function fmt(t) {
    if (!isFinite(t)) return '0:00';
    var m = Math.floor(t / 60), s = Math.floor(t % 60);
    return m + ':' + pad(s);
  }
  function paint() {
    var d = audio.duration, c = audio.currentTime;
    var pct = d ? (c / d) * 100 : 0;
    bar.style.width = pct + '%';
    dot.style.left = pct + '%';
    prog.setAttribute('aria-valuenow', String(Math.round(pct)));
    tCur.textContent = fmt(c);
  }
  function setState(playing) {
    player.classList.toggle('playing', playing);
    playBtn.setAttribute('aria-label', playing ? 'Pausar canción' : 'Reproducir canción');
    if (!player.classList.contains('error')) status.textContent = playing ? 'Sonando ahora' : 'Pulsa para escuchar';
  }
  function showError() {
    player.classList.add('error');
    status.textContent = 'Agrega musica/nuestra-cancion.mp3';
    setState(false);
  }

  audio.addEventListener('loadedmetadata', function () { tDur.textContent = fmt(audio.duration); paint(); });
  audio.addEventListener('timeupdate', paint);
  audio.addEventListener('play', function () { setState(true); });
  audio.addEventListener('pause', function () { setState(false); });
  audio.addEventListener('ended', function () { audio.currentTime = 0; setState(false); paint(); });
  audio.addEventListener('error', showError);

  playBtn.addEventListener('click', function () {
    if (player.classList.contains('error')) {
      // reintento por si ya se agregó el archivo
      player.classList.remove('error');
      audio.load();
    }
    if (audio.paused) {
      var p = audio.play();
      if (p && p.catch) p.catch(showError);
    } else {
      audio.pause();
    }
  });

  function seekFromEvent(e) {
    var rect = prog.getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    var ratio = Math.max(0, Math.min(1, x / rect.width));
    if (audio.duration) { audio.currentTime = ratio * audio.duration; paint(); }
  }
  var dragging = false;
  prog.addEventListener('pointerdown', function (e) { dragging = true; prog.setPointerCapture(e.pointerId); seekFromEvent(e); });
  prog.addEventListener('pointermove', function (e) { if (dragging) seekFromEvent(e); });
  prog.addEventListener('pointerup', function () { dragging = false; });
  prog.addEventListener('pointercancel', function () { dragging = false; });
  prog.addEventListener('keydown', function (e) {
    if (!audio.duration) return;
    if (e.key === 'ArrowRight') { audio.currentTime = Math.min(audio.duration, audio.currentTime + 5); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { audio.currentTime = Math.max(0, audio.currentTime - 5); e.preventDefault(); }
  });

  /* ---------- Lightbox de la galería ---------- */
  var lb = $('#lightbox'), lbImg = $('#lbImg');
  var gallery = $$('.g .ph');
  var current = -1;

  function available() {
    return gallery.filter(function (ph) { return !ph.classList.contains('empty'); });
  }
  function openAt(ph) {
    var list = available();
    current = list.indexOf(ph);
    if (current < 0) return;
    show(list[current]);
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function show(ph) {
    var img = $('img', ph);
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
  }
  function close() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function step(dir) {
    var list = available();
    if (!list.length) return;
    current = (current + dir + list.length) % list.length;
    show(list[current]);
  }

  gallery.forEach(function (ph) {
    ph.addEventListener('click', function () { if (!ph.classList.contains('empty')) openAt(ph); });
  });
  // fotos de la historia y mascotas también se pueden ampliar individualmente
  $$('.story-photo .ph, .pet .ph').forEach(function (ph) {
    ph.addEventListener('click', function () {
      if (ph.classList.contains('empty')) return;
      var img = $('img', ph);
      lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt;
      current = -1;
      lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  $('#lbClose').addEventListener('click', close);
  $('#lbPrev').addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
  $('#lbNext').addEventListener('click', function (e) { e.stopPropagation(); step(1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) { if (e.key === 'Escape') closeMenu(); return; }
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
  // deslizar en móvil
  var sx = 0;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50 && current >= 0) step(dx < 0 ? 1 : -1);
  }, { passive: true });
})();
