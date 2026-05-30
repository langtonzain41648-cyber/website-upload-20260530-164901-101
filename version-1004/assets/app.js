document.addEventListener('DOMContentLoaded', function () {
  initNavigation();
  initHero();
  initFilters();
  initPlayers();
});

function initNavigation() {
  var toggle = document.querySelector('[data-nav-toggle]');

  if (!toggle) {
    return;
  }

  toggle.addEventListener('click', function () {
    document.body.classList.toggle('nav-open');
  });
}

function initHero() {
  var hero = document.querySelector('[data-hero]');

  if (!hero) {
    return;
  }

  var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
  var active = 0;
  var timer = null;

  function show(index) {
    active = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === active);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === active);
      dot.setAttribute('aria-pressed', dotIndex === active ? 'true' : 'false');
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(active + 1);
    }, 5600);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
    }
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      show(dotIndex);
      start();
    });
  });

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);

  show(0);
  start();
}

function initFilters() {
  var filterRoot = document.querySelector('[data-filter-root]');

  if (!filterRoot) {
    return;
  }

  var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-movie-card]'));
  var keyword = filterRoot.querySelector('[data-filter-keyword]');
  var category = filterRoot.querySelector('[data-filter-category]');
  var region = filterRoot.querySelector('[data-filter-region]');
  var year = filterRoot.querySelector('[data-filter-year]');
  var type = filterRoot.querySelector('[data-filter-type]');
  var empty = filterRoot.querySelector('[data-empty-state]');
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';

  if (keyword && initialQuery) {
    keyword.value = initialQuery;
  }

  function valueOf(element) {
    return element ? element.value.trim().toLowerCase() : '';
  }

  function apply() {
    var q = valueOf(keyword);
    var selectedCategory = valueOf(category);
    var selectedRegion = valueOf(region);
    var selectedYear = valueOf(year);
    var selectedType = valueOf(type);
    var visible = 0;

    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-tags') || '',
        card.getAttribute('data-desc') || ''
      ].join(' ').toLowerCase();

      var matched = true;

      if (q && text.indexOf(q) === -1) {
        matched = false;
      }

      if (selectedCategory && (card.getAttribute('data-category') || '').toLowerCase() !== selectedCategory) {
        matched = false;
      }

      if (selectedRegion && (card.getAttribute('data-region') || '').toLowerCase() !== selectedRegion) {
        matched = false;
      }

      if (selectedYear && (card.getAttribute('data-year') || '').toLowerCase() !== selectedYear) {
        matched = false;
      }

      if (selectedType && (card.getAttribute('data-type') || '').toLowerCase() !== selectedType) {
        matched = false;
      }

      card.style.display = matched ? '' : 'none';

      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  [keyword, category, region, year, type].forEach(function (element) {
    if (!element) {
      return;
    }

    element.addEventListener(element.tagName === 'INPUT' ? 'input' : 'change', apply);
  });

  apply();
}

function initPlayers() {
  var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  shells.forEach(function (shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('[data-play-button]');
    var url = shell.getAttribute('data-video-url');
    var loaded = false;
    var hls = null;

    function load() {
      if (loaded || !video || !url) {
        return Promise.resolve();
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        return new Promise(function (resolve) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
        });
      }

      video.src = url;
      return Promise.resolve();
    }

    function play(event) {
      if (event) {
        event.preventDefault();
      }

      load().then(function () {
        shell.classList.add('is-playing');
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            shell.classList.remove('is-playing');
          });
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    shell.addEventListener('click', function (event) {
      if (event.target === video) {
        play(event);
      }
    });

    if (video) {
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
    }
  });
}
