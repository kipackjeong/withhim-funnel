(() => {
  'use strict';

  const root = document.documentElement;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hasObserver = 'IntersectionObserver' in window;
  const videos = [...document.querySelectorAll('video.live-screen')];
  const videoVisibility = new Map();
  const pendingPlayback = new Set();
  const unavailableVideos = new Set();
  const demoToggle = document.getElementById('demo-toggle');
  let demosPaused = false;

  function showPoster(video) {
    video.pause();
    if (video.hasAttribute('src')) {
      video.removeAttribute('src');
      video.load();
    }
  }

  function canPlay(video) {
    return !motion.matches && !demosPaused && !document.hidden
      && !unavailableVideos.has(video) && videoVisibility.get(video)
      && video.getClientRects().length > 0
      && (!video.dataset.for || video.classList.contains('on'));
  }

  function syncVideos() {
    videos.forEach(video => {
      // data-src is deliberately absent from the media loader until this
      // particular visible scene is allowed to play. Posters work without JS.
      if (motion.matches) {
        showPoster(video);
      } else if (!canPlay(video)) {
        video.pause();
      } else {
        if (!video.hasAttribute('src')) video.src = video.dataset.src;
        if (!video.paused || pendingPlayback.has(video)) return;
        pendingPlayback.add(video);
        video.play().then(() => {
          pendingPlayback.delete(video);
          if (!canPlay(video)) video.pause();
        }).catch(error => {
          pendingPlayback.delete(video);
          // A preference/visibility change may cancel an in-flight play().
          if (error.name === 'AbortError') return;
          // Autoplay policy or unavailable footage must leave a usable still.
          unavailableVideos.add(video);
          showPoster(video);
        });
      }
    });
  }

  videos.forEach(video => {
    video.muted = true;
    video.addEventListener('error', () => {
      unavailableVideos.add(video);
      showPoster(video);
    });
  });

  if (hasObserver) {
    const videoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        videoVisibility.set(entry.target, entry.isIntersecting && entry.intersectionRatio >= 0.12);
      });
      syncVideos();
    }, { threshold: [0, 0.12] });
    videos.forEach(video => videoObserver.observe(video));
  }

  // The approved HTML hero is an illustrative demo, not a microphone input.
  // Build only its word spans in JS; the verse is already readable in HTML.
  const verse = document.getElementById('verse-words');
  const screen = document.getElementById('alarm-screen');
  const chip = document.getElementById('alarm-chip');
  const chipText = document.getElementById('alarm-chip-text');
  const heroWords = verse.textContent.trim().split(/\s+/);
  const spans = heroWords.map(word => {
    const span = document.createElement('span');
    span.textContent = word;
    return span;
  });
  verse.replaceChildren(...spans.flatMap((span, i) => i ? [document.createTextNode(' '), span] : [span]));
  let heroDelay;
  let heroReading;
  let heroFinish;

  function finishHero() {
    window.clearTimeout(heroDelay);
    window.clearInterval(heroReading);
    window.clearTimeout(heroFinish);
    spans.forEach(span => span.classList.add('lit'));
    screen.classList.remove('listening');
    chip.classList.remove('ringing');
    chip.classList.add('done');
    chipText.textContent = 'Alarm off. Good morning.';
  }

  if (motion.matches || document.hidden) {
    finishHero();
  } else {
    chip.classList.add('ringing');
    heroDelay = window.setTimeout(() => {
      screen.classList.add('listening');
      let index = 0;
      spans[index++].classList.add('lit');
      heroReading = window.setInterval(() => {
        spans[index++].classList.add('lit');
        if (index === spans.length) {
          window.clearInterval(heroReading);
          heroFinish = window.setTimeout(finishHero, 500);
        }
      }, 230);
    }, 1400);
  }

  // A sticky stage is an enhancement only. Without observers or with reduced
  // motion, every moment has its own still and all copy stays in normal flow.
  const day = document.getElementById('mechanism');
  const momentMarkers = [...day.querySelectorAll('.moment time')];
  const stageMedia = [...day.querySelectorAll('.day-stage [data-for]')];
  let dayReady = false;

  function setMoment(name) {
    if (day.dataset.moment === name) return;
    day.dataset.moment = name;
    stageMedia.forEach(media => media.classList.toggle('on', media.dataset.for === name));
    syncVideos();
  }

  function syncDay() {
    if (!dayReady) return;
    const readingLine = window.innerHeight * (window.innerWidth <= 900 ? 0.72 : 0.6);
    let active = 'dawn';
    momentMarkers.forEach(marker => {
      if (marker.getBoundingClientRect().top <= readingLine) {
        active = marker.closest('.moment').dataset.moment;
      }
    });
    setMoment(active);
  }

  function configureDay() {
    dayReady = hasObserver && !motion.matches;
    root.classList.toggle('day-ready', dayReady);
    if (dayReady) syncDay();
    else setMoment('dawn');
  }

  function syncDemoControl() {
    demoToggle.disabled = motion.matches;
    demoToggle.textContent = motion.matches ? 'Motion reduced' : demosPaused ? 'Play demos' : 'Pause demos';
  }

  demoToggle.hidden = false;
  demoToggle.addEventListener('click', () => {
    demosPaused = !demosPaused;
    if (demosPaused) finishHero();
    syncDemoControl();
    syncVideos();
  });

  function preferenceChanged() {
    if (motion.matches) finishHero();
    configureDay();
    syncDemoControl();
    syncVideos();
    scheduleViewport();
  }
  motion.addEventListener('change', preferenceChanged);
  configureDay();
  syncDemoControl();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) finishHero();
    syncVideos();
  });
  window.addEventListener('pagehide', () => {
    finishHero();
    videos.forEach(video => video.pause());
  });
  window.addEventListener('pageshow', () => {
    syncDay();
    syncVideos();
    scheduleViewport();
  });

  // GSAP's media-query context reverts its tweens/ScrollTriggers when the
  // preference changes, including all inline transforms and word opacities.
  // https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/
  if (hasObserver && window.gsap && window.ScrollTrigger) {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);
    const statement = document.getElementById('honest-title');
    const statementText = statement.textContent.trim();
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      statement.setAttribute('aria-label', statementText);
      statement.replaceChildren(...statementText.split(/\s+/).flatMap((word, i) => {
        const span = document.createElement('span');
        span.className = 'reveal-word';
        span.setAttribute('aria-hidden', 'true');
        span.dataset.word = word;
        span.textContent = word;
        span.style.setProperty('--lit', '0');
        return i ? [document.createTextNode(' '), span] : [span];
      }));
      root.classList.add('motion-ready');
      gsap.to('.unfold-phone', {
        rotateX: 0, scale: 1, y: 0, ease: 'none',
        scrollTrigger: { trigger: '.unfold', start: 'top top', end: 'bottom bottom', scrub: true }
      });
      gsap.to('.reveal-word', {
        '--lit': 1, duration: 1, stagger: 1, ease: 'none',
        scrollTrigger: { trigger: '.honest', start: 'top top', end: 'bottom bottom', scrub: true }
      });
      gsap.to('.honest-stage > img', {
        scale: 1, ease: 'none',
        scrollTrigger: { trigger: '.honest', start: 'top top', end: 'bottom bottom', scrub: true }
      });
      gsap.to('.scroll-progress', {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: true }
      });
      return () => {
        root.classList.remove('motion-ready');
        statement.textContent = statementText;
        statement.removeAttribute('aria-label');
      };
    });
    if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  // All 66 figures are in the HTML. Buttons and key handling only add a
  // convenient way to move the native horizontal scroller.
  const rail = document.getElementById('rail');
  const railButtons = [...document.querySelectorAll('.rail-buttons button')];
  document.querySelector('.rail-buttons').hidden = false;
  function moveRail(direction) {
    rail.scrollBy({ left: direction * rail.clientWidth * 0.8, behavior: motion.matches ? 'instant' : 'smooth' });
  }
  function syncRailButtons() {
    const end = rail.scrollWidth - rail.clientWidth;
    railButtons[0].disabled = rail.scrollLeft <= 1;
    railButtons[1].disabled = rail.scrollLeft >= end - 1;
  }
  railButtons.forEach(button => button.addEventListener('click', () => moveRail(Number(button.dataset.dir))));
  rail.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      moveRail(event.key === 'ArrowRight' ? 1 : -1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      rail.scrollTo({ left: event.key === 'Home' ? 0 : rail.scrollWidth, behavior: motion.matches ? 'instant' : 'smooth' });
    }
  });
  rail.addEventListener('scroll', syncRailButtons, { passive: true });
  syncRailButtons();

  // The mobile download bar is never a hidden keyboard stop, and stays away
  // from the closing CTA/footer. Keep it visible while its link has focus.
  const hero = document.querySelector('.hero');
  const closing = document.getElementById('close');
  const sticky = document.getElementById('sticky-cta');
  if (hasObserver) {
    sticky.hidden = false;
    const heroObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) finishHero();
    });
    heroObserver.observe(hero);
  }

  function syncSticky() {
    if (!hasObserver) return;
    const show = (hero.getBoundingClientRect().bottom <= 0
      && closing.getBoundingClientRect().top > window.innerHeight * 0.8)
      || sticky.contains(document.activeElement);
    sticky.classList.toggle('show', show);
    sticky.inert = !show;
    sticky.setAttribute('aria-hidden', String(!show));
  }

  let viewportFrame = 0;
  function scheduleViewport() {
    if (viewportFrame) return;
    viewportFrame = window.requestAnimationFrame(() => {
      viewportFrame = 0;
      syncDay();
      syncSticky();
    });
  }
  window.addEventListener('scroll', scheduleViewport, { passive: true });
  window.addEventListener('resize', () => {
    syncRailButtons();
    scheduleViewport();
  }, { passive: true });
  sticky.addEventListener('focusout', scheduleViewport);
  scheduleViewport();
})();
