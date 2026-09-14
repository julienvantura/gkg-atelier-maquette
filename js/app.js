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
  /* flèches manuscrites */
  var cueArrow = document.getElementById("cueArrow");
  if (cueArrow) cueArrow.setAttribute("d", smoothPath(linePts(11, 2, 11, 28, 6, rnd(14), 2.5), false) + " M4 22 L11 31 L18 22");
  var plateArrow = document.getElementById("plateArrow");
  if (plateArrow) plateArrow.setAttribute("d", smoothPath(linePts(6, 4, 58, 22, 6, rnd(15), 5), false) + " M48 24 L60 23 L52 13");
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
    "/contact": "contact",
    "/mentions-legales": "legal"
  };
  var titles = {
    home: "La Recette GKG",
    pizzas: "La carte — GKG Distribution",
    solution: "La solution — GKG Distribution",
    gkg: "Pourquoi GKG — GKG Distribution",
    contact: "Contact — GKG Distribution",
    legal: "Mentions légales — GKG Distribution"
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
  /* filet de sécurité : si le ticker GSAP est gelé (onglet en arrière-plan), on lève le rideau quand même */
  setTimeout(function(){
    if (wipe.classList.contains("active")) {
      wipe.classList.remove("active");
      if (hasGsap) gsap.set(wipe.querySelectorAll(".wipe-panel"), { scaleY: 0 });
    }
  }, 3200);
})();
