(function () {
    'use strict';

    // ---------- language ----------
    // The pages are written in Chinese; assets/i18n.js maps each Chinese string (a text node,
    // or an alt / aria-label / title value) to English. The choice is remembered per browser;
    // a first visit follows the browser language, and ?lang=en / ?lang=zh overrides it.
    var DICT = window.JT_I18N || {};
    var root = document.documentElement;
    var ATTRS = ['alt', 'aria-label', 'title'];
    var textZh = new WeakMap(), attrZh = new WeakMap();
    var titleZh = document.title;
    var meta = document.querySelector('meta[name="description"]');
    var metaZh = meta && meta.getAttribute('content');
    var lang = 'zh';

    function tr(s) {
        if (lang !== 'en' || !s) return s;
        var key = s.trim();
        return DICT[key] ? s.replace(key, DICT[key]) : s;
    }
    window.jtT = tr;   // for page scripts that write text at run time

    function preferred() {
        try {
            var q = new URLSearchParams(location.search).get('lang');
            if (q === 'en' || q === 'zh') return q;
            var saved = localStorage.getItem('jt-lang');
            if (saved === 'en' || saved === 'zh') return saved;
        } catch (e) {}
        return /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
    }

    function applyLang(next) {
        lang = next === 'en' ? 'en' : 'zh';
        root.lang = lang === 'en' ? 'en' : 'zh-CN';
        root.classList.toggle('lang-en', lang === 'en');
        var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode: function (n) {
                var p = n.parentNode;
                if (!p || !/\S/.test(n.nodeValue) || p.closest('script, style, [data-i18n-skip]')) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        var n;
        while ((n = walker.nextNode())) {
            if (!textZh.has(n)) textZh.set(n, n.nodeValue);
            var v = tr(textZh.get(n));
            if (n.nodeValue !== v) n.nodeValue = v;
        }
        document.querySelectorAll('[alt], [aria-label], [title]').forEach(function (el) {
            if (el.closest('[data-i18n-skip]')) return;
            var saved = attrZh.get(el);
            if (!saved) {
                saved = {};
                ATTRS.forEach(function (a) { if (el.hasAttribute(a)) saved[a] = el.getAttribute(a); });
                attrZh.set(el, saved);
            }
            for (var a in saved) el.setAttribute(a, tr(saved[a]));
        });
        document.title = tr(titleZh);
        if (meta) meta.setAttribute('content', tr(metaZh));
        document.querySelectorAll('[data-lang-toggle]').forEach(function (b) {
            b.setAttribute('aria-label', lang === 'en' ? '切换到中文' : 'Switch to English');
        });
        root.classList.remove('lang-pending');
    }

    applyLang(preferred());
    document.querySelectorAll('[data-lang-toggle]').forEach(function (b) {
        b.addEventListener('click', function () {
            var next = lang === 'en' ? 'zh' : 'en';
            try { localStorage.setItem('jt-lang', next); } catch (e) {}
            applyLang(next);
        });
    });

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
