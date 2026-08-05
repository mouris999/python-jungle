/* ============================================================
   Python Jungle — Personalization System (v3)
   Modular IIFE: animated coconut cursor, settings panel,
   themes, particles, accessibility, sounds, background FX,
   account sync (Firebase RTDB REST).
   Zero dependencies. Auto-saves to localStorage.
   ============================================================ */
(function () {
  'use strict';

  if (window.PJLoaded) return;
  window.PJLoaded = true;

  var D = document, W = window;

  /* ---------- defaults ---------- */
  var DEF = {
    cursor: { enabled: true, size: 44, style: 'coconut', speed: 0.14, trail: 6, trailColor: '#FFD700', trailOpacity: 0.35, glow: 14, density: 0.5, clickAnim: true, hoverAnim: true, idleAnim: true, physics: 0.6, shadow: true, customImg: null },
    appearance: { theme: 'jungle', accent: '#FFD700', accent2: '#FFA500', font: 'system', fontSize: 100, letterSpacing: 0, lineHeight: 1.6, radius: 10, shadow: 40, glass: 50, animSpeed: 100 },
    a11y: { reduceMotion: false, highContrast: false, largeCursor: false, focusMode: false, colorBlind: 'none', readingMode: false, dyslexiaFont: false },
    sound: { enabled: true, click: true, hover: true, nature: 'none', volume: 70, muted: false },
    bg: { effect: 'none', performance: false },
    layout: { sidebarWidth: 260, density: 'comfortable', rounded: true, animIntensity: 100, scrollbar: 'auto' },
    dev: { fps: false, stats: false },
    lang: 'en',
    customTheme: null
  };
  var SET = load();
  function save() { try { localStorage.setItem('pj_settings', JSON.stringify(SET)); } catch (e) {} if (sync.uid && !sync.applying) schedulePush(); }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem('pj_settings') || '{}');
      mergeDeep(DEF, s);
    } catch (e) {}
    return DEF;
  }
  function mergeDeep(d, s) {
    if (!s || typeof s !== 'object') return;
    Object.keys(d).forEach(function (k) {
      if (s[k] !== undefined) {
        if (d[k] && typeof d[k] === 'object' && !Array.isArray(d[k]) && typeof s[k] === 'object' && !Array.isArray(s[k])) mergeDeep(d[k], s[k]);
        else d[k] = s[k];
      }
    });
  }

  var REDUCED = W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COARSE = W.matchMedia('(pointer: coarse)').matches;
  var DPR = Math.min(W.devicePixelRatio || 1, 2);
  var QUALITY = quality();
  function quality() {
    var p = 1;
    try {
      var mem = navigator.deviceMemory || 4;
      var cores = navigator.hardwareConcurrency || 4;
      if (mem <= 2 || cores <= 2) p = 0.3; else if (mem <= 4 || cores <= 4) p = 0.6;
    } catch (e) {}
    if (SET.bg.performance) p = 0.3;
    return p;
  }

  /* ============================================================
     CSS
     ============================================================ */
  var CSS = `
#pjCursor, #pjCursorCanvas{position:fixed;top:0;left:0;pointer-events:none;z-index:2147483647}
#pjCursorCanvas{width:100vw;height:100vh}
html.pj-cursor-on,html.pj-cursor-on *{cursor:none !important}
#pjFps{position:fixed;top:4px;left:4px;z-index:2147483646;background:rgba(0,0,0,.75);color:#0f0;font:11px/1.5 Consolas,monospace;padding:4px 8px;border-radius:6px;pointer-events:none;display:none}
#pjFps.on{display:block}
#pjStats{position:fixed;bottom:4px;left:4px;z-index:2147483646;background:rgba(0,0,0,.75);color:#7fd4ff;font:10px/1.5 Consolas,monospace;padding:4px 8px;border-radius:6px;pointer-events:none;display:none}
#pjStats.on{display:block}
#pjBG{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0}
#pjGear{position:fixed;right:16px;bottom:16px;width:52px;height:52px;border-radius:50%;background:rgba(13,27,13,.7);border:2px solid var(--bright-yellow,#FFD700);color:#FFD700;font-size:22px;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:2147483645;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s;box-shadow:0 4px 20px rgba(0,0,0,.4)}
#pjGear:hover{transform:rotate(90deg) scale(1.1);box-shadow:0 0 24px rgba(255,215,0,.45)}
#pjGear.open{transform:rotate(90deg)}
#pjPanel{position:fixed;right:12px;bottom:78px;width:340px;max-width:calc(100vw - 24px);max-height:calc(100vh - 96px);overflow-y:auto;background:rgba(13,27,13,.72);border:1px solid rgba(255,215,0,.25);border-radius:16px;z-index:2147483645;padding:14px;transform:translateY(30px) scale(.96);opacity:0;pointer-events:none;transition:transform .4s cubic-bezier(.34,1.56,.64,1),opacity .3s;backdrop-filter:blur(14px) saturate(1.2);-webkit-backdrop-filter:blur(14px) saturate(1.2);box-shadow:0 12px 40px rgba(0,0,0,.5);scrollbar-width:thin}
#pjPanel.open{transform:translateY(0) scale(1);opacity:1;pointer-events:auto}
#pjPanel::-webkit-scrollbar{width:8px}
#pjPanel::-webkit-scrollbar-thumb{background:rgba(255,215,0,.3);border-radius:4px}
#pjPanel h3{color:#FFD700;font:700 11px 'Segoe UI',system-ui,sans-serif;letter-spacing:1px;margin:4px 0 10px;display:flex;align-items:center;gap:6px}
#pjPanel h3 .dot{width:6px;height:6px;border-radius:50%;background:#FFD700;display:inline-block}
.pj-tabs{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px}
.pj-tab{padding:5px 9px;border-radius:8px;font-size:10px;color:#A8C89A;cursor:pointer;border:1px solid rgba(255,255,255,.08);transition:all .15s;background:rgba(255,255,255,.03)}
.pj-tab:hover{color:#FFD700;border-color:rgba(255,215,0,.4)}
.pj-tab.act{background:rgba(255,215,0,.15);color:#FFD700;border-color:rgba(255,215,0,.5)}
.pj-sec{display:none}
.pj-sec.act{display:block}
.pj-row{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:7px 0}
.pj-lbl{font-size:10.5px;color:#C9DCC0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pj-val{font-size:10px;color:#FFD700;min-width:30px;text-align:right;font-variant-numeric:tabular-nums}
.pj-in{flex:1;max-width:150px;accent-color:#FFD700;height:4px;cursor:pointer}
.pj-sel{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:#E8F0E2;font-size:10.5px;padding:4px 6px;border-radius:6px;max-width:170px;outline:none}
.pj-sel:focus{border-color:#FFD700}
.pj-switch{position:relative;width:36px;height:20px;flex:none}
.pj-switch input{opacity:0;width:0;height:0}
.pj-switch i{position:absolute;inset:0;background:rgba(255,255,255,.12);border-radius:20px;transition:.25s;cursor:pointer}
.pj-switch i:before{content:'';position:absolute;width:14px;height:14px;left:3px;top:3px;background:#aaa;border-radius:50%;transition:.25s}
.pj-switch input:checked + i{background:rgba(255,215,0,.5)}
.pj-switch input:checked + i:before{transform:translateX(16px);background:#FFD700}
.pj-btn{background:linear-gradient(135deg,rgba(255,215,0,.2),rgba(255,165,0,.15));border:1px solid rgba(255,215,0,.4);color:#FFD700;font-size:10px;padding:6px 10px;border-radius:8px;cursor:pointer;transition:all .2s;margin:3px 2px}
.pj-btn:hover{background:linear-gradient(135deg,rgba(255,215,0,.35),rgba(255,165,0,.25));transform:translateY(-1px)}
.pj-btn.danger{border-color:rgba(231,76,60,.5);color:#E74C3C;background:rgba(231,76,60,.12)}
.pj-btn.danger:hover{background:rgba(231,76,60,.25)}
.pj-col{width:32px;height:22px;border:1px solid rgba(255,255,255,.2);border-radius:6px;background:transparent;cursor:pointer;padding:0}
.pj-swatch{width:20px;height:20px;border-radius:50%;cursor:pointer;border:2px solid rgba(255,255,255,.25);transition:transform .15s;flex:none}
.pj-swatch:hover{transform:scale(1.15)}
.pj-swatches{display:flex;gap:6px;flex-wrap:wrap;margin:4px 0}
.pj-note{font-size:9px;color:#888;margin-top:4px;line-height:1.4}
.pj-acc{display:flex;gap:6px;align-items:center;margin:4px 0}
#pjPanel input[type=text],#pjPanel input[type=number]{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:#E8F0E2;font-size:10.5px;padding:5px 7px;border-radius:6px;outline:none;width:100%;box-sizing:border-box}
#pjPanel input[type=text]:focus{border-color:#FFD700}
.pj-hr{border:none;border-top:1px solid rgba(255,255,255,.08);margin:10px 0}
@media (max-width:600px){#pjPanel{width:calc(100vw - 24px)}}
/* ---- accessibility overrides ---- */
html.pj-hc{filter:contrast(1.4) brightness(1.06) saturate(1.25)}
html.pj-hc body{background:#000}
html.pj-hc .btn,html.pj-hc .lang-card,html.pj-hc .topic,html.pj-hc .topics-table td{border-color:var(--bright-yellow) !important}
html.pj-focus *{outline-color:#FFD700 !important}
html.pj-focus :focus{outline:2px solid #FFD700 !important;outline-offset:2px !important}
html.pj-rd .lesson-left,html.pj-rd .hero,html.pj-rd .topics-section,html.pj-rd .modal{max-width:760px;margin-left:auto;margin-right:auto}
html.pj-rd{filter:none !important}
html.pj-dys .lesson-left,html.pj-dys .hero,html.pj-dys .sub-banner,html.pj-dys p,html.pj-dys li,html.pj-dys .t-name{font-family:'OpenDyslexic','Comic Sans MS','Comic Sans',cursive !important;letter-spacing:.02em;line-height:1.8}
html.pj-rm *,html.pj-rm *::before,html.pj-rm *::after{animation-duration:.01s !important;animation-iteration-count:1 !important;transition-duration:.01s !important}
html.pj-rm #pjCursorCanvas,html.pj-rm #pjBG{display:none !important}
/* ---- colorblind filters ---- */
html.pj-cb-protanopia{filter:url(#pjCbProtanopia)}
html.pj-cb-deuteranopia{filter:url(#pjCbDeuteranopia)}
html.pj-cb-tritanopia{filter:url(#pjCbTritanopia)}
/* ---- theme: CSS variable overrides (app uses these) ---- */
html[data-pj-theme=ocean]{--jungle-green:#1E88A5;--deep-emerald:#0F4C5C;--dark-canopy:#041E26;--bright-yellow:#4FC3F7;--golden-amber:#26A69A;--vine-green:#80CBC4;--tropical-blue:#29B6F6;--text-primary:#E0F7FA;--text-secondary:#9AD1D9}
html[data-pj-theme=forest]{--jungle-green:#388E3C;--deep-emerald:#1B5E20;--dark-canopy:#0C160C;--bright-yellow:#AEEA00;--golden-amber:#76FF03;--vine-green:#AED581;--text-primary:#F1F8E9;--text-secondary:#B7D4A8}
html[data-pj-theme=sunset]{--jungle-green:#E65100;--deep-emerald:#BF360C;--dark-canopy:#2A0E0E;--bright-yellow:#FFB300;--golden-amber:#FF6F00;--vine-green:#FFAB91;--tropical-blue:#FF7043;--text-primary:#FFF3E0;--text-secondary:#FFCCBC}
html[data-pj-theme=midnight]{--jungle-green:#3949AB;--deep-emerald:#1A237E;--dark-canopy:#0A0E1F;--bright-yellow:#7986CB;--golden-amber:#5C6BC0;--vine-green:#9FA8DA;--text-primary:#E8EAF6;--text-secondary:#C5CAE9}
html[data-pj-theme=cyberpunk]{--jungle-green:#00E5FF;--deep-emerald:#00B8D4;--dark-canopy:#0B0B1A;--bright-yellow:#FF2D95;--golden-amber:#FF6EC7;--vine-green:#00E676;--text-primary:#E0FFFF;--text-secondary:#A7F3D0}
html[data-pj-theme=minimal]{--jungle-green:#607D8B;--deep-emerald:#455A64;--dark-canopy:#111418;--bright-yellow:#ECEFF1;--golden-amber:#CFD8DC;--vine-green:#B0BEC5;--text-primary:#FFFFFF;--text-secondary:#B0BEC5}
html[data-pj-theme=vintage]{--jungle-green:#8D6E63;--deep-emerald:#5D4037;--dark-canopy:#241B16;--bright-yellow:#FFE082;--golden-amber:#FFD54F;--vine-green:#BCAAA4;--text-primary:#FFF8E1;--text-secondary:#D7CCC8}
html[data-pj-theme=coffee]{--jungle-green:#A1887F;--deep-emerald:#5D4037;--dark-canopy:#1E120C;--bright-yellow:#D7CCC8;--golden-amber:#BCAAA4;--vine-green:#D7CCC8;--text-primary:#EFEBE9;--text-secondary:#BCAAA4}
html[data-pj-theme=emerald]{--jungle-green:#00C853;--deep-emerald:#009624;--dark-canopy:#05140B;--bright-yellow:#69F0AE;--golden-amber:#00E676;--vine-green:#B9F6CA;--text-primary:#E8F5E9;--text-secondary:#A5D6A7}
html[data-pj-theme=purple]{--jungle-green:#7E57C2;--deep-emerald:#4A148C;--dark-canopy:#14081F;--bright-yellow:#CE93D8;--golden-amber:#AB47BC;--vine-green:#D1C4E9;--text-primary:#F3E5F5;--text-secondary:#CE93D8}
html[data-pj-theme=light]{--jungle-green:#43A047;--deep-emerald:#2E7D32;--dark-canopy:#F4F7F2;--bright-yellow:#F9A825;--golden-amber:#F57F17;--vine-green:#66BB6A;--text-primary:#1B2A1B;--text-secondary:#4E6650;--cloud-white:#FFFFFF}
html[data-pj-theme=amoled]{--jungle-green:#1B5E20;--deep-emerald:#0D3B10;--dark-canopy:#000000;--bright-yellow:#FFD700;--golden-amber:#FFA500;--vine-green:#388E3C;--text-primary:#D4D4D4;--text-secondary:#777777}
html[data-pj-theme=auto]{--jungle-green:#2D8F4E;--deep-emerald:#1A6B3C;--dark-canopy:#0D1B0D;--bright-yellow:#FFD700;--golden-amber:#FFA500;--vine-green:#6ABF69;--text-primary:#E8F0E2;--text-secondary:#A8C89A;--cloud-white:#FFFFFF;background:#0D1B0D}
@media (prefers-color-scheme: light){html[data-pj-theme=auto]{--jungle-green:#43A047;--deep-emerald:#2E7D32;--dark-canopy:#F4F7F2;--bright-yellow:#F9A825;--golden-amber:#F57F17;--vine-green:#66BB6A;--text-primary:#1B2A1B;--text-secondary:#4E6650;--cloud-white:#FFFFFF;background:#F4F7F2}}
html[data-pj-theme=ocean],html[data-pj-theme=forest],html[data-pj-theme=sunset],html[data-pj-theme=midnight],html[data-pj-theme=cyberpunk],html[data-pj-theme=minimal],html[data-pj-theme=vintage],html[data-pj-theme=coffee],html[data-pj-theme=emerald],html[data-pj-theme=purple]{background:var(--dark-canopy)}
/* custom theme */
html[data-pj-theme=custom]{--jungle-green:var(--c-accent);--deep-emerald:var(--c-accent2);--dark-canopy:var(--c-bg);--bright-yellow:var(--c-accent);--golden-amber:var(--c-accent2);--vine-green:var(--c-accent);--text-primary:var(--c-text);--text-secondary:var(--c-text2);--cloud-white:var(--c-text)}
html[data-pj-theme=custom] body,html[data-pj-theme=custom] #app{background:var(--c-bg)}
html[data-pj-theme=custom] .modal{background:var(--c-card)}
/* layout settings */
html[data-pj-layout=compact] .sidebar,html[data-pj-layout=compact] #sb{width:200px !important}
html[data-pj-layout=comfortable] .sidebar,html[data-pj-layout=comfortable] #sb{width:260px !important}
html[data-pj-layout=spacious] .sidebar,html[data-pj-layout=spacious] #sb{width:300px !important}
html[data-pj-radius=sharp] .btn,html[data-pj-radius=sharp] .modal,html[data-pj-radius=sharp] .topics-table td,html[data-pj-radius=sharp] .lang-card,html[data-pj-radius=sharp] .card{border-radius:2px !important}
html[data-pj-scroll=thin]::-webkit-scrollbar{width:6px;height:6px}
html[data-pj-scroll=thin]::-webkit-scrollbar-thumb{background:var(--jungle-green,#2D8F4E);border-radius:3px}
html[data-pj-scroll=none]::-webkit-scrollbar{width:0;height:0}
/* animation speed */
html[data-pj-anim=slow] *,html[data-pj-anim=slow] *::before,html[data-pj-anim=slow] *::after{animation-duration:.8s !important;transition-duration:.5s !important}
html[data-pj-anim=fast] *,html[data-pj-anim=fast] *::before,html[data-pj-anim=fast] *::after{animation-duration:.1s !important;transition-duration:.1s !important}
html[data-pj-anim=off] *,html[data-pj-anim=off] *::before,html[data-pj-anim=off] *::after{animation:none !important;transition:none !important}
/* high contrast */
html.pj-hc body{background:#000}
/* large cursor */
html.pj-lc #pjCursorCanvas{opacity:.95}
`;

  var styleEl = D.createElement('style');
  styleEl.textContent = CSS;
  D.head.appendChild(styleEl);

  /* colorblind SVG filters */
  var svgNS = 'http://www.w3.org/2000/svg';
  var svg = D.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  var filters = {
    pjCbProtanopia: '0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0',
    pjCbDeuteranopia: '0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0',
    pjCbTritanopia: '0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0'
  };
  Object.keys(filters).forEach(function (id) {
    var f = D.createElementNS(svgNS, 'filter');
    f.setAttribute('id', id);
    f.setAttribute('color-interpolation-filters', 'sRGB');
    var fe = D.createElementNS(svgNS, 'feColorMatrix');
    fe.setAttribute('type', 'matrix');
    fe.setAttribute('values', filters[id]);
    f.appendChild(fe);
    svg.appendChild(f);
  });
  D.body.appendChild(svg);

  /* ============================================================
     Audio (WebAudio synthesized — no assets)
     ============================================================ */
  var AC = null, audioInit = false;
  function ac() {
    if (!AC) { try { AC = new (W.AudioContext || W.webkitAudioContext)(); } catch (e) { AC = null; } }
    if (AC && AC.state === 'suspended') AC.resume();
    return AC;
  }
  var natureNodes = [];
  function beep(freq, dur, vol, type) {
    if (!SET.sound.enabled || SET.sound.muted) return;
    var a = ac(); if (!a) return;
    var o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime((vol || 0.06) * SET.sound.volume / 100, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + (dur || 0.08));
    o.connect(g); g.connect(a.destination);
    o.start(); o.stop(a.currentTime + (dur || 0.08) + 0.02);
  }
  function noiseBuf() {
    var a = ac(); if (!a) return null;
    var b = a.createBuffer(1, a.sampleRate * 2, a.sampleRate);
    var d = b.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  function startNature(kind) {
    stopNature();
    if (!SET.sound.enabled || SET.sound.muted) return;
    var a = ac(); if (!a) return;
    if (kind === 'none') return;
    var vol = SET.sound.volume / 100;
    if (kind === 'rain') {
      var src = a.createBufferSource(); src.buffer = noiseBuf(); src.loop = true;
      var lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1200;
      var g = a.createGain(); g.gain.value = 0.15 * vol;
      src.connect(lp); lp.connect(g); g.connect(a.destination); src.start();
      natureNodes.push(src, lp, g);
    } else if (kind === 'ocean') {
      var s2 = a.createBufferSource(); s2.buffer = noiseBuf(); s2.loop = true;
      var lp2 = a.createBiquadFilter(); lp2.type = 'lowpass'; lp2.frequency.value = 600;
      var g2 = a.createGain(); g2.gain.value = 0.2 * vol;
      var lfo = a.createOscillator(); lfo.frequency.value = 0.08;
      var lfoG = a.createGain(); lfoG.gain.value = 0.12 * vol;
      lfo.connect(lfoG); lfoG.connect(g2.gain); lfo.start();
      s2.connect(lp2); lp2.connect(g2); g2.connect(a.destination); s2.start();
      natureNodes.push(s2, lp2, g2, lfo, lfoG);
    } else if (kind === 'forest') {
      var s3 = a.createBufferSource(); s3.buffer = noiseBuf(); s3.loop = true;
      var bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 800; bp.Q.value = 0.5;
      var g3 = a.createGain(); g3.gain.value = 0.08 * vol;
      s3.connect(bp); bp.connect(g3); g3.connect(a.destination); s3.start();
      natureNodes.push(s3, bp, g3);
      var birdTimer = setInterval(function () {
        var a2 = ac(); if (!a2) return;
        var o = a2.createOscillator(), gg = a2.createGain();
        o.frequency.value = 1800 + Math.random() * 2200;
        gg.gain.setValueAtTime(0.04 * vol, a2.currentTime);
        gg.gain.exponentialRampToValueAtTime(0.0001, a2.currentTime + 0.12);
        o.connect(gg); gg.connect(a2.destination); o.start(); o.stop(a2.currentTime + 0.14);
      }, 2400 + Math.random() * 2000);
      natureNodes.birdTimer = birdTimer;
    } else if (kind === 'wind') {
      var s4 = a.createBufferSource(); s4.buffer = noiseBuf(); s4.loop = true;
      var bp2 = a.createBiquadFilter(); bp2.type = 'bandpass'; bp2.frequency.value = 400; bp2.Q.value = 0.3;
      var g4 = a.createGain(); g4.gain.value = 0.1 * vol;
      var lfo2 = a.createOscillator(); lfo2.frequency.value = 0.15;
      var lfoG2 = a.createGain(); lfoG2.gain.value = 250;
      lfo2.connect(lfoG2); lfoG2.connect(bp2.frequency); lfo2.start();
      s4.connect(bp2); bp2.connect(g4); g4.connect(a.destination); s4.start();
      natureNodes.push(s4, bp2, g4, lfo2, lfoG2);
    } else if (kind === 'birds') {
      var birdTimer2 = setInterval(function () {
        var a3 = ac(); if (!a3) return;
        for (var i = 0; i < 3; i++) {
          var o = a3.createOscillator(), gg = a3.createGain();
          o.frequency.value = 1500 + Math.random() * 3000;
          gg.gain.setValueAtTime(0.03 * vol, a3.currentTime + i * 0.1);
          gg.gain.exponentialRampToValueAtTime(0.0001, a3.currentTime + i * 0.1 + 0.1);
          o.connect(gg); gg.connect(a3.destination); o.start(a3.currentTime + i * 0.1); o.stop(a3.currentTime + i * 0.1 + 0.12);
        }
      }, 3000);
      natureNodes.birdTimer = birdTimer2;
    }
  }
  function stopNature() {
    if (natureNodes.birdTimer) clearInterval(natureNodes.birdTimer);
    natureNodes.forEach(function (n) { if (n && n.stop) { try { n.stop(); } catch (e) {} } if (n && n.disconnect) { try { n.disconnect(); } catch (e) {} } });
    natureNodes = [];
  }

  /* ============================================================
     Background effects (single fixed canvas)
     ============================================================ */
  var bgCv, bgCtx, bgParticles = [], bgRaf = 0;
  function bgCanvas() {
    if (!bgCv) {
      bgCv = D.createElement('canvas');
      bgCv.id = 'pjBG';
      D.body.insertBefore(bgCv, D.body.firstChild);
      bgCtx = bgCv.getContext('2d');
    }
    bgCv.width = W.innerWidth * DPR;
    bgCv.height = W.innerHeight * DPR;
    return bgCtx;
  }
  function bgInit(kind) {
    cancelAnimationFrame(bgRaf);
    bgParticles = [];
    if (!kind || kind === 'none' || REDUCED || SET.a11y.reduceMotion) { if (bgCv) bgCv.style.display = 'none'; return; }
    var ctx = bgCanvas();
    ctx.clearRect(0, 0, bgCv.width, bgCv.height);
    bgCv.style.display = 'block';
    var W2 = W.innerWidth, H2 = W.innerHeight;
    var n = Math.round((W2 * H2) / 18000 * (SET.bg.performance ? 0.3 : 1));
    n = Math.min(60, Math.max(12, n));
    var i, p;
    if (kind === 'leaves') {
      for (i = 0; i < n; i++) bgParticles.push({ x: Math.random() * W2, y: Math.random() * H2, s: 4 + Math.random() * 8, vy: 0.4 + Math.random() * 0.8, vx: -0.4 + Math.random() * 0.8, r: Math.random() * Math.PI * 2, vr: 0.01 + Math.random() * 0.03, c: Math.random() < 0.5 ? 'rgba(45,143,78,0.35)' : 'rgba(255,215,0,0.3)', type: 'leaf' });
      tickBg();
    } else if (kind === 'rain') {
      for (i = 0; i < n * 2.5; i++) bgParticles.push({ x: Math.random() * W2, y: Math.random() * H2, s: 8 + Math.random() * 10, vy: 8 + Math.random() * 9, vx: -1, type: 'rain' });
      tickBg();
    } else if (kind === 'snow') {
      for (i = 0; i < n; i++) bgParticles.push({ x: Math.random() * W2, y: Math.random() * H2, s: 1.5 + Math.random() * 3.5, vy: 0.3 + Math.random() * 0.7, vx: -0.3 + Math.random() * 0.6, r: Math.random(), type: 'snow' });
      tickBg();
    } else if (kind === 'fireflies') {
      for (i = 0; i < n * 0.7; i++) bgParticles.push({ x: Math.random() * W2, y: Math.random() * H2, s: 1 + Math.random() * 2.5, vy: -0.1 + Math.random() * 0.3, vx: -0.2 + Math.random() * 0.4, ph: Math.random() * Math.PI * 2, sp: 0.02 + Math.random() * 0.04, type: 'fly' });
      tickBg();
    } else if (kind === 'stars') {
      for (i = 0; i < n * 1.2; i++) bgParticles.push({ x: Math.random() * W2, y: Math.random() * H2, s: 1 + Math.random() * 2.5, ph: Math.random() * Math.PI * 2, sp: 0.01 + Math.random() * 0.03, type: 'star' });
      tickBg();
    } else if (kind === 'clouds') {
      for (i = 0; i < 4; i++) bgParticles.push({ x: Math.random() * W2, y: 0.05 * H2 + Math.random() * 0.5 * H2, s: 30 + Math.random() * 40, vx: 0.15 + Math.random() * 0.25, type: 'cloud' });
      tickBg();
    } else if (kind === 'aurora') {
      tickAurora(0);
    } else if (kind === 'waves') {
      tickWaves(0);
    } else if (kind === 'mesh') {
      tickMesh(0);
    } else if (kind === 'wallpaper') {
      // gradient drift
      tickWall(0);
    }
  }
  var bgT = 0;
  function tickBg() {
    var ctx = bgCtx; if (!ctx) return;
    var W2 = W.innerWidth, H2 = W.innerHeight;
    var p;
    ctx.clearRect(0, 0, bgCv.width, bgCv.height);
    ctx.save();
    ctx.scale(DPR, DPR);
    var kind = SET.bg.effect;
    for (var i = 0; i < bgParticles.length; i++) {
      p = bgParticles[i];
      if (kind === 'leaves') {
        p.y += p.vy; p.x += p.vx; p.r += p.vr;
        if (p.y > H2 + 20) { p.y = -20; p.x = Math.random() * W2; }
        if (p.x > W2 + 20) p.x = -20; if (p.x < -20) p.x = W2 + 20;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c; ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * 0.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      } else if (kind === 'rain') {
        p.y += p.vy; p.x += p.vx;
        if (p.y > H2 + 20) { p.y = -20; p.x = Math.random() * W2; }
        ctx.strokeStyle = 'rgba(180,210,255,0.35)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 1.5, p.y - p.s); ctx.stroke();
      } else if (kind === 'snow') {
        p.y += p.vy; p.x += p.vx;
        if (p.y > H2 + 10) { p.y = -10; p.x = Math.random() * W2; }
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill();
      } else if (kind === 'fireflies') {
        p.ph += p.sp; p.x += p.vx; p.y += p.vy;
        if (p.y < -10) p.y = H2 + 10; if (p.x < -10) p.x = W2 + 10; if (p.x > W2 + 10) p.x = -10;
        var a = 0.4 + 0.6 * Math.abs(Math.sin(p.ph));
        ctx.fillStyle = 'rgba(255,236,120,' + a.toFixed(2) + ')';
        ctx.shadowColor = 'rgba(255,236,120,' + (a * 0.8).toFixed(2) + ')'; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      } else if (kind === 'stars') {
        p.ph += p.sp;
        var sa = 0.45 + 0.55 * Math.abs(Math.sin(p.ph));
        ctx.fillStyle = 'rgba(255,255,255,' + sa.toFixed(2) + ')';
        ctx.shadowColor = 'rgba(255,255,255,' + (sa * 0.6).toFixed(2) + ')'; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      } else if (kind === 'clouds') {
        p.x += p.vx;
        if (p.x - p.s > W2) p.x = -p.s;
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s * 0.6, 0, Math.PI * 2);
        ctx.arc(p.x + p.s * 0.5, p.y - p.s * 0.15, p.s * 0.45, 0, Math.PI * 2);
        ctx.arc(p.x + p.s * 0.9, p.y + p.s * 0.05, p.s * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
    bgRaf = requestAnimationFrame(tickBg);
  }
  function tickAurora(t) {
    var ctx = bgCtx; if (!ctx) return;
    var W2 = W.innerWidth, H2 = W.innerHeight;
    ctx.clearRect(0, 0, bgCv.width, bgCv.height);
    ctx.save(); ctx.scale(DPR, DPR);
    for (var i = 0; i < 3; i++) {
      var g = ctx.createLinearGradient(0, 0, W2, H2 * 0.6);
      var hue = (t * 8 + i * 90) % 360;
      g.addColorStop(0, 'hsla(' + hue + ',80%,55%,0)');
      g.addColorStop(0.5, 'hsla(' + hue + ',80%,55%,0.16)');
      g.addColorStop(1, 'hsla(' + hue + ',80%,55%,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(-50, H2 * (0.25 + 0.2 * i));
      ctx.quadraticCurveTo(W2 * 0.5, H2 * (0.1 + 0.2 * Math.sin(t / 120 + i)), W2 + 50, H2 * (0.3 + 0.2 * i));
      ctx.lineTo(W2 + 50, H2 * 0.8); ctx.lineTo(-50, H2 * 0.8);
      ctx.fill();
    }
    ctx.restore();
    bgRaf = requestAnimationFrame(function () { tickAurora(t + 1); });
  }
  function tickWaves(t) {
    var ctx = bgCtx; if (!ctx) return;
    var W2 = W.innerWidth, H2 = W.innerHeight;
    ctx.clearRect(0, 0, bgCv.width, bgCv.height);
    ctx.save(); ctx.scale(DPR, DPR);
    ctx.fillStyle = 'rgba(30,136,165,0.10)';
    for (var i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, H2);
      for (var x = 0; x <= W2; x += 20) {
        var y = H2 * 0.72 + Math.sin(x / 90 + t / 40 + i) * 16 + i * 24;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W2, H2); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    bgRaf = requestAnimationFrame(function () { tickWaves(t + 1); });
  }
  function tickMesh(t) {
    var ctx = bgCtx; if (!ctx) return;
    var W2 = W.innerWidth, H2 = W.innerHeight;
    ctx.clearRect(0, 0, bgCv.width, bgCv.height);
    var g = ctx.createLinearGradient(0, 0, W2, H2);
    g.addColorStop(0, 'hsla(' + ((t / 4) % 360) + ',70%,50%,0.10)');
    g.addColorStop(0.5, 'hsla(' + ((t / 4 + 120) % 360) + ',70%,50%,0.10)');
    g.addColorStop(1, 'hsla(' + ((t / 4 + 240) % 360) + ',70%,50%,0.10)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, bgCv.width, bgCv.height);
    bgRaf = requestAnimationFrame(function () { tickMesh(t + 1); });
  }
  function tickWall(t) {
    var ctx = bgCtx; if (!ctx) return;
    var W2 = W.innerWidth, H2 = W.innerHeight;
    ctx.clearRect(0, 0, bgCv.width, bgCv.height);
    var g = ctx.createLinearGradient(0, 0, W2, H2);
    g.addColorStop(0, 'hsla(' + ((t / 2) % 360) + ',60%,25%,1)');
    g.addColorStop(1, 'hsla(' + ((t / 2 + 60) % 360) + ',70%,15%,1)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, bgCv.width, bgCv.height);
    bgRaf = requestAnimationFrame(function () { tickWall(t + 1); });
  }

  /* ============================================================
     Coconut Tree Cursor + particles (single overlay canvas)
     ============================================================ */
  var cv, ctx, mx = W.innerWidth / 2, my = W.innerHeight / 2, tx = mx, ty = my;
  var vx = 0, vy = 0, rot = 0, scale = 1, targetScale = 1;
  var down = false, hoverType = 'none', idleT = 0, lastMoveT = 0;
  var parts = [], trailPts = [];
  var raf = 0, running = false;
  var curSize = SET.cursor.size;
  var customImgEl = null, customImgReady = false;

  function initCursor() {
    if (cv || !SET.cursor.enabled || COARSE || REDUCED || SET.a11y.reduceMotion) return;
    cv = D.createElement('canvas');
    cv.id = 'pjCursorCanvas';
    D.body.appendChild(cv);
    ctx = cv.getContext('2d');
    resize();
    running = true;
    W.addEventListener('resize', resize, { passive: true });
    D.addEventListener('mousemove', onMove, { passive: true });
    D.addEventListener('mousedown', onDown);
    D.addEventListener('mouseup', onUp);
    D.addEventListener('mouseover', onOver, true);
    D.addEventListener('click', onClick, true);
    document.documentElement.classList.add('pj-cursor-on');
    raf = requestAnimationFrame(loop);
  }
  function destroyCursor() {
    running = false;
    cancelAnimationFrame(raf);
    if (cv) { cv.remove(); cv = null; ctx = null; }
    document.documentElement.classList.remove('pj-cursor-on');
    W.removeEventListener('resize', resize);
    D.removeEventListener('mousemove', onMove);
    D.removeEventListener('mousedown', onDown);
    D.removeEventListener('mouseup', onUp);
    D.removeEventListener('mouseover', onOver, true);
    D.removeEventListener('click', onClick, true);
  }
  function resize() {
    if (!cv) return;
    cv.width = W.innerWidth * DPR;
    cv.height = W.innerHeight * DPR;
  }
  function onMove(e) {
    tx = e.clientX; ty = e.clientY;
    lastMoveT = Date.now();
  }
  function onDown() { down = true; targetScale = 0.8; }
  function onUp() { down = false; targetScale = 1.05; setTimeout(function () { targetScale = 1; }, 120); }
  function onOver(e) {
    var t = e.target;
    hoverType = 'none';
    while (t && t !== D.body) {
      var cls = (t.className || '') + '';
      if (t.tagName === 'BUTTON' || t.tagName === 'A' || cls.indexOf('btn') >= 0 || cls.indexOf('start-btn') >= 0) { hoverType = 'button'; break; }
      if (t.tagName === 'IMG') { hoverType = 'img'; break; }
      if (cls.indexOf('card') >= 0 || cls.indexOf('lang-card') >= 0 || cls.indexOf('topic') >= 0 || cls.indexOf('modal') >= 0) { hoverType = 'card'; break; }
      t = t.parentNode;
    }
  }
  function onClick(e) {
    if (!SET.cursor.clickAnim) return;
    var x = e.clientX, y = e.clientY;
    // ripple
    for (var i = 0; i < 2; i++) parts.push({ x: x, y: y, r: 4, vr: 3.5, a: 0.5, type: 'ripple', max: 34 });
    // particles
    var n = Math.round(8 * SET.cursor.density) + 2;
    for (var j = 0; j < n; j++) {
      var ang = Math.random() * Math.PI * 2, sp = 1 + Math.random() * 3;
      parts.push({ x: x, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 1, life: 40 + Math.random() * 20, type: 'p', s: 1.5 + Math.random() * 2, c: Math.random() < 0.5 ? '#FFD700' : '#6ABF69', gr: -0.08 });
    }
    // coconut drop
    parts.push({ x: x, y: y - 20, vx: 0, vy: 2, gr: 0.25, life: 50, type: 'coconut', s: 5, rot: Math.random() * 6, vr: 0.2 });
    if (SET.cursor.hoverAnim && hoverType === 'button') { /* tree bounce handled in loop via scale */ }
  }
  function sway(now) {
    if (!SET.cursor.idleAnim || Date.now() - lastMoveT < 3000) return { r: 0, o: 0 };
    return { r: Math.sin(now / 900) * 0.09, o: Math.abs(Math.sin(now / 900)) };
  }
  var leafSway = 0;
  function loop(now) {
    if (!running) return;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.save();
    ctx.scale(DPR, DPR);

    // physics smoothing
    var sp = SET.cursor.speed;
    var phys = SET.cursor.physics;
    if (phys > 0) {
      vx = vx * (1 - phys * 0.4) + (tx - mx) * (sp * (1 + phys));
      vy = vy * (1 - phys * 0.4) + (ty - my) * (sp * (1 + phys));
      mx += vx * 0.5;
      my += vy * 0.5;
    } else {
      mx += (tx - mx) * sp;
      my += (ty - my) * sp;
    }

    // trail
    var tr = SET.cursor.trail;
    if (tr > 1) {
      trailPts.push({ x: mx, y: my, t: now });
      while (trailPts.length > tr) trailPts.shift();
      for (var ti = 1; ti < trailPts.length; ti++) {
        var a = (ti / trailPts.length) * SET.cursor.trailOpacity;
        ctx.strokeStyle = trailColorHex(a);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(trailPts[ti - 1].x, trailPts[ti - 1].y);
        ctx.lineTo(trailPts[ti].x, trailPts[ti].y);
        ctx.stroke();
      }
    } else trailPts.length = 0;

    // particles update
    for (var pi = parts.length - 1; pi >= 0; pi--) {
      var p = parts[pi];
      if (p.type === 'ripple') {
        p.r += p.vr; p.a -= 0.02;
        if (p.a <= 0) { parts.splice(pi, 1); continue; }
        ctx.strokeStyle = 'rgba(255,215,0,' + p.a.toFixed(2) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.stroke();
      } else if (p.type === 'p') {
        p.x += p.vx; p.y += p.vy; p.vy += p.gr; p.life--;
        if (p.life <= 0) { parts.splice(pi, 1); continue; }
        ctx.fillStyle = p.c;
        ctx.globalAlpha = Math.min(1, p.life / 20);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      } else if (p.type === 'coconut') {
        p.x += p.vx; p.y += p.vy; p.vy += p.gr; p.life--; p.rot += p.vr;
        if (p.life <= 0 || p.y > W.innerHeight) { parts.splice(pi, 1); continue; }
        drawCoconut(p.x, p.y, p.rot, p.s);
      } else if (p.type === 'bird') {
        if (Date.now() - lastMoveT < 3000) { parts.splice(pi, 1); continue; }
        p.a += p.va;
        p.x = p.cx + Math.cos(p.a) * p.r;
        p.y = p.cy - Math.sin(p.a) * p.r * 0.45;
        var flap = Math.sin(now / 130 + p.ph) * 0.7;
        ctx.strokeStyle = 'rgba(80,95,105,0.75)';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-4, -3 - 5 * Math.max(0, flap), -9, -1);
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(4, -3 - 5 * Math.max(0, -flap), 9, -1);
        ctx.stroke();
      }
    }

    // wind trail on fast movement
    var dx = tx - mx, dy = ty - my, dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 8 && Math.random() < 0.3 * SET.cursor.density) {
      parts.push({ x: mx + (Math.random() - 0.5) * 10, y: my + (Math.random() - 0.5) * 10, vx: -dx / dist * 0.5, vy: -dy / dist * 0.5 + (Math.random() - 0.5), life: 30, type: 'leafP', s: 3 + Math.random() * 3, c: Math.random() < 0.5 ? '#6ABF69' : '#FFD700', rot: Math.random() * 6, vr: 0.1 });
    }
    for (var li = parts.length - 1; li >= 0; li--) {
      var lp = parts[li];
      if (lp.type === 'leafP') {
        lp.x += lp.vx; lp.y += lp.vy; lp.life--; lp.rot += lp.vr;
        if (lp.life <= 0) { parts.splice(li, 1); continue; }
        ctx.save(); ctx.translate(lp.x, lp.y); ctx.rotate(lp.rot);
        ctx.fillStyle = lp.c; ctx.globalAlpha = Math.min(1, lp.life / 15);
        ctx.beginPath(); ctx.ellipse(0, 0, lp.s, lp.s * 0.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore(); ctx.globalAlpha = 1;
      }
    }
    // image hover: drop coconuts
    if (hoverType === 'img' && SET.cursor.hoverAnim && Math.random() < 0.35) {
      parts.push({ x: mx + (Math.random() - 0.5) * 30, y: my - 10, vx: (Math.random() - 0.5) * 1.6, vy: 1, gr: 0.22, life: 55, type: 'coconut', s: 3.5 + Math.random() * 2.5, rot: Math.random() * 6, vr: 0.15 });
    }
    // idle: birds circle overhead
    var idleNow = Date.now() - lastMoveT > 3000;
    if (idleNow && SET.cursor.idleAnim) {
      var nBirds = 0;
      for (var bi = 0; bi < parts.length; bi++) if (parts[bi].type === 'bird') nBirds++;
      if (nBirds < 3 && Math.random() < 0.04) {
        parts.push({ type: 'bird', x: mx, y: my, cx: mx, cy: my - 20, r: 45 + Math.random() * 35, a: Math.random() * 6.28, va: 0.006 + Math.random() * 0.007, ph: Math.random() * 6.28 });
      }
    }
    parts = parts.slice(0, 90);

    // idle sway
    var sw = sway(now);
    // rotation follows direction
    var targetRot = rot;
    if (Math.abs(dx) + Math.abs(dy) > 2) targetRot = Math.atan2(dy, dx) * 0.25;
    rot += (targetRot + sw.r - rot) * 0.08;
    // scale
    scale += (targetScale - scale) * 0.15;
    if (hoverType === 'button') targetScale = 1.15;
    else if (hoverType === 'card') targetScale = 1.1;
    else if (hoverType === 'img') targetScale = 0.95;

    leafSway = Math.sin(now / 700) * (0.12 + 0.15 * sw.o);
    if (hoverType === 'button' || hoverType === 'card') leafSway = Math.sin(now / 130) * 0.35;

    var sz = curSize * scale;
    // shadow
    if (SET.cursor.shadow) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath(); ctx.ellipse(mx + 4, my + sz * 0.55, sz * 0.35, sz * 0.09, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // glow
    var glow = SET.cursor.glow;
    if (glow > 0) {
      var g = ctx.createRadialGradient(mx, my, 0, mx, my, sz * (0.5 + glow / 30));
      g.addColorStop(0, 'rgba(255,215,0,' + (0.12 + glow / 200) + ')');
      g.addColorStop(1, 'rgba(255,215,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(mx, my, sz * (0.5 + glow / 30), 0, Math.PI * 2); ctx.fill();
    }

    // draw tree
    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(rot);
    ctx.scale(sz / 44, sz / 44);
    drawStyle(now);
    ctx.restore();

    ctx.restore();
    raf = requestAnimationFrame(loop);
  }
  function trailColorHex(a) {
    var c = SET.cursor.trailColor;
    if (c[0] === '#') {
      var r = parseInt(c.slice(1, 3), 16), g = parseInt(c.slice(3, 5), 16), b = parseInt(c.slice(5, 7), 16);
      return 'rgba(' + r + ',' + g + ',' + b + ',' + a.toFixed(2) + ')';
    }
    return c;
  }
  function drawCoconut(x, y, rot, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = '#6B4226';
    ctx.strokeStyle = '#3E2413';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#8D5A2B';
    ctx.beginPath(); ctx.arc(-s * 0.3, -s * 0.3, s * 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function drawTree(now) {
    // trunk (curved)
    ctx.strokeStyle = '#6B4226';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.quadraticCurveTo(-3, 0, -2, -14);
    ctx.stroke();
    // trunk rings
    ctx.strokeStyle = 'rgba(62,36,19,0.5)';
    ctx.lineWidth = 1;
    for (var r = -6; r > -13; r -= 3) {
      ctx.beginPath(); ctx.moveTo(-2.5, r); ctx.quadraticCurveTo(0, r + 1.2, 2, r); ctx.stroke();
    }
    // coconuts
    ctx.fillStyle = '#6B4226';
    ctx.beginPath(); ctx.arc(-3, -13, 3.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(3.5, -13.5, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8D5A2B';
    ctx.beginPath(); ctx.arc(-4, -14.5, 1.6, 0, Math.PI * 2); ctx.fill();
    // leaves (fanning with sway)
    var leaves = 6;
    ctx.lineWidth = 3.2;
    for (var i = 0; i < leaves; i++) {
      var a = -Math.PI / 2 + (i - (leaves - 1) / 2) * 0.42 + leafSway * Math.sin(i * 1.7 + now / 500) * 0.5;
      var len = 15 + (i % 2) * 3;
      var ex = Math.cos(a) * len, ey = -14 + Math.sin(a) * len;
      ctx.strokeStyle = i % 2 === 0 ? '#2D8F4E' : '#1A6B3C';
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.quadraticCurveTo(Math.cos(a) * len * 0.6, -14 + Math.sin(a) * len * 0.55, ex, ey);
      ctx.stroke();
      // leaf blades
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(106,191,105,0.8)';
      for (var b = 1; b <= 3; b++) {
        var t = b / 4;
        var px = Math.cos(a) * len * t, py = -14 + Math.sin(a) * len * t;
        var pa = a + (b % 2 ? 0.55 : -0.55);
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(pa) * 4.5, py + Math.sin(pa) * 4.5); ctx.stroke();
      }
      ctx.lineWidth = 3.2;
    }
  }
  function drawStyle(now) {
    switch (SET.cursor.style) {
      case 'palm':
        // taller palm with more leaves
        ctx.strokeStyle = '#8D6E63'; ctx.lineWidth = 4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(0, 12); ctx.quadraticCurveTo(4, 0, 5, -18); ctx.stroke();
        ctx.fillStyle = '#6B4226';
        ctx.beginPath(); ctx.arc(3.5, -17.5, 3, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = 3.4;
        for (var i = 0; i < 8; i++) {
          var a = -Math.PI / 2 + (i - 3.5) * 0.36 + leafSway * 0.4;
          var len = 17 + (i % 2) * 4;
          ctx.strokeStyle = i % 2 === 0 ? '#2D8F4E' : '#1A6B3C';
          ctx.beginPath(); ctx.moveTo(5, -18);
          ctx.quadraticCurveTo(5 + Math.cos(a) * len * 0.6, -18 + Math.sin(a) * len * 0.55, 5 + Math.cos(a) * len, -18 + Math.sin(a) * len);
          ctx.stroke();
        }
        break;
      case 'bamboo':
        // bamboo stalk
        ctx.strokeStyle = '#66BB6A'; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-2, 13); ctx.quadraticCurveTo(-1, 0, 0, -20); ctx.stroke();
        ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(27,94,32,0.6)';
        for (var s = -6; s > -19; s -= 4) { ctx.beginPath(); ctx.moveTo(-2.5, s); ctx.lineTo(1.5, s); ctx.stroke(); }
        ctx.strokeStyle = '#2E7D32'; ctx.lineWidth = 2.6;
        for (var l = 0; l < 4; l++) {
          var ang = -Math.PI / 2 + (l - 1.5) * 0.5 + leafSway * 0.5;
          ctx.beginPath(); ctx.moveTo(0, -20);
          ctx.quadraticCurveTo(Math.cos(ang) * 10, -20 + Math.sin(ang) * 10, Math.cos(ang) * 15, -20 + Math.sin(ang) * 15);
          ctx.stroke();
        }
        break;
      case 'circle':
        // minimal ring with dot
        ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.arc(0, 0, 2.4, 0, Math.PI * 2); ctx.fill();
        break;
      case 'wand':
        // magic wand
        ctx.strokeStyle = '#B388FF'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(0, 14); ctx.lineTo(0, -8); ctx.stroke();
        ctx.fillStyle = '#FFD700';
        ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(3, -9); ctx.lineTo(0, -6); ctx.lineTo(-3, -9); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(255,215,0,0.7)'; ctx.lineWidth = 1;
        for (var sp2 = 0; sp2 < 3; sp2++) {
          var sx = -10 + sp2 * 10 + Math.sin(now / 400 + sp2) * 3, sy = -14 - Math.cos(now / 350 + sp2) * 6;
          ctx.beginPath(); ctx.arc(sx, sy, 1.6, 0, Math.PI * 2); ctx.stroke();
        }
        break;
      case 'leaf':
        // leaf
        ctx.save();
        ctx.rotate(-Math.PI / 4);
        ctx.fillStyle = '#4CAF50'; ctx.strokeStyle = '#1B5E20'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.ellipse(0, 0, 12, 5.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = 'rgba(27,94,32,0.7)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.stroke();
        ctx.restore();
        break;
      case 'custom':
        if (SET.cursor.customImg) {
          if (!customImgEl) {
            customImgEl = new Image();
            customImgEl.onload = function () { customImgReady = true; };
            customImgEl.src = SET.cursor.customImg;
          }
          if (customImgReady) {
            var iw = customImgEl.width || 44, ih = customImgEl.height || 44, iMax = 40;
            var is = Math.min(iMax / iw, iMax / ih);
            ctx.drawImage(customImgEl, -iw * is / 2, -ih * is / 2, iw * is, ih * is);
          } else drawTree(now);
        } else drawTree(now);
        break;
      default:
        drawTree(now);
    }
  }

  /* ============================================================
     Settings panel UI
     ============================================================ */
  var THEMES = [
    ['auto', 'Auto (System)'], ['jungle', 'Jungle'], ['light', 'Light'], ['dark', 'Dark'], ['amoled', 'AMOLED'],
    ['ocean', 'Ocean'], ['forest', 'Forest'], ['sunset', 'Sunset'], ['midnight', 'Midnight'],
    ['cyberpunk', 'Cyberpunk'], ['minimal', 'Minimal'], ['vintage', 'Vintage'], ['coffee', 'Coffee'],
    ['emerald', 'Emerald'], ['purple', 'Purple Galaxy'], ['custom', 'Custom']
  ];
  var FONTS = [['system', 'System Font'], ['inter', 'Inter'], ['poppins', 'Poppins'], ['roboto', 'Roboto'], ['nunito', 'Nunito'], ['sfpro', 'SF Pro'], ['jetbrains', 'JetBrains Mono'], ['firacode', 'Fira Code']];
  var ACCENTS = ['#FFD700', '#FFA500', '#2D8F4E', '#00BCD4', '#E74C3C', '#8E44AD', '#FF2D95', '#FFFFFF', '#00E676', '#7986CB', '#F9A825', '#FF6F00'];
  var NATURE = [['none', 'None'], ['rain', 'Rain'], ['ocean', 'Ocean'], ['forest', 'Forest'], ['wind', 'Wind'], ['birds', 'Birds']];
  var BGEFF = [['none', 'None'], ['leaves', 'Floating Leaves'], ['rain', 'Rain'], ['snow', 'Snow'], ['fireflies', 'Fireflies'], ['stars', 'Stars'], ['clouds', 'Clouds'], ['aurora', 'Aurora'], ['waves', 'Ocean Waves'], ['mesh', 'Gradient Mesh'], ['wallpaper', 'Live Wallpaper']];
  var CURSOR_STYLES = [['coconut', 'Coconut Tree'], ['palm', 'Palm Tree'], ['bamboo', 'Bamboo'], ['circle', 'Minimal Circle'], ['wand', 'Magic Wand'], ['leaf', 'Leaf'], ['custom', 'Custom Image']];
  var LANGS = [['en', 'English'], ['es', 'Español'], ['fr', 'Français'], ['de', 'Deutsch'], ['hi', 'हिन्दी'], ['ar', 'العربية'], ['zh', '中文'], ['pt', 'Português']];

  var panel, gear, activeTab = 'appearance';

  function buildPanel() {
    gear = D.createElement('div');
    gear.id = 'pjGear';
    gear.innerHTML = '⚙';
    gear.title = 'Settings (Ctrl+,)';
    gear.addEventListener('click', function (e) { e.stopPropagation(); togglePanel(); });
    D.body.appendChild(gear);

    panel = D.createElement('div');
    panel.id = 'pjPanel';
    panel.innerHTML = '<h3><span class="dot"></span>PERSONALIZATION</h3>' + tabsHTML() + '<div id="pjSections"></div>';
    D.body.appendChild(panel);
    renderSections();
  }

  function tabsHTML() {
    var tabs = [['appearance', '🎨 Appearance'], ['cursor', '🌴 Cursor'], ['a11y', '♿ Access'], ['sound', '🔊 Sound'], ['bg', '🌌 Background'], ['theme', '🛠 Theme Creator'], ['layout', '📐 Layout'], ['adv', '💾 Advanced'], ['dev', '📊 Dev']];
    var h = '<div class="pj-tabs">';
    tabs.forEach(function (t) {
      h += '<span class="pj-tab' + (t[0] === activeTab ? ' act' : '') + '" data-pjtab="' + t[0] + '">' + t[1] + '</span>';
    });
    h += '</div>';
    return h;
  }

  function renderSections() {
    var wrap = panel.querySelector('#pjSections');
    wrap.innerHTML = secAppearance() + secCursor() + secA11y() + secSound() + secBG() + secThemeCreator() + secLayout() + secAdv() + secDev();
    panel.querySelectorAll('.pj-tab').forEach(function (el) {
      el.addEventListener('click', function () {
        activeTab = el.getAttribute('data-pjtab');
        panel.querySelectorAll('.pj-tab').forEach(function (t) { t.classList.toggle('act', t === el); });
        wrap.querySelectorAll('.pj-sec').forEach(function (s) { s.classList.toggle('act', s.getAttribute('data-pjsec') === activeTab); });
      });
    });
    bindControls();
  }

  function row(lbl, id, ctrlHTML, valFn) {
    return '<div class="pj-row"><span class="pj-lbl">' + lbl + '</span>' + ctrlHTML + '<span class="pj-val" data-pjv="' + id + '">' + (valFn ? valFn() : '') + '</span></div>';
  }
  function slider(id, min, max, step, unit, get) {
    var v = get();
    return row(labelFor(id), id, '<input type="range" class="pj-in" data-pj="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + v + '">', function () { return v + (unit || ''); });
  }
  function labelFor(id) {
    return { fontSize: 'Font Size', letterSpacing: 'Letter Spacing', lineHeight: 'Line Height', radius: 'Border Radius', shadowStr: 'Shadow Strength', glass: 'Glass Intensity', animSpeed: 'Animation Speed', size: 'Cursor Size', speed: 'Cursor Speed', trail: 'Trail Length', trailOpacity: 'Trail Opacity', glow: 'Glow Strength', density: 'Particle Density', physics: 'Physics Strength', volume: 'Volume', sidebarWidth: 'Sidebar Width' }[id] || id;
  }
  function secAppearance() {
    var t = SET.appearance;
    var h = '<div class="pj-sec act" data-pjsec="appearance">';
    h += '<h3>🌐 Language</h3>' + row('Language', 'lang', '<select class="pj-sel" data-pj="lang">' + LANGS.map(function (l) { return '<option value="' + l[0] + '"' + (SET.lang === l[0] ? ' selected' : '') + '>' + l[1] + '</option>'; }).join('') + '</select>');
    h += '<h3>Theme</h3><div class="pj-swatches">';
    THEMES.forEach(function (th) {
      h += '<span class="pj-swatch" data-pj-theme-sw="' + th[0] + '" title="' + th[1] + '" style="background:' + themeColor(th[0]) + (t.theme === th[0] ? ';border-color:#fff' : '') + '"></span>';
    });
    h += '</div>';
    h += '<h3>Accent Color</h3><div class="pj-swatches">';
    ACCENTS.forEach(function (c) {
      h += '<span class="pj-swatch" data-pj-acc="' + c + '" style="background:' + c + (t.accent === c ? ';border-color:#fff' : '') + '"></span>';
    });
    h += '</div><div class="pj-acc"><input type="color" class="pj-col" data-pj="accentCustom" value="' + t.accent + '"><input type="color" class="pj-col" data-pj="accentCustom2" value="' + t.accent2 + '" title="gradient second color"></div>';
    h += '<h3>Font</h3>' + row('Font Family', 'font', '<select class="pj-sel" data-pj="font">' + FONTS.map(function (f) { return '<option value="' + f[0] + '"' + (t.font === f[0] ? ' selected' : '') + '>' + f[1] + '</option>'; }).join('') + '</select>');
    h += slider('fontSize', 80, 130, 5, '%', function () { return t.fontSize; });
    h += slider('letterSpacing', -2, 6, 0.5, 'px', function () { return t.letterSpacing; });
    h += slider('lineHeight', 1.2, 2.2, 0.1, '', function () { return t.lineHeight; });
    h += slider('radius', 0, 24, 1, 'px', function () { return t.radius; });
    h += slider('shadowStr', 0, 100, 5, '%', function () { return t.shadow; });
    h += slider('glass', 0, 100, 5, '%', function () { return t.glass; });
    h += slider('animSpeed', 0, 200, 10, '%', function () { return t.animSpeed; });
    h += '</div>';
    return h;
  }
  function themeColor(t) {
    return { jungle: '#2D8F4E', light: '#E8F0E2', dark: '#0D1B0D', amoled: '#000', ocean: '#1E88A5', forest: '#388E3C', sunset: '#FF6F00', midnight: '#3949AB', cyberpunk: '#00E5FF', minimal: '#607D8B', vintage: '#8D6E63', coffee: '#5D4037', emerald: '#00C853', purple: '#7E57C2', auto: 'linear-gradient(135deg,#0D1B0D 50%,#F4F7F2 50%)', custom: 'conic-gradient(#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)' }[t] || '#2D8F4E';
  }
  function secCursor() {
    var c = SET.cursor;
    var h = '<div class="pj-sec" data-pjsec="cursor">';
    h += row('Enable Cursor', 'cursorEn', '<label class="pj-switch"><input type="checkbox" data-pj="cursorEn" id="pjCEn"' + (c.enabled ? ' checked' : '') + '><i></i></label>');
    h += row('Cursor Style', 'style', '<select class="pj-sel" data-pj="style">' + CURSOR_STYLES.map(function (s) { return '<option value="' + s[0] + '"' + (c.style === s[0] ? ' selected' : '') + '>' + s[1] + '</option>'; }).join('') + '</select>');
    h += slider('size', 28, 80, 2, 'px', function () { return c.size; });
    h += slider('speed', 0.05, 0.4, 0.01, '', function () { return Math.round(c.speed * 100) / 100; });
    h += slider('trail', 0, 20, 1, '', function () { return c.trail; });
    h += row('Trail Color', 'trailColor', '<input type="color" class="pj-col" data-pj="trailColor" value="' + c.trailColor + '">');
    h += slider('trailOpacity', 0.05, 1, 0.05, '', function () { return c.trailOpacity; });
    h += slider('glow', 0, 40, 2, '', function () { return c.glow; });
    h += slider('density', 0.1, 1.5, 0.1, '', function () { return c.density; });
    h += slider('physics', 0, 1, 0.1, '', function () { return c.physics; });
    h += row('Click Animation', 'clickAnim', '<label class="pj-switch"><input type="checkbox" data-pj="clickAnim" id="pjCCl"' + (c.clickAnim ? ' checked' : '') + '><i></i></label>');
    h += row('Hover Animation', 'hoverAnim', '<label class="pj-switch"><input type="checkbox" data-pj="hoverAnim" id="pjCHo"' + (c.hoverAnim ? ' checked' : '') + '><i></i></label>');
    h += row('Idle Animation', 'idleAnim', '<label class="pj-switch"><input type="checkbox" data-pj="idleAnim" id="pjCId"' + (c.idleAnim ? ' checked' : '') + '><i></i></label>');
    h += row('Cursor Shadow', 'shadow', '<label class="pj-switch"><input type="checkbox" data-pj="shadow" id="pjCSh"' + (c.shadow ? ' checked' : '') + '><i></i></label>');
    h += row('Custom Image', 'customImg', '<button class="pj-btn" data-pj-action="pickCursorImg">⬆ Upload</button> <button class="pj-btn danger" data-pj-action="removeCursorImg">✕ Remove</button>');
    h += '<input type="file" id="pjCursorFile" accept="image/*" style="display:none">';
    h += '<div class="pj-note">Custom cursor hides the default pointer. Touch devices auto-disable it.</div></div>';
    return h;
  }
  function secA11y() {
    var a = SET.a11y;
    function sw(id, lbl) { return row(lbl, id, '<label class="pj-switch"><input type="checkbox" data-pj="' + id + '"' + (a[id] ? ' checked' : '') + '><i></i></label>'); }
    var h = '<div class="pj-sec" data-pjsec="a11y">';
    h += sw('reduceMotion', 'Reduce Motion');
    h += sw('highContrast', 'High Contrast');
    h += sw('largeCursor', 'Large Cursor');
    h += sw('focusMode', 'Focus Mode');
    h += sw('readingMode', 'Reading Mode');
    h += sw('dyslexiaFont', 'Dyslexia Font');
    h += '<h3>Color Blind Mode</h3>' + row('Filter', 'colorBlind', '<select class="pj-sel" data-pj="colorBlind"><option value="none"' + (a.colorBlind === 'none' ? ' selected' : '') + '>None</option><option value="protanopia"' + (a.colorBlind === 'protanopia' ? ' selected' : '') + '>Protanopia</option><option value="deuteranopia"' + (a.colorBlind === 'deuteranopia' ? ' selected' : '') + '>Deuteranopia</option><option value="tritanopia"' + (a.colorBlind === 'tritanopia' ? ' selected' : '') + '>Tritanopia</option></select>');
    h += '<div class="pj-note">All settings are keyboard-accessible. Press Ctrl+, anytime.</div></div>';
    return h;
  }
  function secSound() {
    var s = SET.sound;
    var h = '<div class="pj-sec" data-pjsec="sound">';
    h += row('UI Sounds', 'soundEn', '<label class="pj-switch"><input type="checkbox" data-pj="soundEn" id="pjSEn"' + (s.enabled ? ' checked' : '') + '><i></i></label>');
    h += row('Click Sound', 'click', '<label class="pj-switch"><input type="checkbox" data-pj="click" id="pjSCk"' + (s.click ? ' checked' : '') + '><i></i></label>');
    h += row('Hover Sound', 'hover', '<label class="pj-switch"><input type="checkbox" data-pj="hover" id="pjSHo"' + (s.hover ? ' checked' : '') + '><i></i></label>');
    h += row('Mute All', 'muted', '<label class="pj-switch"><input type="checkbox" data-pj="muted" id="pjSMu"' + (s.muted ? ' checked' : '') + '><i></i></label>');
    h += slider('volume', 0, 100, 5, '%', function () { return s.volume; });
    h += '<h3>Nature Ambience</h3>' + row('Sound', 'nature', '<select class="pj-sel" data-pj="nature">' + NATURE.map(function (n) { return '<option value="' + n[0] + '"' + (s.nature === n[0] ? ' selected' : '') + '>' + n[1] + '</option>'; }).join('') + '</select>');
    h += '<button class="pj-btn" data-pj-action="testSound">▶ Test Sound</button>';
    h += '</div>';
    return h;
  }
  function secBG() {
    var b = SET.bg;
    var h = '<div class="pj-sec" data-pjsec="bg">';
    h += '<h3>Animated Background</h3>' + row('Effect', 'effect', '<select class="pj-sel" data-pj="effect">' + BGEFF.map(function (e) { return '<option value="' + e[0] + '"' + (b.effect === e[0] ? ' selected' : '') + '>' + e[1] + '</option>'; }).join('') + '</select>');
    h += row('Performance Mode', 'performance', '<label class="pj-switch"><input type="checkbox" data-pj="performance" id="pjBPe"' + (b.performance ? ' checked' : '') + '><i></i></label>');
    h += '<div class="pj-note">Fireflies appear automatically at night or in Midnight/AMOLED themes.</div></div>';
    return h;
  }
  function secThemeCreator() {
    var h = '<div class="pj-sec" data-pjsec="theme">';
    var ct = SET.customTheme || { bg: '#0D1B0D', card: '#1A2E1A', btn: '#2D8F4E', sidebar: '#0A140A', navbar: '#0D1B0D', footer: '#0A140A', text: '#E8F0E2', text2: '#A8C89A', border: '#2D8F4E', accent: '#FFD700', accent2: '#FFA500' };
    h += '<h3>Customize Colors</h3>';
    [['bg', 'Background'], ['card', 'Cards'], ['btn', 'Buttons'], ['sidebar', 'Sidebar'], ['navbar', 'Navbar'], ['footer', 'Footer'], ['text', 'Text'], ['text2', 'Secondary Text'], ['border', 'Borders'], ['accent', 'Accent'], ['accent2', 'Accent 2']].forEach(function (c) {
      h += row(c[1], 'ct_' + c[0], '<input type="color" class="pj-col" data-pj="ct_' + c[0] + '" value="' + (ct[c[0]] || '#0D1B0D') + '">');
    });
    h += '<div style="display:flex;flex-wrap:wrap;gap:4px">';
    h += '<button class="pj-btn" data-pj-action="saveTheme">💾 Save Theme</button>';
    h += '<button class="pj-btn" data-pj-action="applyTheme">▶ Apply</button>';
    h += '<button class="pj-btn" data-pj-action="exportTheme">⬇ Export</button>';
    h += '<button class="pj-btn" data-pj-action="importTheme">⬆ Import</button>';
    h += '<button class="pj-btn" data-pj-action="shareTheme">🔗 Share</button>';
    h += '<button class="pj-btn danger" data-pj-action="resetTheme">↺ Reset</button>';
    h += '</div><input type="file" id="pjThemeFile" accept=".json" style="display:none">';
    h += '<div class="pj-note">Custom theme applies instantly to background, cards, buttons & text.</div></div>';
    return h;
  }
  function secLayout() {
    var l = SET.layout;
    var h = '<div class="pj-sec" data-pjsec="layout">';
    h += slider('sidebarWidth', 180, 340, 10, 'px', function () { return l.sidebarWidth; });
    h += row('Density', 'density', '<select class="pj-sel" data-pj="density"><option value="compact"' + (l.density === 'compact' ? ' selected' : '') + '>Compact</option><option value="comfortable"' + (l.density === 'comfortable' ? ' selected' : '') + '>Comfortable</option><option value="spacious"' + (l.density === 'spacious' ? ' selected' : '') + '>Spacious</option></select>');
    h += row('Corners', 'rounded', '<label class="pj-switch"><input type="checkbox" data-pj="rounded" id="pjLRd"' + (l.rounded ? ' checked' : '') + '><i></i></label>');
    h += row('Scrollbar', 'scrollbar', '<select class="pj-sel" data-pj="scrollbar"><option value="auto"' + (l.scrollbar === 'auto' ? ' selected' : '') + '>Auto</option><option value="thin"' + (l.scrollbar === 'thin' ? ' selected' : '') + '>Thin</option><option value="none"' + (l.scrollbar === 'none' ? ' selected' : '') + '>Hidden</option></select>');
    h += '</div>';
    return h;
  }
  function secAdv() {
    var h = '<div class="pj-sec" data-pjsec="adv">';
    h += '<button class="pj-btn" data-pj-action="exportAll">⬇ Export Settings</button>';
    h += '<button class="pj-btn" data-pj-action="importAll">⬆ Import Settings</button>';
    h += '<input type="file" id="pjAllFile" accept=".json" style="display:none">';
    h += '<button class="pj-btn" data-pj-action="copyShare">🔗 Copy Share Link</button>';
    h += '<button class="pj-btn" data-pj-action="syncNow">☁ Sync Now</button>';
    h += '<div class="pj-note" id="pjSyncNote">' + (sync.uid ? '☁ Synced with ' + sync.email : '☁ Sign in to sync settings across devices') + '</div>';
    h += '<button class="pj-btn danger" data-pj-action="resetAll" style="display:block;margin-top:8px;width:100%">🗑 Reset Everything</button>';
    h += '<div class="pj-note">Settings auto-save to this browser. Use export/import to move them between devices.</div></div>';
    return h;
  }
  function secDev() {
    var d = SET.dev;
    var h = '<div class="pj-sec" data-pjsec="dev">';
    h += row('FPS Monitor', 'fps', '<label class="pj-switch"><input type="checkbox" data-pj="fps" id="pjDFp"' + (d.fps ? ' checked' : '') + '><i></i></label>');
    h += row('Performance Stats', 'stats', '<label class="pj-switch"><input type="checkbox" data-pj="stats" id="pjDSt"' + (d.stats ? ' checked' : '') + '><i></i></label>');
    h += '<button class="pj-btn" data-pj-action="testCursor">🖱 Test Cursor</button>';
    h += '<button class="pj-btn" data-pj-action="themeInfo">🎨 Theme Inspector</button>';
    h += '<div class="pj-note" id="pjDevInfo"></div></div>';
    return h;
  }

  /* ---------- bind controls ---------- */
  function bindControls() {
    panel.querySelectorAll('[data-pj]').forEach(function (el) {
      var key = el.getAttribute('data-pj');
      var evt = el.tagName === 'SELECT' || el.tagName === 'INPUT' ? 'change' : 'input';
      el.addEventListener(evt, function () {
        var val = el.type === 'checkbox' ? el.checked : el.type === 'number' ? parseFloat(el.value) : el.value;
        if (el.type === 'range') val = parseFloat(el.value);
        applySetting(key, val);
        if (el.type === 'range') {
          var v = panel.querySelector('[data-pjv="' + key + '"]');
          if (v) v.textContent = val + (key === 'fontSize' ? '%' : key === 'letterSpacing' ? 'px' : key === 'radius' ? 'px' : key === 'volume' ? '%' : key === 'sidebarWidth' ? 'px' : '');
        }
      });
    });
    panel.querySelectorAll('[data-pj-theme-sw]').forEach(function (el) {
      el.addEventListener('click', function () { applySetting('theme', el.getAttribute('data-pj-theme-sw')); rebuildSwatches(); });
    });
    panel.querySelectorAll('[data-pj-acc]').forEach(function (el) {
      el.addEventListener('click', function () { applySetting('accent', el.getAttribute('data-pj-acc')); rebuildSwatches(); });
    });
    panel.querySelectorAll('[data-pj-action]').forEach(function (el) {
      el.addEventListener('click', function () { actions[el.getAttribute('data-pj-action')](); });
    });
    var themeFile = panel.querySelector('#pjThemeFile');
    if (themeFile) themeFile.addEventListener('change', function (e) { importThemeFile(e.target.files[0], true); });
    var allFile = panel.querySelector('#pjAllFile');
    if (allFile) allFile.addEventListener('change', function (e) { importThemeFile(e.target.files[0], false); });
    var curFile = panel.querySelector('#pjCursorFile');
    if (curFile) curFile.addEventListener('change', function (e) {
      var f = e.target.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        SET.cursor.customImg = r.result;
        customImgEl = null; customImgReady = false;
        applySetting('style', 'custom');
        save();
      };
      r.readAsDataURL(f);
    });
  }
  function rebuildSwatches() {
    renderSections();
  }
  function updateValText(key, val) { }

  var actions = {
    testSound: function () { beep(660, 0.12, 0.08, 'square'); beep(880, 0.1, 0.06, 'square'); },
    testCursor: function () {
      var rnd = Math.random() * 600 + 100, rnd2 = Math.random() * 400 + 100;
      tx = rnd; ty = rnd2; parts.push({ x: rnd, y: rnd2, r: 4, vr: 4, a: 0.6, type: 'ripple', max: 40 });
      for (var i = 0; i < 10; i++) parts.push({ x: rnd, y: rnd2, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, life: 40, type: 'p', s: 2, c: '#FFD700', gr: 0.05 });
    },
    themeInfo: function () {
      var el = panel.querySelector('#pjDevInfo');
      var cs = getComputedStyle(D.documentElement);
      el.textContent = 'bg: ' + cs.getPropertyValue('--dark-canopy').trim() + ' | accent: ' + cs.getPropertyValue('--bright-yellow').trim() + ' | text: ' + cs.getPropertyValue('--text-primary').trim();
    },
    saveTheme: function () { actions.applyTheme(); showPanelNote('Theme saved'); },
    applyTheme: function () {
      var ct = collectCustomTheme();
      SET.customTheme = ct;
      applySetting('theme', 'custom');
      save();
    },
    exportTheme: function () {
      var ct = collectCustomTheme();
      download('jungle-theme.json', JSON.stringify(ct, null, 2));
    },
    importTheme: function () { var f = panel.querySelector('#pjThemeFile'); f.click(); },
    shareTheme: function () {
      var ct = collectCustomTheme();
      var url = location.origin + location.pathname + '?pjtheme=' + encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(ct)))));
      try { navigator.clipboard.writeText(url); showPanelNote('Share link copied!'); } catch (e) { window.prompt('Copy this share link:', url); }
    },
    resetTheme: function () { SET.customTheme = null; applySetting('theme', 'jungle'); rebuildSwatches(); },
    exportAll: function () { download('jungle-settings.json', JSON.stringify(SET, null, 2)); },
    importAll: function () { var f = panel.querySelector('#pjAllFile'); f.click(); },
    copyShare: function () {
      var url = location.origin + location.pathname + '?pj=' + encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(SET)))));
      try { navigator.clipboard.writeText(url); showPanelNote('Link copied!'); } catch (e) { window.prompt('Copy this link:', url); }
    },
    resetAll: function () {
      if (!confirm('Reset ALL personalization settings?')) return;
      try { localStorage.removeItem('pj_settings'); } catch (e) {}
      location.reload();
    },
    pickCursorImg: function () { var f = panel.querySelector('#pjCursorFile'); if (f) f.click(); },
    removeCursorImg: function () {
      SET.cursor.customImg = null;
      customImgEl = null; customImgReady = false;
      if (SET.cursor.style === 'custom') applySetting('style', 'coconut');
      save();
    },
    syncNow: function () { if (sync.uid) { pushNow(); syncPull(); } else { syncInit(); updateSyncNote(); } }
  };
  function collectCustomTheme() {
    var ct = {};
    ['bg', 'card', 'btn', 'sidebar', 'navbar', 'footer', 'text', 'text2', 'border', 'accent', 'accent2'].forEach(function (k) {
      var el = panel.querySelector('[data-pj="ct_' + k + '"]');
      ct[k] = el ? el.value : '#0D1B0D';
    });
    return ct;
  }
  function showPanelNote(msg) {
    var el = panel.querySelector('#pjDevInfo');
    if (el) { el.textContent = msg; setTimeout(function () { el.textContent = ''; }, 2500); }
  }
  function importThemeFile(file, isTheme) {
    var r = new FileReader();
    r.onload = function () {
      try {
        var obj = JSON.parse(r.result);
        if (isTheme) { SET.customTheme = obj; applySetting('theme', 'custom'); }
        else {
          SET = obj;
          var el = panel.querySelector('#pjSections');
          save();
          location.reload();
        }
        rebuildSwatches();
        showPanelNote('Imported!');
      } catch (e) { alert('Invalid JSON file'); }
    };
    r.readAsText(file);
  }
  function download(name, content) {
    var a = D.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
    a.download = name;
    D.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function togglePanel() {
    var open = panel.classList.toggle('open');
    gear.classList.toggle('open', open);
    if (SET.sound.click) beep(open ? 720 : 500, 0.06, 0.05);
  }

  /* ---------- apply settings ---------- */
  function applySetting(key, val) {
    var a = SET.appearance, c = SET.cursor, s = SET.sound, b = SET.bg, l = SET.layout, d = SET.dev;
    var html = D.documentElement;
    switch (key) {
      case 'theme':
        a.theme = val;
        html.setAttribute('data-pj-theme', val);
        if (val === 'custom' && SET.customTheme) applyCustomTheme(SET.customTheme);
        if (val === 'amoled' || val === 'midnight' || (val === 'auto' && W.matchMedia('(prefers-color-scheme: dark)').matches) || (val === 'custom' && SET.customTheme && isDark(SET.customTheme.bg))) { if (b.effect === 'none') b.effect = 'fireflies'; }
        bgInit(b.effect);
        break;
      case 'accent': case 'accentCustom': case 'accentCustom2':
        if (key === 'accent') { a.accent = val; }
        if (key === 'accentCustom') { a.accent = val; }
        if (key === 'accentCustom2') { a.accent2 = val; }
        applyAccent();
        break;
      case 'font': a.font = val; applyFont(); break;
      case 'fontSize': a.fontSize = parseFloat(val); html.style.fontSize = a.fontSize + '%'; break;
      case 'letterSpacing': a.letterSpacing = parseFloat(val); html.style.letterSpacing = a.letterSpacing + 'px'; break;
      case 'lineHeight': a.lineHeight = parseFloat(val); html.style.lineHeight = a.lineHeight; break;
      case 'radius': a.radius = parseFloat(val); html.style.setProperty('--pj-radius', a.radius + 'px'); applyRadius(); break;
      case 'shadowStr': a.shadow = parseFloat(val); html.style.setProperty('--pj-shadow', (a.shadow / 100) + ''); break;
      case 'glass': a.glass = parseFloat(val); panel.style.setProperty('--pj-glass', (a.glass / 100) + ''); break;
      case 'animSpeed': a.animSpeed = parseFloat(val); applyAnim(); break;
      case 'cursorEn': c.enabled = val; if (val) { initCursor(); } else { destroyCursor(); } break;
      case 'style': c.style = val; break;
      case 'size': c.size = parseFloat(val); curSize = c.size; break;
      case 'largeCursor':
        a11yLarge = val;
        html.classList.toggle('pj-lc', val && c.enabled);
        if (val && !a11yPrevSize) { a11yPrevSize = c.size; c.size = Math.max(c.size, 56); }
        else if (!val && a11yPrevSize) { c.size = a11yPrevSize; a11yPrevSize = 0; }
        curSize = c.size;
        break;
      case 'speed': case 'trail': case 'trailColor': case 'trailOpacity': case 'glow': case 'density': case 'physics':
        c[key] = key === 'speed' || key === 'density' || key === 'physics' || key === 'trailOpacity' ? parseFloat(val) : key === 'trail' ? parseInt(val, 10) : val;
        break;
      case 'clickAnim': c.clickAnim = val; break;
      case 'hoverAnim': c.hoverAnim = val; break;
      case 'idleAnim': c.idleAnim = val; break;
      case 'shadow': c.shadow = val; break;
      case 'reduceMotion': a11yReduce = val; html.classList.toggle('pj-rm', val); if (val) { destroyCursor(); bgInit('none'); } else if (c.enabled && !COARSE && !REDUCED) { initCursor(); bgInit(b.effect); } break;
      case 'highContrast': a11yHC = val; html.classList.toggle('pj-hc', val); break;
      case 'focusMode': a11yFocus = val; html.classList.toggle('pj-focus', val); break;
      case 'readingMode': a11yRead = val; html.classList.toggle('pj-rd', val); break;
      case 'dyslexiaFont': a11yDys = val; html.classList.toggle('pj-dys', val); if (val) loadDysFont(); break;
      case 'colorBlind': a11yCB = val; html.classList.remove('pj-cb-protanopia', 'pj-cb-deuteranopia', 'pj-cb-tritanopia'); if (val !== 'none') html.classList.add('pj-cb-' + val); break;
      case 'soundEn': s.enabled = val; if (!val) stopNature(); else startNature(s.nature); break;
      case 'click': s.click = val; break;
      case 'hover': s.hover = val; break;
      case 'muted': s.muted = val; if (val) stopNature(); else startNature(s.nature); break;
      case 'volume': s.volume = parseFloat(val); if (!s.muted && s.nature !== 'none') { stopNature(); startNature(s.nature); } break;
      case 'nature': s.nature = val; startNature(val); break;
      case 'effect': b.effect = val; bgInit(val); break;
      case 'performance': b.performance = val; bgInit(b.effect); break;
      case 'sidebarWidth': l.sidebarWidth = parseInt(val, 10); html.style.setProperty('--pj-sidebar', l.sidebarWidth + 'px'); applyDensity(); break;
      case 'density': l.density = val; applyDensity(); break;
      case 'rounded': l.rounded = val; html.classList.toggle('pj-radius-sharp', !val); applyRadius(); break;
      case 'scrollbar': l.scrollbar = val; html.setAttribute('data-pj-scroll', val); break;
      case 'fps': d.fps = val; fpsEl.classList.toggle('on', val); break;
      case 'stats': d.stats = val; statsEl.classList.toggle('on', val); break;
      case 'lang': SET.lang = val; if (W.setLang) W.setLang(val); break;
      default:
        if (key.indexOf('ct_') === 0) { /* collected on apply */ }
    }
    save();
  }
  function isDark(c) {
    var m = /^#?([0-9a-f]{6})$/i.exec(c || '');
    if (!m) return true;
    var v = parseInt(m[1], 16);
    return (v & 0xFF) + ((v >> 8) & 0xFF) + ((v >> 16) & 0xFF) < 400;
  }
  function applyCustomTheme(ct) {
    var st = D.documentElement.style;
    st.setProperty('--c-bg', ct.bg); st.setProperty('--c-card', ct.card); st.setProperty('--c-btn', ct.btn);
    st.setProperty('--c-sidebar', ct.sidebar); st.setProperty('--c-navbar', ct.navbar); st.setProperty('--c-footer', ct.footer);
    st.setProperty('--c-text', ct.text); st.setProperty('--c-text2', ct.text2); st.setProperty('--c-border', ct.border);
    st.setProperty('--c-accent', ct.accent); st.setProperty('--c-accent2', ct.accent2);
  }
  function applyAccent() {
    var html = D.documentElement;
    html.style.setProperty('--bright-yellow', SET.appearance.accent);
    html.style.setProperty('--golden-amber', SET.appearance.accent2);
  }
  function applyFont() {
    var html = D.documentElement, f = SET.appearance.font;
    var map = { inter: 'Inter', poppins: 'Poppins', roboto: 'Roboto', nunito: 'Nunito', sfpro: "'SF Pro Display',-apple-system,'Segoe UI',sans-serif", jetbrains: "'JetBrains Mono',monospace", firacode: "'Fira Code',monospace", system: "'Segoe UI',system-ui,-apple-system,sans-serif" };
    if (f === 'inter' || f === 'poppins' || f === 'roboto' || f === 'nunito' || f === 'jetbrains' || f === 'firacode') {
      var fam = f === 'jetbrains' ? 'JetBrains+Mono:wght@400;500;600' : f === 'firacode' ? 'Fira+Code:wght@400;500;600' : f.charAt(0).toUpperCase() + f.slice(1);
      if (!D.getElementById('pjFontLink')) {
        var l = D.createElement('link');
        l.id = 'pjFontLink'; l.rel = 'stylesheet';
        l.href = 'https://fonts.googleapis.com/css2?family=' + fam + '&display=swap';
        D.head.appendChild(l);
      }
    }
    html.style.setProperty('--pj-font', map[f]);
    html.style.setProperty('font-family', map[f]);
  }
  function applyRadius() {
    var html = D.documentElement, a = SET.appearance, l = SET.layout;
    html.style.setProperty('--pj-radius', a.radius + 'px');
    if (!l.rounded) html.classList.add('pj-radius-sharp'); else html.classList.remove('pj-radius-sharp');
  }
  function applyAnim() {
    var html = D.documentElement, sp = SET.appearance.animSpeed;
    html.removeAttribute('data-pj-anim');
    if (sp <= 20) html.setAttribute('data-pj-anim', 'off');
    else if (sp < 80) html.setAttribute('data-pj-anim', 'slow');
    else if (sp > 130) html.setAttribute('data-pj-anim', 'fast');
  }
  function applyDensity() {
    var html = D.documentElement, l = SET.layout;
    html.setAttribute('data-pj-layout', l.density);
    html.style.setProperty('--pj-sidebar', l.sidebarWidth + 'px');
  }
  var a11yReduce = false, a11yHC = false, a11yLarge = false, a11yFocus = false, a11yRead = false, a11yDys = false, a11yCB = 'none', a11yPrevSize = 0;

  /* ---------- FPS / stats ---------- */
  var fpsEl, statsEl, fpsFrames = 0, fpsVal = 0;
  function initDev() {
    fpsEl = D.createElement('div'); fpsEl.id = 'pjFps'; D.body.appendChild(fpsEl);
    statsEl = D.createElement('div'); statsEl.id = 'pjStats'; D.body.appendChild(statsEl);
    fpsEl.classList.toggle('on', SET.dev.fps);
    statsEl.classList.toggle('on', SET.dev.stats);
    function tickFps() { fpsFrames++; requestAnimationFrame(tickFps); }
    requestAnimationFrame(tickFps);
    setInterval(function () {
      fpsVal = fpsFrames;
      fpsFrames = 0;
      if (SET.dev.fps) fpsEl.textContent = 'FPS: ' + fpsVal + (fpsVal >= 55 ? ' ✓' : ' ⚠');
      if (SET.dev.stats) statsEl.textContent = 'px: ' + parts.length + ' | bg: ' + bgParticles.length + ' | DPR: ' + DPR + ' | Q: ' + QUALITY;
    }, 1000);
  }

  /* ---------- keyboard shortcuts ---------- */
  D.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key === ',') { e.preventDefault(); togglePanel(); }
  });

  /* ---------- click / hover sounds ---------- */
  D.addEventListener('click', function (e) {
    var t = e.target;
    if (SET.sound.enabled && !SET.sound.muted && SET.sound.click && (!t || !t.closest || !t.closest('#pjPanel'))) beep(520, 0.05, 0.04, 'triangle');
  }, true);
  var lastHover = 0;
  D.addEventListener('mouseover', function (e) {
    var t = e.target;
    if (SET.sound.hover && SET.sound.enabled && !SET.sound.muted && Date.now() - lastHover > 60) {
      if (t && t.tagName && (t.tagName === 'BUTTON' || t.tagName === 'A')) { beep(700, 0.03, 0.02, 'sine'); lastHover = Date.now(); }
    }
  }, true);

  /* ---------- visibility / cleanup ---------- */
  D.addEventListener('visibilitychange', function () {
    if (D.hidden) { cancelAnimationFrame(raf); cancelAnimationFrame(bgRaf); } else if (running) { raf = requestAnimationFrame(loop); bgInit(SET.bg.effect); }
  });
  W.addEventListener('pagehide', function () { stopNature(); });

  /* ---------- URL share import ---------- */
  (function () {
    var q = new URLSearchParams(location.search);
    var p = q.get('pj') || q.get('pjtheme');
    if (p) {
      try {
        var obj = JSON.parse(decodeURIComponent(escape(atob(p))));
        if (obj.customTheme || obj.cursor) { SET = obj; save(); }
        else if (obj.bg) { SET.customTheme = obj; save(); SET.appearance.theme = 'custom'; }
      } catch (e) {}
    }
  })();

  /* ---------- account sync (Firebase RTDB REST) ---------- */
  var sync = { uid: null, email: '', applying: false, busy: false, last: 0, pushTimer: 0 };
  function syncInit() {
    try {
      if (!W.firebase || !W.firebase.auth || !W.firebase.auth()) return;
      W.firebase.auth().onAuthStateChanged(function (u) {
        sync.uid = u ? u.uid : null;
        sync.email = u ? (u.email || '') : '';
        if (u) syncPull();
        updateSyncNote();
      });
    } catch (e) {}
  }
  function syncUrl() { return 'https://python-2bab1-default-rtdb.firebaseio.com/pj/' + sync.uid + '.json'; }
  function syncToken() { return W.firebase.auth().currentUser.getIdToken(); }
  function syncPull() {
    if (!sync.uid) return;
    syncToken().then(function (tok) {
      return fetch(syncUrl() + '?auth=' + encodeURIComponent(tok), { cache: 'no-store' });
    }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (srv) {
        if (srv && srv.ts && srv.s) {
          sync.applying = true;
          mergeDeep(DEF, JSON.parse(srv.s));
          sync.applying = false;
          sync.last = srv.ts;
          applyAll();
          if (SET.cursor.enabled && !COARSE) initCursor(); else if (!SET.cursor.enabled) destroyCursor();
          bgInit(SET.bg.effect);
          rebuildSwatches();
          updateSyncNote('☁ Loaded settings from cloud');
        }
      }).catch(function () { updateSyncNote('☁ Sync failed — settings stay local'); });
  }
  function schedulePush() {
    if (!sync.uid) return;
    clearTimeout(sync.pushTimer);
    sync.pushTimer = setTimeout(pushNow, 2000);
  }
  function pushNow() {
    if (!sync.uid || sync.busy) return;
    sync.busy = true;
    syncToken().then(function (tok) {
      return fetch(syncUrl() + '?auth=' + encodeURIComponent(tok), {
        method: 'PUT',
        body: JSON.stringify({ ts: Date.now(), s: JSON.stringify(SET) }),
        headers: { 'Content-Type': 'application/json' }
      });
    }).then(function () { sync.last = Date.now(); updateSyncNote(); })
      .catch(function () { updateSyncNote('☁ Sync failed — settings stay local'); })
      .then(function () { sync.busy = false; });
  }
  function updateSyncNote(msg) {
    var el = panel && panel.querySelector('#pjSyncNote');
    if (!el) return;
    el.textContent = msg || (sync.uid ? '☁ Synced with ' + sync.email + ' — settings follow you across devices' : '☁ Not synced — sign in to sync settings across devices');
  }

  /* ---------- boot ---------- */
  function applyAll() {
    var a = SET.appearance, c = SET.cursor, l = SET.layout;
    var html = D.documentElement;
    html.setAttribute('data-pj-theme', a.theme);
    if (a.theme === 'custom' && SET.customTheme) applyCustomTheme(SET.customTheme);
    applyAccent();
    applyFont();
    html.style.fontSize = a.fontSize + '%';
    html.style.letterSpacing = a.letterSpacing + 'px';
    html.style.lineHeight = a.lineHeight;
    html.style.setProperty('--pj-radius', a.radius + 'px');
    applyRadius(); applyAnim(); applyDensity();
    html.setAttribute('data-pj-scroll', l.scrollbar);
    html.classList.toggle('pj-hc', a11yHC = SET.a11y.highContrast);
    html.classList.toggle('pj-focus', a11yFocus = SET.a11y.focusMode);
    html.classList.toggle('pj-rd', a11yRead = SET.a11y.readingMode);
    html.classList.toggle('pj-dys', a11yDys = SET.a11y.dyslexiaFont);
    if (SET.a11y.dyslexiaFont) loadDysFont();
    html.classList.toggle('pj-rm', a11yReduce = SET.a11y.reduceMotion || REDUCED);
    html.classList.remove('pj-cb-protanopia', 'pj-cb-deuteranopia', 'pj-cb-tritanopia');
    if (SET.a11y.colorBlind !== 'none') { html.classList.add('pj-cb-' + SET.a11y.colorBlind); a11yCB = SET.a11y.colorBlind; }
    a11yLarge = SET.a11y.largeCursor;
    html.classList.toggle('pj-lc', a11yLarge && SET.cursor.enabled);
    if (a11yLarge) { if (!a11yPrevSize) a11yPrevSize = SET.cursor.size; if (SET.cursor.size < 56) SET.cursor.size = 56; }
    else if (a11yPrevSize) { SET.cursor.size = a11yPrevSize; a11yPrevSize = 0; }
    curSize = c.size;
  }
  function loadDysFont() {
    if (!D.getElementById('pjDysLink')) {
      var l = D.createElement('link'); l.id = 'pjDysLink'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=OpenDyslexic&display=swap';
      D.head.appendChild(l);
    }
  }
  function boot() {
    if (W.setLang) W.setLang(SET.lang);
    buildPanel();
    initDev();
    applyAll();
    if (SET.cursor.enabled && !COARSE && !a11yReduce && !REDUCED) initCursor();
    bgInit(SET.bg.effect);
    startNature(SET.sound.nature);
    syncInit();
  }

  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
