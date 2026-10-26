/* Sensing Yuksam: shared script for all pages.
   Reads data/chapters.json and builds the header, footer, chapter grid and chapter pages.
   No libraries, no build step. */
(function () {
  'use strict';

  var DATA_URL = 'data/chapters.json';
  var INK = '#2A2723';
  var FALLBACK_COLOUR = '#55504A';
  var SITE_TITLE_NE = 'सेन्सिङ युक्सम'; // Nepali name shown next to "Sensing Yuksam" in the header

  /* ---------- small helpers ---------- */

  // h('div', {class: 'x'}, child, child...) builds DOM nodes. Text is always inserted
  // as text, never as HTML, so nothing typed into the JSON can break the page.
  function h(tag, props) {
    var node = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        var v = props[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else node.setAttribute(k, v === true ? '' : v);
      });
    }
    for (var i = 2; i < arguments.length; i++) add(node, arguments[i]);
    return node;
  }

  function add(node, child) {
    if (child === null || child === undefined || child === false) return;
    if (Array.isArray(child)) child.forEach(function (c) { add(node, c); });
    else node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }

  // A bare filename like "yak-1.jpg" means "look in the usual folder".
  function assetPath(value, folder) {
    if (!value) return '';
    return value.indexOf('/') === -1 ? folder + value : value;
  }
  var photoPath = function (v) { return assetPath(v, 'assets/photos/'); };
  var videoPath = function (v) { return assetPath(v, 'assets/video/'); };
  var audioPath = function (v) { return assetPath(v, 'assets/audio/'); };

  // Only mark text as Nepali once it really contains Devanagari.
  function nepali(text) {
    return /[ऀ-ॿ]/.test(text || '') ? { lang: 'ne' } : {};
  }

  /* ---------- chapter colours: pick white or ink text, whichever reads better ---------- */

  function luminance(hex) {
    var n = parseInt(hex.slice(1), 16);
    var c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function contrast(a, b) {
    var la = luminance(a), lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }
  function applyColours(el, ch) {
    var bg = /^#[0-9a-f]{6}$/i.test(ch.colour || '') ? ch.colour : FALLBACK_COLOUR;
    var on = contrast(bg, '#FFFFFF') >= contrast(bg, INK) ? '#FFFFFF' : INK;
    el.style.setProperty('--ch', bg);
    el.style.setProperty('--on', on);
    el.style.setProperty('--accent', ch.accent || on);
  }

  /* ---------- data ---------- */

  function loadData() {
    return fetch(DATA_URL).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    });
  }

  function showError(container, err) {
    var local = location.protocol === 'file:';
    container.textContent = '';
    container.appendChild(
      local
        ? h('div', { class: 'msg', role: 'alert' },
            h('p', null, 'This page needs to be opened through a small local server, not by double-clicking the file. Browsers block a page from reading data/chapters.json when it is opened straight from disk.'),
            h('p', null, 'Double-click start-offline.command (Mac) or start-offline.bat (Windows) in the site folder. See the README for details.'))
        : h('div', { class: 'msg', role: 'alert' },
            h('p', null, 'The stories did not load. The network may be slow.'),
            h('p', null, h('a', { href: location.href }, 'Try again')))
    );
    if (window.console) console.error(err);
  }

  /* ---------- header and footer ---------- */

  function renderHeader(page) {
    var header = document.getElementById('site-header');
    if (!header) return;
    var links = [
      ['index.html', 'Home', 'home'],
      ['chapters.html', 'Chapters', 'chapters'],
      ['about.html', 'About', 'about']
    ];
    header.appendChild(h('div', { class: 'wrap' },
      h('a', { class: 'brand', href: 'index.html' },
        h('span', { class: 'brand-name' }, 'Sensing Yuksam'),
        h('span', Object.assign({ class: 'brand-ne' }, nepali(SITE_TITLE_NE)), SITE_TITLE_NE)),
      h('nav', { class: 'nav', 'aria-label': 'Main' }, links.map(function (l) {
        var current = l[2] === page ? 'page' : (l[2] === 'chapters' && page === 'chapter' ? 'true' : null);
        return h('a', { href: l[0], 'aria-current': current }, l[1]);
      }))
    ));
  }

  function renderFooter(site) {
    var footer = document.getElementById('site-footer');
    if (!footer) return;
    site = site || {};
    footer.textContent = '';
    footer.appendChild(h('div', { class: 'wrap' },
      h('p', { class: 'footer-collab' }, 'A collaboration between the Khangchendzonga Conservation Committee and Leiden University'),
      h('div', { class: 'logos' }, (site.logos || []).map(function (l) {
        return h('img', { src: l.src, alt: l.alt || '', loading: 'lazy', height: 64 });
      })),
      site.contact_line ? h('p', { class: 'footer-contact' }, site.contact_line) : null
    ));
  }

  /* ---------- chapter grid ---------- */

  function isSpotlight(ch) { return !/^\d+$/.test(String(ch.number)); }
  function isOpen(ch) { return !!(ch.contributions && ch.contributions.length); }

  function tile(ch) {
    var open = isOpen(ch);
    var spot = isSpotlight(ch);
    var photo = !!ch.cover_image;
    var count = open ? ch.contributions.length : 0;

    var a = h('a', {
      class: 'tile' + (spot ? ' tile--spot' : '') + (photo ? ' tile--photo' : ''),
      href: 'chapter.html?id=' + encodeURIComponent(ch.id)
    });
    applyColours(a, ch);

    var top = h('div', { class: 'tile-top' },
      spot ? h('span', { class: 'tile-label' }, String(ch.number))
           : h('span', { class: 'tile-num', 'aria-hidden': 'true' }, String(ch.number)),
      open ? h('span', { class: 'badge' }, 'Now open') : null);

    var text = [
      h('p', Object.assign({ class: 'tile-ne' }, nepali(ch.title_ne)), ch.title_ne),
      h('h3', { class: 'tile-en' }, ch.title_en),
      h('p', { class: 'tile-desc' }, ch.tagline),
      open ? h('span', { class: 'tile-count' }, count + (count === 1 ? ' contribution' : ' contributions'))
           : h('span', { class: 'tile-flag' }, 'Waiting for stories')
    ];

    if (photo) {
      a.appendChild(h('img', {
        class: 'tile-photo', src: photoPath(ch.cover_image), alt: ch.cover_alt || '',
        loading: 'lazy', decoding: 'async', width: 1200, height: 900
      }));
      a.appendChild(h('div', { class: 'tile-body' }, top, text));
    } else {
      add(a, [top, text]);
    }
    return a;
  }

  function renderGrid(container, chapters) {
    container.textContent = '';
    container.appendChild(h('ul', { class: 'grid' }, chapters.map(function (ch) {
      return h('li', { class: isSpotlight(ch) ? 'spot' : null }, tile(ch));
    })));
  }

  /* ---------- video: thumbnail first, load the player only on tap ---------- */

  // Only ever link to http(s) addresses.
  function safeUrl(u) {
    return /^https?:\/\//i.test(u || '') ? u : '';
  }

  // Works out where a video lives from "youtube_id" or from any pasted link ("url").
  // Returns { kind: 'youtube' | 'facebook' | 'link', id?, url, label } or null.
  function videoSource(c) {
    if (c.youtube_id) {
      return { kind: 'youtube', id: c.youtube_id, url: 'https://www.youtube.com/watch?v=' + encodeURIComponent(c.youtube_id), label: 'YouTube' };
    }
    var url = safeUrl(c.url);
    if (!url) return null;
    var yt = url.match(/(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/i);
    if (yt) return { kind: 'youtube', id: yt[1], url: url, label: 'YouTube' };
    if (/^https?:\/\/([\w-]+\.)*(facebook\.com|fb\.watch|fb\.com)\//i.test(url)) {
      return { kind: 'facebook', url: url, label: 'Facebook' };
    }
    var host = url.replace(/^https?:\/\/(www\.)?/i, '').split('/')[0];
    return { kind: 'link', url: url, label: host };
  }

  function posterFor(c, src) {
    if (c.image) return photoPath(c.image);
    if (src && src.kind === 'youtube') return 'https://i.ytimg.com/vi/' + encodeURIComponent(src.id) + '/hqdefault.jpg';
    return '';
  }

  function liteVideo(c, src) {
    var poster = posterFor(c, src);
    var inner = [
      poster ? h('img', { src: poster, alt: c.alt || '', loading: 'lazy', decoding: 'async' }) : null,
      h('span', { class: 'lite-play', 'aria-hidden': 'true' })
    ];
    // Other websites cannot be embedded safely: the thumbnail opens them in a new tab.
    if (src && src.kind === 'link') {
      return h('a', { class: 'lite', href: src.url, target: '_blank', rel: 'noopener' }, inner,
        h('span', { class: 'sr' }, 'Watch on ' + src.label + ': ' + c.title + ' (opens in a new tab)'));
    }
    var btn = h('button', { type: 'button', class: 'lite' }, inner,
      h('span', { class: 'sr' }, 'Play video: ' + c.title));
    btn.addEventListener('click', function () { playVideo(btn, c, src, poster); });
    return btn;
  }

  // Prefer the offline copy if it is really there (the stall laptop). On GitHub Pages the
  // local file does not exist, so this falls through to YouTube or Facebook.
  function playVideo(btn, c, src, poster) {
    var local = c.local_video ? videoPath(c.local_video) : '';
    var tryLocal = local
      ? fetch(local, { method: 'HEAD' }).then(function (r) { return r.ok; }, function () { return false; })
      : Promise.resolve(false);

    tryLocal.then(function (hasLocal) {
      var node = null;
      if (hasLocal) {
        node = h('video', { class: 'video-frame video-frame--local', src: local, controls: true, autoplay: true, playsinline: true, poster: poster || null, 'aria-label': c.title });
      } else if (src && src.kind === 'youtube') {
        node = h('iframe', {
          class: 'video-frame',
          src: 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(src.id) + '?autoplay=1&rel=0',
          title: c.title,
          allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen',
          allowfullscreen: true,
          referrerpolicy: 'strict-origin-when-cross-origin'
        });
      } else if (src && src.kind === 'facebook') {
        node = h('iframe', {
          class: 'video-frame',
          src: 'https://www.facebook.com/plugins/video.php?show_text=false&autoplay=true&href=' + encodeURIComponent(src.url),
          title: c.title,
          allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen',
          allowfullscreen: true
        });
      } else {
        node = h('p', { class: 'msg', role: 'status' }, 'This film is not available yet.');
      }
      btn.replaceWith(node);
      if (node.focus) node.setAttribute('tabindex', '-1'), node.focus();
    });
  }

  /* ---------- chapter page ---------- */

  var CREDIT = { video: 'filmed by', photo: 'photographed by', audio: 'recorded by' };

  function card(c, ch) {
    var type = c.type || 'video';
    var media, src = null;
    if (type === 'photo') {
      media = h('img', { class: 'card-photo', src: photoPath(c.image), alt: c.alt || '', loading: 'lazy', decoding: 'async' });
    } else if (type === 'audio') {
      media = h('audio', { controls: true, preload: 'none', src: audioPath(c.audio), 'aria-label': c.title });
    } else {
      src = videoSource(c);
      media = liteVideo(c, src);
    }

    var meta = [['Featuring', c.featuring], ['Place', c.place], ['Date', c.date]]
      .filter(function (r) { return r[1]; });

    var paras = (c.description || '').split(/\n+/).filter(Boolean);
    var label = c.credit_label || CREDIT[type] || 'made by';

    return h('article', { class: 'card' },
      h('div', { class: 'card-media' }, media),
      h('div', { class: 'card-body' },
        h('h3', null, c.title),
        c.made_by ? h('p', { class: 'hand made' }, label + ' ',
          safeUrl(c.made_by_url)
            ? h('strong', null, h('a', { href: c.made_by_url, target: '_blank', rel: 'noopener' }, c.made_by))
            : h('strong', null, c.made_by)) : null,
        meta.length ? h('dl', { class: 'meta' }, meta.map(function (r) {
          return [h('dt', null, r[0]), h('dd', null, r[1])];
        })) : null,
        paras.length ? h('blockquote', { class: 'says' }, paras.map(function (p) { return h('p', null, p); })) : null,
        src && src.kind !== 'link'
          ? h('p', { class: 'source' }, h('a', { href: src.url, target: '_blank', rel: 'noopener' }, 'Watch on ' + src.label + ' \u2197'))
          : null
      ));
  }

  function promptList(prompts, small) {
    return h('ol', { class: 'prompts' + (small ? ' prompts--small' : '') },
      prompts.map(function (p) { return h('li', null, p); }));
  }

  function invitation(site) {
    site = site || {};
    return h('section', { class: 'invite', 'aria-labelledby': 'invite-h' },
      h('h2', { id: 'invite-h' }, 'Add to this chapter'),
      h('p', null, 'This chapter is made by people from Yuksam. Film it on your phone and send it to the Sensing Yuksam team.'),
      h('p', null, 'Already posted it on your own YouTube or Facebook? Send us the link. The film stays on your channel and your name stays on it here.'),
      h('div', { class: 'invite-row' },
        site.whatsapp_url ? h('a', { class: 'btn', href: site.whatsapp_url, target: '_blank', rel: 'noopener' }, site.whatsapp_label || 'Send on WhatsApp') : null,
        site.qr_image ? h('div', null,
          h('img', { class: 'invite-qr', src: site.qr_image, alt: site.qr_alt || 'QR code for the WhatsApp number', loading: 'lazy', width: 144, height: 144 }),
          h('p', { class: 'hand invite-qr-note' }, 'or scan with your phone')) : null
      ));
  }

  function renderChapter(root, data) {
    var id = new URLSearchParams(location.search).get('id');
    var chapters = data.chapters || [];
    var idx = -1;
    chapters.forEach(function (c, i) { if (c.id === id) idx = i; });

    root.textContent = '';
    if (idx < 0) {
      root.appendChild(h('div', { class: 'wrap' }, h('div', { class: 'msg' },
        h('p', null, 'We could not find that chapter.'),
        h('p', null, h('a', { href: 'chapters.html' }, 'See all chapters')))));
      return;
    }

    var ch = chapters[idx];
    var numbered = !isSpotlight(ch);
    var contributions = ch.contributions || [];
    var prompts = ch.prompts || [];

    document.title = ch.title_en + ' · Sensing Yuksam';
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta && ch.colour) meta.setAttribute('content', ch.colour);

    var band = h('section', { class: 'band' + (ch.cover_image ? ' band--photo' : ''), 'aria-labelledby': 'chapter-h' },
      h('div', { class: 'wrap' },
        h('a', { class: 'crumb', href: 'chapters.html' }, '← All chapters'),
        h('div', { class: 'band-head' },
          numbered ? h('div', { class: 'band-num', 'aria-hidden': 'true' }, String(ch.number)) : null,
          h('div', null,
            numbered ? null : h('p', { class: 'band-label' }, String(ch.number)),
            h('p', Object.assign({ class: 'title-ne' }, nepali(ch.title_ne)), ch.title_ne),
            h('h1', { id: 'chapter-h' }, ch.title_en))),
        ch.intro ? h('p', { class: 'prompt' }, ch.intro) : null));
    applyColours(band, ch);

    var body = h('div', { class: 'notebook' }, h('div', { class: 'wrap' }));
    applyColours(body, ch);
    var wrap = body.firstChild;

    if (ch.cover_image) {
      wrap.appendChild(h('div', { class: 'cover' }, h('figure', { class: 'pin' },
        h('img', { src: photoPath(ch.cover_image), alt: ch.cover_alt || '', width: 1200, height: 900, decoding: 'async' }))));
    }

    if (contributions.length) {
      wrap.appendChild(h('h2', null, 'Made so far'));
      wrap.appendChild(h('ul', { class: 'cards' }, contributions.map(function (c) {
        return h('li', null, card(c, ch));
      })));
      if (prompts.length) {
        wrap.appendChild(h('h2', { class: 'section-title' }, 'Still waiting for'));
        wrap.appendChild(promptList(prompts, true));
      }
    } else {
      wrap.appendChild(h('h2', null, 'What this chapter is waiting for'));
      wrap.appendChild(h('p', { class: 'lead' }, 'Pick one idea, or bring your own.'));
      if (prompts.length) wrap.appendChild(promptList(prompts, false));
    }

    var invite = invitation(data.site);
    applyColours(invite, ch);
    wrap.appendChild(invite);

    var prev = chapters[idx - 1], next = chapters[idx + 1];
    wrap.appendChild(h('nav', { class: 'next-chapter', 'aria-label': 'Other chapters' },
      prev ? h('a', { href: 'chapter.html?id=' + encodeURIComponent(prev.id), rel: 'prev' }, '← ' + prev.title_en) : h('span'),
      next ? h('a', { href: 'chapter.html?id=' + encodeURIComponent(next.id), rel: 'next' }, next.title_en + ' →') : null));

    root.appendChild(band);
    root.appendChild(body);
  }

  /* ---------- start ---------- */

  function init() {
    var page = document.body.getAttribute('data-page');
    renderHeader(page);

    var target = document.getElementById('chapter-grid') || document.getElementById('chapter-root');
    var needsData = page === 'home' || page === 'chapters' || page === 'chapter' || page === 'about';
    if (!needsData) { renderFooter(null); return; }

    loadData().then(function (data) {
      renderFooter(data.site);
      if (page === 'home' || page === 'chapters') renderGrid(target, data.chapters || []);
      if (page === 'chapter') renderChapter(target, data);
      Array.prototype.forEach.call(document.querySelectorAll('[data-whatsapp]'), function (a) {
        if (data.site && data.site.whatsapp_url) a.setAttribute('href', data.site.whatsapp_url);
      });
    }).catch(function (err) {
      renderFooter(null);
      if (target) showError(target, err);
    });
  }

  init();
})();
