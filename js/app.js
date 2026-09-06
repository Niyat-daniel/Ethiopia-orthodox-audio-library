document.addEventListener('DOMContentLoaded', function () {

  /* ═══════════════════════════════════════════════
     LOADER PAGE — hide once page is ready
     ═══════════════════════════════════════════════ */
  var loader = document.getElementById('loader');

  function hideLoader() {
    if (loader && !loader.classList.contains('hidden')) {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  if (loader) {
    document.body.style.overflow = 'hidden';
    window.addEventListener('load', function () {
      setTimeout(hideLoader, 400);
    });
    setTimeout(hideLoader, 3500);
  }

  /* ═══════════════════════════════════════════════
     NAVIGATION — Compact on Scroll
     ═══════════════════════════════════════════════ */
  var mainNav = document.getElementById('mainNav');

  function handleNavScroll() {
    if (!mainNav) return;
    if (window.scrollY > 80) {
      mainNav.classList.add('nav--compact');
    } else {
      mainNav.classList.remove('nav--compact');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ═══════════════════════════════════════════════
     MOBILE MENU
     ═══════════════════════════════════════════════ */
  var navToggle = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });

    document.addEventListener('click', function (e) {
      if (mobileMenu.classList.contains('open') &&
          !mobileMenu.contains(e.target) &&
          !navToggle.contains(e.target)) {
        navToggle.classList.remove('open');
        mobileMenu.classList.remove('open');
      }
    });
  }

  /* ═══════════════════════════════════════════════
     SMOOTH SCROLL for anchor links
     ═══════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        var navHeight = mainNav ? mainNav.offsetHeight : 72;
        var top = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight - 10;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ═══════════════════════════════════════════════
     ACTIVE SECTION TRACKING (IntersectionObserver)
     ═══════════════════════════════════════════════ */
  var sections = document.querySelectorAll('section[data-section]');
  var navAnchors = document.querySelectorAll('.nav-links a[data-section], .mobile-menu-inner a[data-section]');

  if (sections.length > 0 && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('data-section');
          navAnchors.forEach(function (a) {
            a.classList.remove('active');
            if (a.getAttribute('data-section') === id) {
              a.classList.add('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ═══════════════════════════════════════════════
     AUDIO PLAYER
     ═══════════════════════════════════════════════ */
  var currentAudio = null;
  var currentCard = null;

  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function stopAllExcept(audio, card) {
    document.querySelectorAll('.track-audio').forEach(function (a) {
      if (a !== audio) {
        a.pause();
        a.currentTime = 0;
      }
    });
    document.querySelectorAll('.track-card').forEach(function (c) {
      if (c !== card) {
        c.classList.remove('playing');
        var btn = c.querySelector('.play-btn');
        if (btn) btn.innerHTML = getPlayIcon();
        var fill = c.querySelector('.progress-fill');
        if (fill) fill.style.width = '0%';
      }
    });
  }

  function getPlayIcon() {
    return '<svg viewBox="0 0 24 24"><polygon points="6,3 20,12 6,21"/></svg>';
  }

  function getPauseIcon() {
    return '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="4" height="18"/><rect x="15" y="3" width="4" height="18"/></svg>';
  }

  document.querySelectorAll('.track-card').forEach(function (card) {
    var audio = card.querySelector('.track-audio');
    var playBtn = card.querySelector('.play-btn');
    var progressBar = card.querySelector('.progress-bar');
    var progressFill = card.querySelector('.progress-fill');
    var currentTimeEl = card.querySelector('.current-time');
    var durationEl = card.querySelector('.duration');

    if (!audio || !playBtn) return;

    playBtn.addEventListener('click', function () {
      if (currentAudio && currentAudio !== audio) {
        stopAllExcept(audio, card);
      }

      if (audio.paused) {
        audio.play();
        playBtn.innerHTML = getPauseIcon();
        card.classList.add('playing');
        currentAudio = audio;
        currentCard = card;
      } else {
        audio.pause();
        playBtn.innerHTML = getPlayIcon();
        card.classList.remove('playing');
      }
    });

    audio.addEventListener('loadedmetadata', function () {
      if (durationEl) durationEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('timeupdate', function () {
      if (audio.duration) {
        var pct = (audio.currentTime / audio.duration) * 100;
        if (progressFill) progressFill.style.width = pct + '%';
        if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
      }
    });

    audio.addEventListener('ended', function () {
      playBtn.innerHTML = getPlayIcon();
      card.classList.remove('playing');
      if (progressFill) progressFill.style.width = '0%';
      if (currentTimeEl) currentTimeEl.textContent = '0:00';
      currentAudio = null;
      currentCard = null;
    });

    if (progressBar) {
      progressBar.addEventListener('click', function (e) {
        if (audio.duration) {
          var rect = progressBar.getBoundingClientRect();
          var x = e.clientX - rect.left;
          var pct = x / rect.width;
          audio.currentTime = pct * audio.duration;
        }
      });
    }
  });
});
