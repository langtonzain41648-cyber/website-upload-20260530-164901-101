(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var previous = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var activeIndex = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }

        activeIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === activeIndex);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === activeIndex);
        });
      }

      function startTimer() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          showSlide(activeIndex + 1);
        }, 5200);
      }

      if (previous) {
        previous.addEventListener("click", function () {
          showSlide(activeIndex - 1);
          startTimer();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(activeIndex + 1);
          startTimer();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
          startTimer();
        });
      });

      startTimer();
    }

    var globalSearchForms = Array.prototype.slice.call(document.querySelectorAll("[data-global-search]"));

    globalSearchForms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";

        if (!query) {
          return;
        }

        event.preventDefault();
        window.location.href = "./movies.html?q=" + encodeURIComponent(query);
      });
    });

    var searchList = document.querySelector("[data-search-list]");
    var searchForm = document.querySelector("[data-search-form]");
    var noResults = document.querySelector("[data-no-results]");
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
    var activeFilter = "all";

    function normalize(value) {
      return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function applyFilter() {
      if (!searchList) {
        return;
      }

      var input = searchForm ? searchForm.querySelector("input[name='q']") : null;
      var query = normalize(input ? input.value : "");
      var cards = Array.prototype.slice.call(searchList.querySelectorAll("[data-movie-card]"));
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchFilter = activeFilter === "all" || haystack.indexOf(normalize(activeFilter)) !== -1;
        var visible = matchQuery && matchFilter;

        card.style.display = visible ? "" : "none";

        if (visible) {
          shown += 1;
        }
      });

      if (noResults) {
        noResults.classList.toggle("is-visible", shown === 0);
      }
    }

    if (searchForm) {
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q");
      var searchInput = searchForm.querySelector("input[name='q']");

      if (initialQuery && searchInput) {
        searchInput.value = initialQuery;
      }

      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilter();
      });

      if (searchInput) {
        searchInput.addEventListener("input", applyFilter);
      }
    }

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = button.getAttribute("data-filter") || "all";

        filterButtons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });

        applyFilter();
      });
    });

    applyFilter();

    var player = document.querySelector("[data-player]");

    if (player) {
      var video = player.querySelector("video");
      var playButton = player.querySelector("[data-play-button]");
      var mediaUrl = player.getAttribute("data-video");
      var loaded = false;
      var hlsInstance = null;

      function bindMedia() {
        if (loaded || !video || !mediaUrl) {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = mediaUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(mediaUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = mediaUrl;
        }

        loaded = true;
      }

      function startPlayback() {
        bindMedia();

        if (!video) {
          return;
        }

        player.classList.add("is-playing");
        var attempt = video.play();

        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            player.classList.remove("is-playing");
          });
        }
      }

      if (playButton) {
        playButton.addEventListener("click", startPlayback);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (!loaded || video.paused) {
            startPlayback();
          }
        });

        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });

        video.addEventListener("pause", function () {
          if (!video.ended) {
            player.classList.remove("is-playing");
          }
        });

        window.addEventListener("beforeunload", function () {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
        });
      }
    }
  });
})();
