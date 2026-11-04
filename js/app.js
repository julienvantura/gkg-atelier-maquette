(function(){
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var hasGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  var animOn = hasGsap && !reduced;
  if (!animOn) document.body.classList.add("no-anim");
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  var SVGNS = "http://www.w3.org/2000/svg";

  /* ---------- petits tracés "main levée" (accents uniquement) ---------- */
  function mulberry(seed){
    return function(){
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function smoothPath(pts, closed){
    if (pts.length < 3) return "";
    var p = pts.slice();
    if (closed) { p.unshift(pts[pts.length - 1]); p.push(pts[0], pts[1]); }
    else { p.unshift(pts[0]); p.push(pts[pts.length - 1]); }
    var d = "M" + p[1][0].toFixed(1) + " " + p[1][1].toFixed(1);
    for (var i = 1; i < p.length - 2; i++) {
      var c1x = p[i][0] + (p[i+1][0] - p[i-1][0]) / 6;
      var c1y = p[i][1] + (p[i+1][1] - p[i-1][1]) / 6;
      var c2x = p[i+1][0] - (p[i+2][0] - p[i][0]) / 6;
      var c2y = p[i+1][1] - (p[i+2][1] - p[i][1]) / 6;
      d += "C" + c1x.toFixed(1) + " " + c1y.toFixed(1) + " " + c2x.toFixed(1) + " " + c2y.toFixed(1) + " " + p[i+1][0].toFixed(1) + " " + p[i+1][1].toFixed(1);
    }
    return d;
  }
  function linePts(x1, y1, x2, y2, n, rand, amp){
    var pts = [];
    for (var i = 0; i <= n; i++) {
      var t = i / n;
      var nx = -(y2 - y1), ny = x2 - x1;
      var len = Math.hypot(nx, ny) || 1;
      var off = (rand() - .5) * amp * Math.sin(t * Math.PI + rand());
      pts.push([x1 + (x2 - x1) * t + nx / len * off, y1 + (y2 - y1) * t + ny / len * off]);
    }
    return pts;
  }
  var rnd = function(o){ return mulberry(20260909 + o); };

  /* coup de stabilo du hero */
  var hlStroke = document.getElementById("hlStroke");
  if (hlStroke) hlStroke.setAttribute("d", smoothPath(linePts(4, 27, 96, 20, 7, rnd(13), 4), false));
  /* vapeur crayon au-dessus de l'assiette */
  document.querySelectorAll(".plate-steam .steam-p").forEach(function(p, i){
    var r = rnd(40 + i * 9), pts = [], x0 = 26 + i * 48;
    for (var k = 0; k <= 12; k++) {
      var t = k / 12;
      pts.push([x0 + Math.sin(t * Math.PI * 2.4 + i * 1.3) * (7 + t * 6) + (r() - .5) * 3, 88 - t * 80]);
    }
    p.setAttribute("d", smoothPath(pts, false));
  });
  /* boutons d'appel dépliants */
  var splits = [].slice.call(document.querySelectorAll("[data-callsplit]"));
  function closeSplits(except){
    splits.forEach(function(s){
      if (s === except) return;
      if (!s.classList.contains("open")) return;
      s.classList.remove("open");
      s.querySelector(".cs-trigger").setAttribute("aria-expanded", "false");
      var o = s.querySelector(".cs-opts");
      setTimeout(function(){ if (!s.classList.contains("open")) o.hidden = true; }, 320);
    });
  }
  splits.forEach(function(s, i){
    var t = s.querySelector(".cs-trigger"), o = s.querySelector(".cs-opts");
    o.id = "cs-opts-" + i; t.setAttribute("aria-controls", o.id);
    t.addEventListener("click", function(e){
      e.stopPropagation();
      if (s.classList.contains("open")) { closeSplits(null); return; }
      closeSplits(s);
      o.hidden = false;
      requestAnimationFrame(function(){ requestAnimationFrame(function(){
        s.classList.add("open"); t.setAttribute("aria-expanded", "true");
      }); });
    });
    o.addEventListener("click", function(e){ e.stopPropagation(); });
  });
  document.addEventListener("click", function(){ closeSplits(null); });
  document.addEventListener("keydown", function(e){ if (e.key === "Escape") closeSplits(null); });
  window.addEventListener("hashchange", function(){ closeSplits(null); });

  /* flèches manuscrites */
  var cueArrow = document.getElementById("cueArrow");
  if (cueArrow) cueArrow.setAttribute("d", smoothPath(linePts(11, 2, 11, 28, 6, rnd(14), 2.5), false) + " M4 22 L11 31 L18 22");
  var plateArrow = document.getElementById("plateArrow");
  if (plateArrow) plateArrow.setAttribute("d", smoothPath(linePts(6, 46, 64, 9, 6, rnd(15), 5), false) + " M51 9 L67 6 L60 21");
  var heroNoteArrow = document.getElementById("heroNoteArrow");
  if (heroNoteArrow) heroNoteArrow.setAttribute("d", smoothPath(linePts(24, 37, 7, 5, 6, rnd(31), 3), false) + " M1 15 L6 2 L16 9");
  var tabletArrow = document.getElementById("tabletArrow");
  if (tabletArrow) tabletArrow.setAttribute("d", smoothPath(linePts(3, 20, 60, 13, 6, rnd(44), 4), false) + " M50 5 L64 12 L50 21");
  document.querySelectorAll(".s-arrow .arrow-draw").forEach(function(p, i){
    p.setAttribute("d", smoothPath(linePts(2, 11, 26, 11, 5, rnd(16 + i), 3), false) + " M20 4 L29 11 L20 18");
  });
  /* cadres croquis */
  function drawFrames(){
    document.querySelectorAll(".gkg-card, .phase, .duo-card").forEach(function(card, i){
      var svg = card.querySelector(".frame");
      if (!svg) return;
      svg.innerHTML = "";
      var w = card.offsetWidth, h = card.offsetHeight;
      if (!w || !h) return;
      svg.setAttribute("viewBox", "0 0 " + w + " " + h);
      var r = rnd(150 + i * 61);
      var pts = [];
      [[4,4,w-4,4],[w-4,4,w-4,h-4],[w-4,h-4,4,h-4],[4,h-4,4,4]].forEach(function(seg){
        pts = pts.concat(linePts(seg[0], seg[1], seg[2], seg[3], 6, r, 3.5).slice(0, -1));
      });
      var el = document.createElementNS(SVGNS, "path");
      el.setAttribute("d", smoothPath(pts, true));
      svg.appendChild(el);
    });
  }
  window.addEventListener("resize", drawFrames);

  /* ---------- thème clair / sombre ---------- */
  (function(){
    var KEY = "gkg_theme";
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    function apply(t){
      var nav = document.querySelector(".nav");
      if (t === "light") document.documentElement.setAttribute("data-theme", "light");
      else document.documentElement.removeAttribute("data-theme");
      document.querySelectorAll("[data-theme-toggle]").forEach(function(b){ b.setAttribute("aria-pressed", String(t === "light")); });
      if (nav) { nav.style.display = "none"; void nav.offsetHeight; nav.style.display = ""; }
    }
    apply(saved === "light" ? "light" : "dark");
    document.querySelectorAll("[data-theme-toggle]").forEach(function(btn){
      btn.addEventListener("click", function(){
        var next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
        apply(next);
        try { localStorage.setItem(KEY, next); } catch (e) {}
      });
    });
  })();

  /* ---------- lenis ---------- */
  var lenis = null;
  if (animOn && typeof Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.1, easing: function(t){ return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function(time){ lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function toTop(){
    if (lenis) lenis.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
  }

  /* ---------- boutons magnétiques ---------- */
  if (animOn && finePointer) {
    document.querySelectorAll(".btn").forEach(function(btn){
      var setX = gsap.quickTo(btn, "x", { duration: .35, ease: "power3.out" });
      var setY = gsap.quickTo(btn, "y", { duration: .35, ease: "power3.out" });
      btn.addEventListener("mousemove", function(e){
        var r = btn.getBoundingClientRect();
        setX((e.clientX - r.left - r.width / 2) * .2);
        setY((e.clientY - r.top - r.height / 2) * .3);
      });
      btn.addEventListener("mouseleave", function(){ setX(0); setY(0); });
    });
  }

  /* ---------- film : lecture muette quand visible, pause hors écran ---------- */
  var filmObservers = [];
  function setupFilm(video, replayBtn){
    if (!video) return;
    video.muted = true;
    var tryPlay = function(){ var p = video.play(); if (p && p.catch) p.catch(function(){}); };
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(en){ en.isIntersecting ? tryPlay() : video.pause(); });
      }, { threshold: .2 });
      io.observe(video);
      filmObservers.push(io);
    } else tryPlay();
    if (replayBtn) replayBtn.addEventListener("click", function(){ video.currentTime = 0; tryPlay(); });
  }
  /* ---------- simulateur ---------- */
  var rp = document.getElementById("rangePizzas");
  var rx = document.getElementById("rangePrix");
  function setFill(el){ el.style.setProperty("--fill", ((+el.value - +el.min) / (+el.max - +el.min) * 100) + "%"); }
  var caM = document.getElementById("caMois"), caA = document.getElementById("caAn");
  var caCur = { m: 5400, a: 64800 };
  var caFirst = true;
  function renderCa(){
    caM.textContent = Math.round(caCur.m).toLocaleString("fr-FR") + " €";
    caA.textContent = Math.round(caCur.a).toLocaleString("fr-FR") + " €";
  }
  function calc(){
    var p = +rp.value, prix = +rx.value;
    document.getElementById("outPizzas").textContent = p;
    document.getElementById("outPrix").textContent = prix.toLocaleString("fr-FR", {minimumFractionDigits: 2}) + " €";
    var mois = p * prix * 30;
    if (animOn && !caFirst) {
      /* les euros défilent : chiffres qui roulent + petit pop */
      gsap.to(caCur, { m: mois, a: mois * 12, duration: .55, ease: "power2.out", onUpdate: renderCa, overwrite: true });
      gsap.fromTo([caM, caA], { scale: 1.06 }, { scale: 1, duration: .45, ease: "power2.out", transformOrigin: "left bottom", overwrite: "auto" });
    } else {
      caCur.m = mois; caCur.a = mois * 12; renderCa();
    }
    caFirst = false;
    setFill(rp); setFill(rx);
  }
  if (rp && rx) { rp.addEventListener("input", calc); rx.addEventListener("input", calc); calc(); }


  /* ---------- polaroids : clic = retournement ---------- */
  document.querySelectorAll(".pola-flip").forEach(function(p){
    function flip(){
      var on = !p.classList.contains("is-flipped");
      p.classList.toggle("is-flipped", on);
      p.setAttribute("aria-pressed", String(on));
    }
    p.addEventListener("click", flip);
    p.addEventListener("keydown", function(e){
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); }
    });
  });
  /* ---------- formulaire → mailto ---------- */
  var form = document.getElementById("contactForm");
  if (form) form.addEventListener("submit", function(e){
    e.preventDefault();
    var v = function(id){ return (document.getElementById(id).value || "").trim(); };
    var subject = "Demande d'étude gratuite — " + (v("fEtab") || v("fNom"));
    var body = "Nom : " + v("fNom") + "\nTéléphone : " + v("fTel") + "\nÉtablissement : " + v("fEtab") + "\nCommune : " + v("fVille") + "\n\nProjet :\n" + v("fMsg");
    window.location.href = "mailto:contact@gkg-distribution.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  });

  /* ---------- menu mobile ---------- */
  var burger = document.getElementById("burger");
  var mobmenu = document.getElementById("mobmenu");
  var menuOpen = false;
  function closeMenu(){
    if (!menuOpen) return;
    menuOpen = false;
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    if (animOn) gsap.to(mobmenu, { opacity: 0, duration: .3, onComplete: function(){ mobmenu.classList.remove("open"); } });
    else mobmenu.classList.remove("open");
    if (lenis) lenis.start();
  }
  function openMenu(){
    menuOpen = true;
    burger.classList.add("open");
    burger.setAttribute("aria-expanded", "true");
    mobmenu.classList.add("open");
    if (animOn) {
      gsap.fromTo(mobmenu, { opacity: 0 }, { opacity: 1, duration: .3 });
      gsap.fromTo(mobmenu.querySelectorAll(".mlink"), { y: 44, opacity: 0 }, { y: 0, opacity: 1, duration: .55, stagger: .07, ease: "power3.out", delay: .08, clearProps: "all" });
    }
    if (lenis) lenis.stop();
  }
  if (burger) burger.addEventListener("click", function(){ menuOpen ? closeMenu() : openMenu(); });

  /* ---------- routeur ---------- */
  var routes = {
    "": "home", "/": "home",
    "/pizzas": "pizzas",
    "/solution": "solution",
    "/gkg": "gkg",
    "/bache": "bache",
    "/contact": "contact",
    "/mentions-legales": "legal"
  };
  var titles = {
    home: "La Recette GKG",
    pizzas: "La carte — GKG",
    solution: "La solution — GKG",
    gkg: "Pourquoi GKG — GKG",
    bache: "Ma bâche — GKG",
    contact: "Contact — GKG",
    legal: "Mentions légales — GKG"
  };
  var current = null;

  function parseRoute(){
    var h = location.hash.replace(/^#/, "");
    return routes.hasOwnProperty(h) ? routes[h] : "home";
  }
  function setNav(key){
    document.querySelectorAll("[data-nav]").forEach(function(a){
      a.classList.toggle("active", a.getAttribute("data-nav") === key);
    });
    document.title = titles[key] || titles.home;
  }
  var looseTweens = [];
  function killPageAnims(){
    if (!hasGsap) return;
    ScrollTrigger.getAll().forEach(function(t){ t.kill(); });
    looseTweens.forEach(function(t){ t.kill(); });
    looseTweens = [];
  }

  var INTRO_DELAY = 0;
  var introUsed = false;
  function introDelayOnce(){ if (introUsed) return 0; introUsed = true; return INTRO_DELAY; }
  function initReveals(pageEl){
    pageEl.querySelectorAll(".reveal").forEach(function(el){
      var rot = el.classList.contains("pola") ? (Math.random() * 6 - 3) : 0;
      gsap.fromTo(el, { y: 44, opacity: 0, rotation: rot ? rot * 2 : 0 }, {
        y: 0, opacity: 1, rotation: 0, duration: .9, ease: "power3.out", overwrite: "auto", clearProps: "rotation",
        scrollTrigger: { trigger: el, start: "top 90%", once: true }
      });
    });
  }

  function initHome(pageEl){
    /* entrée hero : lignes du titre en masque + assiette qui se pose */
    var tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: introDelayOnce() });
    tl.fromTo("#page-home .hline-in", { yPercent: 112 }, { yPercent: 0, duration: .95, stagger: .14, ease: "power4.out" }, .1)
      .fromTo("#page-home .hero-plate", { y: 60, opacity: 0, rotation: 6 }, { y: 0, opacity: 1, rotation: 0, duration: 1.1, ease: "back.out(1.4)", clearProps: "rotation" }, .3);
    /* coup de stabilo vert fluo sur "tous" */
    if (hlStroke) {
      var hlen = hlStroke.getTotalLength();
      gsap.fromTo(hlStroke, { strokeDasharray: hlen, strokeDashoffset: hlen }, { strokeDashoffset: 0, duration: .5, ease: "power2.inOut", delay: 1.05 + tl.delay() });
    }
    /* assiette : rotation au scroll + flottement continu */
    gsap.to("#heroPlate", {
      rotation: 32, ease: "none",
      scrollTrigger: { trigger: "#page-home .hero", start: "top top", end: "bottom top", scrub: true }
    });
    looseTweens.push(gsap.to("#heroPlate", { y: 10, duration: 3.4, yoyo: true, repeat: -1, ease: "sine.inOut" }));
    /* étiquette prix qui se balance */
    gsap.set(".price-tag", { rotation: -5, transformOrigin: "50% -26px" });
    looseTweens.push(gsap.to(".price-tag", { rotation: 5, duration: 1.7, yoyo: true, repeat: -1, ease: "sine.inOut" }));
    /* vapeur crayon : se dessine, s'évapore, recommence */
    pageEl.querySelectorAll(".plate-steam .steam-p").forEach(function(p, i){
      var len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len, opacity: .75 });
      var stl = gsap.timeline({ repeat: -1, delay: .9 + i * .55, repeatDelay: .7 });
      stl.to(p, { strokeDashoffset: 0, duration: 1.4, ease: "sine.inOut" })
         .to(p, { opacity: 0, duration: .55 }, "+=.25")
         .set(p, { strokeDashoffset: len, opacity: .75 });
      looseTweens.push(stl);
    });
    /* pluie de stickers */
    var stks = pageEl.querySelectorAll("#dropZone .stk");
    gsap.set(stks, { y: -220, opacity: 0, rotation: function(){ return Math.random() * 50 - 25; } });
    ScrollTrigger.create({
      trigger: "#dropZone", start: "top 78%", once: true,
      onEnter: function(){
        gsap.to(stks, {
          y: 0, opacity: 1,
          rotation: function(i, el){ return el.classList.contains("s-out") ? 3 : (i % 2 ? 2.5 : -3); },
          duration: .8, stagger: .08, ease: "bounce.out", overwrite: "auto"
        });
      }
    });
    /* la tablette : autoplay muet quand elle entre à l'écran */
    setupFilm(document.getElementById("tabletVideo"), document.getElementById("tabletReplay"));
    /* l'ardoise : les euros comptent sous les yeux */
    var mb = document.getElementById("moneyMois"), ma = document.getElementById("moneyAn");
    if (mb && ma) {
      mb.textContent = "0"; ma.textContent = "0";
      ScrollTrigger.create({
        trigger: ".money-card", start: "top 82%", once: true,
        onEnter: function(){
          var o = { m: 0, a: 0 };
          gsap.to(o, {
            m: 5400, a: 64800, duration: 1.8, ease: "power3.out",
            onUpdate: function(){
              mb.textContent = Math.round(o.m).toLocaleString("fr-FR");
              ma.textContent = Math.round(o.a).toLocaleString("fr-FR");
            }
          });
          gsap.fromTo(".money-card", { scale: .95, rotation: -3 }, { scale: 1, rotation: -1, duration: .9, ease: "back.out(2.2)" });
        }
      });
    }
  }

  function initSolution(pageEl){
    /* flèches des étapes se dessinent */
    pageEl.querySelectorAll(".s-arrow .arrow-draw").forEach(function(p, i){
      var len = p.getTotalLength();
      gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, {
        strokeDashoffset: 0, duration: .7, delay: i * .15, ease: "power2.out",
        scrollTrigger: { trigger: pageEl.querySelector(".steps"), start: "top 75%", once: true }
      });
    });
  }

  function initGkg(pageEl){
    pageEl.querySelectorAll(".m-stat b[data-num]").forEach(function(el){
      var target = +el.getAttribute("data-num");
      var suffix = el.getAttribute("data-suffix") || "";
      var obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 1.6, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
        onUpdate: function(){ el.innerHTML = Math.round(obj.v) + suffix; }
      });
    });
  }

  var inits = { home: initHome, pizzas: null, solution: initSolution, gkg: initGkg, contact: null, legal: null };

  function activate(key){
    document.querySelectorAll(".page").forEach(function(p){
      p.hidden = p.getAttribute("data-page") !== key;
    });
    toTop();
    setNav(key);
    drawFrames();
    if (animOn) {
      var pageEl = document.querySelector('[data-page="' + key + '"]');
      initReveals(pageEl);
      if (inits[key]) inits[key](pageEl);
      ScrollTrigger.refresh();
    }
    current = key;
  }

  var wipe = document.getElementById("wipe");
  /* navigation instantanée entre les pages : pas de transition */
  function go(key){
    if (key === current) return;
    closeMenu();
    killPageAnims();
    activate(key);
  }

  /* tampon d'intro : une seule fois, au chargement du site */
  function intro(){
    var stamp = wipe.querySelector(".wipe-stamp");
    var p1 = wipe.querySelector(".p1"), p2 = wipe.querySelector(".p2");
    wipe.classList.add("active");
    gsap.set([p1, p2], { scaleY: 1, transformOrigin: "top" });
    gsap.set(stamp, { opacity: 0 });
    var tl = gsap.timeline({
      onComplete: function(){
        wipe.classList.remove("active");
        gsap.set([p1, p2], { scaleY: 0 });
      }
    });
    tl.fromTo(stamp, { opacity: 0, scale: 1.7, rotation: 4 }, { opacity: 1, scale: 1, rotation: 0, duration: .32, ease: "power4.in" }, .2)
      .to(stamp, { opacity: 0, duration: .25 }, 1.1)
      .to(p2, { scaleY: 0, duration: .55, ease: "power4.inOut" }, 1.25)
      .to(p1, { scaleY: 0, duration: .55, ease: "power4.inOut" }, 1.35);
  }

  window.addEventListener("hashchange", function(){ go(parseRoute()); });
  INTRO_DELAY = animOn ? 1.4 : 0;
  if (animOn) intro();
  activate(parseRoute());
  /* ---------- composeur de bâche ---------- */
  (function(){
    var cv = document.getElementById("bacheCanvas");
    if (!cv) return;
    var ctx = cv.getContext("2d");
    var W = cv.width, H = cv.height, PAD = 150;

    var THEMES = {
      encre:  { bg:"#17160F", ink:"#F4EFE4", soft:"#B9B4A4", ombre:"rgba(0,0,0,.5)" },
      tomate: { bg:"#B8321F", ink:"#FFF7F3", soft:"#F3CDC3", ombre:"rgba(60,10,4,.42)" },
      kraft:  { bg:"#D8C7A5", ink:"#201E19", soft:"#5F5A4B", ombre:"rgba(40,34,22,.3)" }
    };
    var FONTS = {
      grot: { fam:'"Bricolage Grotesque", "Arial Black", sans-serif', w1:"500", w2:"800", caps:true,  dep:210 },
      arch: { fam:'"Archivo", Arial, sans-serif',                     w1:"500", w2:"700", caps:true,  dep:196 },
      hand: { fam:'"Caveat", cursive',                                w1:"600", w2:"600", caps:false, dep:286 }
    };
    var etat = { t1:"Ici, pizzas artisanales", t2:"à partager ou pas…", etab:"",
                 font:"grot", bg:"encre", side:"left", img:"pizza-margherita-augusto.webp" };

    var cache = {};
    function img(src, cb){
      if (cache[src]) { cb(cache[src]); return; }
      var im = new Image();
      im.onload = function(){ cache[src] = im; cb(im); };
      im.onerror = function(){ cb(null); };
      im.src = src;
    }
    function teinte(im, couleur){
      var c = document.createElement("canvas");
      c.width = im.width; c.height = im.height;
      var x = c.getContext("2d");
      x.drawImage(im, 0, 0);
      x.globalCompositeOperation = "source-in";
      x.fillStyle = couleur; x.fillRect(0, 0, c.width, c.height);
      return c;
    }
    function taille(txt, maxW, poids, fam, depart){
      var s = depart;
      while (s > 26) {
        ctx.font = poids + " " + s + "px " + fam;
        if (ctx.measureText(txt).width <= maxW) break;
        s -= 3;
      }
      return s;
    }

    function dessine(){
      var th = THEMES[etat.bg], fo = FONTS[etat.font];
      var aGauche = etat.side === "left";
      var besoin = ["assets/img/augusto-bien-plus-qu-une-pizza.png"];
      if (etat.img) besoin.push("assets/img/" + etat.img);
      var reste = besoin.length;
      besoin.forEach(function(s){ img(s, function(){ if (--reste === 0) peint(th, fo, aGauche); }); });
    }

    function peint(th, fo, aGauche){
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = th.bg; ctx.fillRect(0, 0, W, H);
      /* léger dégradé pour donner du relief */
      var g = ctx.createLinearGradient(aGauche ? W : 0, 0, aGauche ? 0 : W, H);
      g.addColorStop(0, "rgba(0,0,0,.18)"); g.addColorStop(.55, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

      var zone = 0, cx = 0;
      var pizza = etat.img ? cache["assets/img/" + etat.img] : null;
      if (pizza) {
        var hp = 624, wp = hp * pizza.width / pizza.height;
        if (wp > 760) { wp = 760; hp = wp * pizza.height / pizza.width; }
        zone = wp + 90;
        cx = aGauche ? (W - PAD - wp / 2) : (PAD + wp / 2);
        ctx.save();
        ctx.shadowColor = th.ombre; ctx.shadowBlur = 46;
        ctx.shadowOffsetX = aGauche ? -16 : 16; ctx.shadowOffsetY = 20;
        ctx.drawImage(pizza, cx - wp / 2, H / 2 - 22 - hp / 2, wp, hp);
        ctx.restore();
      }

      var x0 = PAD, x1 = W - PAD;
      if (pizza) { if (aGauche) x1 = W - PAD - zone; else x0 = PAD + zone; }
      var colW = x1 - x0;
      var align = pizza ? (aGauche ? "left" : "right") : "center";
      var ax = align === "left" ? x0 : align === "right" ? x1 : (x0 + x1) / 2;

      var t1 = fo.caps ? etat.t1.toUpperCase() : etat.t1;
      var t2 = fo.caps ? etat.t2.toUpperCase() : etat.t2;
      var s2 = taille(t2, colW, fo.w2, fo.fam, fo.dep);
      var s1 = Math.round(s2 * 0.62);
      s1 = Math.min(s1, taille(t1, colW, fo.w1, fo.fam, s1));

      var h1 = t1 ? s1 * 1.02 : 0, h2 = t2 ? s2 * 1.0 : 0;
      var inter = (t1 && t2) ? s2 * 0.26 : 0;
      var bloc = h1 + inter + h2;
      var top = H / 2 - bloc / 2 - (etat.etab ? 26 : 0);

      ctx.textAlign = align; ctx.textBaseline = "alphabetic";
      if (t1) {
        ctx.font = fo.w1 + " " + s1 + "px " + fo.fam;
        ctx.fillStyle = th.soft;
        ctx.fillText(t1, ax, top + s1 * 0.82);
      }
      if (t2) {
        ctx.font = fo.w2 + " " + s2 + "px " + fo.fam;
        ctx.fillStyle = th.ink;
        ctx.fillText(t2, ax, top + h1 + inter + s2 * 0.82);
      }
      if (etat.etab) {
        ctx.font = '500 30px "Spline Sans Mono", monospace';
        if ("letterSpacing" in ctx) ctx.letterSpacing = "6px";
        ctx.fillStyle = th.soft;
        ctx.fillText(etat.etab.toUpperCase(), ax, top + bloc + 74);
        if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
      }

      var logo = cache["assets/img/augusto-bien-plus-qu-une-pizza.png"];
      if (logo) {
        var wl = 262, hl = wl * logo.height / logo.width;
        var lx = (pizza && !aGauche) ? 56 : W - 56 - wl;
        ctx.globalAlpha = .92;
        ctx.drawImage(teinte(logo, th.ink), lx, H - 48 - hl, wl, hl);
        ctx.globalAlpha = 1;
      }
    }

    var prevu = false;
    function planifie(){
      if (prevu) return;
      prevu = true;
      requestAnimationFrame(function(){ prevu = false; dessine(); });
    }

    function lie(id, cle){
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", function(){ etat[cle] = el.value; planifie(); });
    }
    lie("bTxt1", "t1"); lie("bTxt2", "t2"); lie("bEtab", "etab");

    function groupe(sel, attr, cle){
      var btns = [].slice.call(document.querySelectorAll(sel));
      btns.forEach(function(b){
        b.addEventListener("click", function(){
          btns.forEach(function(o){ o.classList.remove("is-on"); o.setAttribute("aria-checked", "false"); });
          b.classList.add("is-on"); b.setAttribute("aria-checked", "true");
          etat[cle] = b.getAttribute(attr);
          planifie();
        });
      });
    }
    groupe(".bc-font", "data-font", "font");
    groupe(".bc-bg", "data-bg", "bg");
    groupe(".bc-side", "data-side", "side");
    groupe(".bc-piz", "data-img", "img");

    function nomFichier(){
      var base = (etat.etab || "gkg").toLowerCase()
        .normalize("NFD").replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "gkg";
      return "bon-a-tirer-bache-" + base + ".png";
    }
    function telecharge(apres){
      cv.toBlob(function(b){
        if (!b) { if (apres) apres(); return; }
        var u = URL.createObjectURL(b), a = document.createElement("a");
        a.href = u; a.download = nomFichier();
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function(){ URL.revokeObjectURL(u); }, 5000);
        if (apres) apres();
      }, "image/png");
    }
    var dl = document.getElementById("bDl");
    if (dl) dl.addEventListener("click", function(){ telecharge(null); });

    var send = document.getElementById("bSend");
    if (send) send.addEventListener("click", function(){
      var NOMS = { grot:"Grotesque", arch:"Classique", hand:"Manuscrite" };
      var FONDS = { encre:"Encre", tomate:"Tomate", kraft:"Kraft" };
      var piz = etat.img ? etat.img.replace(/^pizza-|-augusto.*$/g, "").replace(/-/g, " ") : "aucune";
      var corps = "Bonjour,\n\nVoici mon bon à tirer pour la bâche (le visuel est en pièce jointe).\n\n"
        + "Établissement : " + (etat.etab || "—") + "\n"
        + "Première ligne : " + etat.t1 + "\n"
        + "Seconde ligne : " + etat.t2 + "\n"
        + "Police : " + NOMS[etat.font] + "\n"
        + "Fond : " + FONDS[etat.bg] + "\n"
        + "Pizza : " + piz + "\n"
        + "Texte : " + (etat.side === "left" ? "à gauche" : "à droite") + "\n\n"
        + "Merci de me confirmer avant impression.\n";
      telecharge(function(){
        var ok = document.getElementById("bacheOk");
        if (ok) ok.classList.add("on");
        window.location.href = "mailto:contact@gkg-distribution.com?subject="
          + encodeURIComponent("Bon à tirer bâche — " + (etat.etab || "nouvel établissement"))
          + "&body=" + encodeURIComponent(corps);
      });
    });

    ["500 100px \"Bricolage Grotesque\"", "800 100px \"Bricolage Grotesque\"",
     "500 100px Archivo", "700 100px Archivo", "600 100px Caveat",
     "500 30px \"Spline Sans Mono\""].forEach(function(f){
      try { document.fonts && document.fonts.load(f); } catch (e) {}
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(planifie);
    window.addEventListener("hashchange", function(){
      if (location.hash === "#/bache") planifie();
    });
    planifie();
  })();

  /* filet de sécurité : si le ticker GSAP est gelé (onglet en arrière-plan), on lève le rideau quand même */
  setTimeout(function(){
    if (wipe.classList.contains("active")) {
      wipe.classList.remove("active");
      if (hasGsap) gsap.set(wipe.querySelectorAll(".wipe-panel"), { scaleY: 0 });
    }
  }, 3200);
})();
