(function () {
    'use strict';

    // Reveal-on-scroll
    var targets = document.querySelectorAll('.rv, .rv-wipe');
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    io.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
        targets.forEach(function (el) { io.observe(el); });
    } else {
        targets.forEach(function (el) { el.classList.add('in'); });
    }

    // Top-bar clock
    var clock = document.querySelector('[data-clock]');
    if (clock) {
        var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
        var tick = function () {
            var d = new Date();
            var t = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
            clock.textContent = t;
            clock.setAttribute('datetime', t);
        };
        tick();
        setInterval(tick, 1000);
    }

    // Highlight the nav entry for the section in view
    var navLinks = document.querySelectorAll('.nav a[href^="#"]');
    if (navLinks.length && 'IntersectionObserver' in window) {
        var byId = {};
        navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var link = byId[entry.target.id];
                if (!link) return;
                if (entry.isIntersecting) {
                    navLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
                    link.setAttribute('aria-current', 'true');
                } else if (link.getAttribute('aria-current')) {
                    link.removeAttribute('aria-current');
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        Object.keys(byId).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) spy.observe(el);
        });
    }
})();
