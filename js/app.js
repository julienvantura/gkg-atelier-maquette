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
  /* ---------- aperçu intégré (iframe, artifact) ---------- */
  var EN_LIGNE = "https://julienvantura.github.io/gkg-atelier-maquette/";
  var DANS_CADRE = (function(){ try { return window.top !== window.self; } catch (e) { return true; } })();
  function noteApercu(hote, quoi){
    if (!DANS_CADRE || !hote) return;
    var p = document.createElement("p");
    p.className = "hors-cadre";
    p.innerHTML = quoi + " dans cet aperçu intégré. "
      + "<a href=\"" + EN_LIGNE + "\" target=\"_blank\" rel=\"noopener\">Ouvrir la maquette en pleine page</a> pour la chaîne complète.";
    hote.parentNode.insertBefore(p, hote);
  }
  noteApercu(document.querySelector(".bache-actions"), "Le téléchargement et l\u2019envoi du bon à tirer sont bloqués");
  noteApercu(document.querySelector("#simForm .sim-etape"), "L\u2019envoi de la demande est bloqué");

  /* ---------- avis Google ---------- */
  (function(){
    var sec = document.getElementById("avisGoogle");
    if (!sec) return;
    var place = (sec.getAttribute("data-place-id") || "").trim();
    if (!place) return;                       // pas encore de fiche : on garde l'invitation seule
    var lien = document.getElementById("avisLien");
    if (lien) lien.href = "https://search.google.com/local/writereview?placeid=" + encodeURIComponent(place);
  })();

  /* ---------- demande d'estimation ---------- */
  var API_SIM = "https://julienvantura.alwaysdata.net/bat/simulateur.php";
  /* une visite suffit à faire avancer la file des estimations, si la tâche planifiée est à l'arrêt */
  setTimeout(function(){ try { fetch(API_SIM + "?tick=1", { mode:"cors", keepalive:true }).catch(function(){}); } catch (e) {} }, 5000);
  (function(){
    var form = document.getElementById("simForm");
    if (!form) return;
    var VOLUMES = {
      "Hôtel": "Combien de chambres ?",
      "Camping": "Quelle fréquentation par an ?",
      "Club de sport": "Combien d'adhérents ou de passages par mois ?",
      "Espace de coworking": "Combien de passages par mois ?"
    };
    var val = function(id){ var e = document.getElementById(id); return e ? (e.value || "").trim() : ""; };
    var err = function(msg, cible){
      var e = document.getElementById("sErr");
      if (msg) { e.textContent = msg; e.classList.add("on"); } else { e.classList.remove("on"); }
      if (cible) { var c = document.getElementById(cible); if (c && c.focus) c.focus(); }
    };
    var etape = function(n){
      form.querySelectorAll(".sim-etape").forEach(function(s){ s.hidden = s.getAttribute("data-etape") !== String(n); });
      err(null);
    };

    var act = document.getElementById("sActivite");
    act.addEventListener("change", function(){
      document.getElementById("sVolumeLab").textContent = VOLUMES[act.value] || "Combien de clients par mois ?";
      document.getElementById("sTauxBloc").hidden = !(act.value === "Hôtel" || act.value === "Camping");
      err(null);
    });
    var taux = document.getElementById("sTaux"), tauxOut = document.getElementById("sTauxOut");
    taux.addEventListener("input", function(){ tauxOut.textContent = taux.value + " %"; });

    var resto = "non";
    form.querySelectorAll(".sim-oui").forEach(function(b){
      b.addEventListener("click", function(){
        form.querySelectorAll(".sim-oui").forEach(function(o){ o.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        resto = b.getAttribute("data-resto");
        document.getElementById("sRepasBloc").hidden = resto !== "oui";
      });
    });

    document.getElementById("sSuite").addEventListener("click", function(){
      if (!act.value) return err("dites-nous d'abord votre activité —", "sActivite");
      if (!(parseInt(val("sVolume"), 10) > 0)) return err("il nous manque votre volume d'activité —", "sVolume");
      etape(2);
    });
    document.getElementById("sRetour").addEventListener("click", function(){ etape(1); });

    var envoi = document.getElementById("sEnvoi");
    envoi.addEventListener("click", function(){
      if (val("sNom") === "") return err("votre nom, s'il vous plaît —", "sNom");
      if (val("sSociete") === "") return err("le nom de votre établissement —", "sSociete");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(val("sMail"))) return err("un courriel valide, pour vous envoyer l'estimation —", "sMail");
      if (val("sTel") === "") return err("un téléphone, au cas où —", "sTel");
      if (!document.getElementById("sRgpd").checked) return err("il nous faut votre accord pour vous recontacter —", "sRgpd");
      err(null);
      var etiquette = envoi.innerHTML;
      envoi.setAttribute("data-busy", "1"); envoi.textContent = "Envoi en cours…";
      var fini = function(){ envoi.removeAttribute("data-busy"); envoi.innerHTML = etiquette; };
      var fd = new FormData();
      fd.append("activite", act.value);
      fd.append("volume", val("sVolume"));
      fd.append("taux", taux.value);
      fd.append("restauration", resto);
      fd.append("repas", resto === "oui" ? (val("sRepas") || "0") : "0");
      fd.append("societe", val("sSociete"));
      fd.append("nom", val("sNom"));
      fd.append("prenom", val("sPrenom"));
      fd.append("courriel", val("sMail"));
      fd.append("telephone", val("sTel"));
      fd.append("commune", val("sCommune"));
      fd.append("piege", val("sPiege"));
      fetch(API_SIM, { method: "POST", body: fd })
        .then(function(r){ return r.json().catch(function(){ return { ok:false, erreur:"réponse inattendue du serveur" }; }); })
        .then(function(rep){
          fini();
          if (rep && rep.ok) { document.getElementById("sRef").textContent = rep.ref || ""; etape(3); }
          else err((rep && rep.erreur ? rep.erreur : "l'envoi a échoué") + " — appelez-nous, c'est plus rapide —");
        })
        .catch(function(){ fini(); err(DANS_CADRE ? "aperçu intégré : ouvrez la maquette en pleine page pour envoyer —"
                                                      : "l'envoi a échoué, vérifiez votre connexion —"); });
    });
  })();


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
    "/rse": "rse",
    "/bache": "bache",
    "/contact": "contact",
    "/mentions-legales": "legal"
  };
  var titles = {
    home: "La Recette GKG",
    pizzas: "La carte — GKG",
    solution: "La solution — GKG",
    gkg: "Pourquoi GKG — GKG",
    rse: "RSE & développement durable — GKG",
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
    /* coup de stabilo sur "tous" */
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
      grot: { fam:'"Poppins", Arial, sans-serif',  w1:"500", w2:"800", caps:true,  dep:196 },
      arch: { fam:'"Archivo", Arial, sans-serif', w1:"500", w2:"700", caps:true,  dep:206 },
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

    function dessine(apres){
      var th = THEMES[etat.bg], fo = FONTS[etat.font];
      var aGauche = etat.side === "left";
      var besoin = ["assets/img/augusto-bien-plus-qu-une-pizza.png"];
      if (etat.img) besoin.push("assets/img/" + etat.img);
      var reste = besoin.length;
      besoin.forEach(function(s){ img(s, function(){
        if (--reste > 0) return;
        peint(th, fo, aGauche);
        if (apres) apres();
      }); });
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
      var vasy = function(){ if (!prevu) return; prevu = false; dessine(); };
      requestAnimationFrame(vasy);
      setTimeout(vasy, 140);   // filet : en arrière-plan le rAF peut ne jamais venir
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

    /* ---------- signature ---------- */
    var sp = document.getElementById("bSignPad");
    var aSigne = false, sctx = null;
    if (sp) {
      sctx = sp.getContext("2d");
      sctx.lineWidth = 4.5; sctx.lineCap = "round"; sctx.lineJoin = "round"; sctx.strokeStyle = "#1B1A16";
      var trace = false, px = 0, py = 0;
      var pos = function(e){
        var r = sp.getBoundingClientRect();
        return [(e.clientX - r.left) * sp.width / r.width, (e.clientY - r.top) * sp.height / r.height];
      };
      sp.addEventListener("pointerdown", function(e){
        e.preventDefault(); trace = true;
        try { sp.setPointerCapture(e.pointerId); } catch (err) {}
        var p = pos(e); px = p[0]; py = p[1];
        sctx.beginPath(); sctx.moveTo(px, py); sctx.lineTo(px + .2, py + .2); sctx.stroke();
        if (!aSigne) { aSigne = true; sp.parentNode.classList.add("signe"); }
      });
      sp.addEventListener("pointermove", function(e){
        if (!trace) return;
        var p = pos(e);
        sctx.beginPath(); sctx.moveTo(px, py); sctx.lineTo(p[0], p[1]); sctx.stroke();
        px = p[0]; py = p[1];
      });
      ["pointerup", "pointercancel", "pointerleave"].forEach(function(t){
        sp.addEventListener(t, function(){ trace = false; });
      });
      var efface = document.getElementById("bSignClear");
      if (efface) efface.addEventListener("click", function(){
        sctx.clearRect(0, 0, sp.width, sp.height);
        aSigne = false; sp.parentNode.classList.remove("signe");
      });
    }

    /* ---------- bon à tirer ---------- */
    function ch2(n){ return (n < 10 ? "0" : "") + n; }
    var d0 = new Date();
    var REF = "BAT-" + d0.getFullYear() + ch2(d0.getMonth() + 1) + ch2(d0.getDate()) + "-"
            + ("000" + Math.floor(Math.random() * 65535).toString(16).toUpperCase()).slice(-4);
    var DATE_FR = ch2(d0.getDate()) + "/" + ch2(d0.getMonth() + 1) + "/" + d0.getFullYear();

    function v(id){ var e = document.getElementById(id); return e ? (e.value || "").trim() : ""; }
    function erreur(msg){
      var e = document.getElementById("bacheErr");
      if (!e) return;
      if (msg) { e.textContent = msg; e.classList.add("on"); } else { e.classList.remove("on"); }
    }
    function occupe(btn, on){
      if (btn) btn.setAttribute("data-busy", on ? "1" : "0");
    }
    function slug(s){
      return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }

    var jsAttente = null;
    function chargeJsPDF(cb){
      if (window.jspdf && window.jspdf.jsPDF) { cb(window.jspdf.jsPDF); return; }
      if (jsAttente) { jsAttente.push(cb); return; }
      jsAttente = [cb];
      var s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/4.2.1/jspdf.umd.min.js";
      s.onload = function(){
        var f = window.jspdf && window.jspdf.jsPDF;
        var q = jsAttente; jsAttente = null; q.forEach(function(k){ k(f || null); });
      };
      s.onerror = function(){ var q = jsAttente; jsAttente = null; q.forEach(function(k){ k(null); }); };
      document.head.appendChild(s);
    }

    function signatureJpeg(){
      var c = document.createElement("canvas");
      c.width = sp.width; c.height = sp.height;
      var x = c.getContext("2d");
      x.fillStyle = "#FFFFFF"; x.fillRect(0, 0, c.width, c.height);
      x.drawImage(sp, 0, 0);
      return c.toDataURL("image/jpeg", .92);
    }

    function manquants(){
      var m = [];
      if (!v("bSoc")) m.push("le nom de votre établissement");
      if (!v("bSig")) m.push("le nom du signataire");
      if (!v("bTel") && !v("bMail")) m.push("un téléphone ou un courriel");
      if (!aSigne) m.push("votre signature");
      return m;
    }

    var NOMS_POL = { grot:"Marque (Poppins)", arch:"Classique (Archivo)", hand:"Manuscrite (Caveat)" };
    var NOMS_FOND = { encre:"Encre (#17160F)", tomate:"Tomate (#B8321F)", kraft:"Kraft (#D8C7A5)" };
    function nomPizza(){
      if (!etat.img) return "Aucun visuel";
      var b = document.querySelector('.bc-piz[data-img="' + etat.img + '"] span');
      return "Pizza " + (b ? b.textContent : "Augusto") + ", catalogue Augusto 2026";
    }

    function construitBat(cb){
      var m = manquants();
      if (m.length) {
        erreur("il manque " + m.join(", ") + " —");
        var cible = !v("bSoc") ? "bSoc" : !v("bSig") ? "bSig" : (!v("bTel") && !v("bMail")) ? "bTel" : "bSignPad";
        var el = document.getElementById(cible);
        if (el && el.scrollIntoView) el.scrollIntoView({ behavior:"smooth", block:"center" });
        if (el && el.focus && cible !== "bSignPad") setTimeout(function(){ el.focus(); }, 500);
        cb(null); return;
      }
      erreur(null);
      chargeJsPDF(function(JsPDF){
        if (!JsPDF) { erreur("le générateur de PDF n'a pas pu se charger — vérifiez votre connexion"); cb(null); return; }
        dessine(function(){ batAvecJsPDF(JsPDF, cb); });
      });
    }

    function batAvecJsPDF(JsPDF, cb){
      {

        var doc = new JsPDF({ unit:"mm", format:"a4", compress:true });
        var LG = 210, MG = 16, COL = LG - 2 * MG;
        var ENCRE = [32, 30, 26], ROUGE = [184, 50, 31], GRIS = [112, 107, 97], TRAIT = [206, 201, 190];
        function col(c){ doc.setTextColor(c[0], c[1], c[2]); }
        function filet(yy){ doc.setDrawColor(TRAIT[0], TRAIT[1], TRAIT[2]); doc.setLineWidth(.3); doc.line(MG, yy, LG - MG, yy); }
        function section(t, yy){
          doc.setFont("helvetica", "bold"); doc.setFontSize(7.6); col(ROUGE);
          doc.text(t.toUpperCase(), MG, yy);
        }

        doc.setFillColor(ROUGE[0], ROUGE[1], ROUGE[2]); doc.rect(0, 0, LG, 4.2, "F");

        /* en-tête */
        doc.setFont("helvetica", "bold"); doc.setFontSize(23); col(ENCRE);
        doc.text("BON À TIRER", MG, 21);
        doc.setFont("helvetica", "normal"); doc.setFontSize(9); col(GRIS);
        doc.text("Bâche publicitaire Augusto × GKG", MG, 27);
        doc.setFont("helvetica", "bold"); doc.setFontSize(11); col(ENCRE);
        doc.text(REF, LG - MG, 18, { align:"right" });
        doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); col(GRIS);
        doc.text("Établi le " + DATE_FR, LG - MG, 23.5, { align:"right" });
        doc.text("Valable 30 jours", LG - MG, 28, { align:"right" });
        filet(33);

        /* émetteur / client */
        var y = 40;
        section("Émetteur", y);
        doc.setFont("helvetica", "bold"); doc.setFontSize(7.6); col(ROUGE);
        doc.text("CLIENT", 112, y);
        y += 6;
        doc.setFontSize(9);
        var gauche = ["GKG", "Distributeur exclusif Augusto à La Réunion", "La Saline-les-Bains", "+262 692 027 061", "contact@gkg-distribution.com"];
        var qualite = v("bFonc") ? v("bSig") + ", " + v("bFonc") : v("bSig");
        var droite = [v("bSoc"), qualite, v("bVille") || "—", v("bTel") || "—", v("bMail") || "—"];
        for (var i = 0; i < 5; i++) {
          doc.setFont("helvetica", i === 0 ? "bold" : "normal");
          col(i === 0 ? ENCRE : GRIS);
          doc.text(gauche[i], MG, y + i * 4.7);
          doc.setFont("helvetica", i === 0 ? "bold" : "normal");
          col(i === 0 ? ENCRE : GRIS);
          doc.text(String(droite[i]).slice(0, 52), 112, y + i * 4.7);
        }
        y += 5 * 4.7;
        filet(y);

        /* visuel */
        y += 8;
        section("Le visuel à imprimer", y);
        y += 3.5;
        var iw = COL, ih = iw * cv.height / cv.width;
        doc.setDrawColor(TRAIT[0], TRAIT[1], TRAIT[2]); doc.setLineWidth(.4);
        doc.rect(MG, y, iw, ih);
        doc.addImage(cv.toDataURL("image/jpeg", .92), "JPEG", MG, y, iw, ih);
        y += ih + 4.2;
        doc.setFont("helvetica", "italic"); doc.setFontSize(7.2); col(GRIS);
        doc.text("Aperçu à l'échelle. Le fichier d'impression est produit par GKG à partir de ce visuel.", MG, y);
        y += 4;
        filet(y);

        /* caractéristiques */
        y += 8;
        section("Caractéristiques d'impression", y);
        y += 5.6;
        var lignes = [
          ["Support", "Bâche PVC 510 g/m², ourlets périphériques et œillets tous les 50 cm"],
          ["Format fini", "300 × 80 cm, impression quadrichromie, recto"],
          ["Quantité", (v("bQte") || "1") + " exemplaire" + ((parseInt(v("bQte"), 10) || 1) > 1 ? "s" : "")],
          ["Fond", NOMS_FOND[etat.bg]],
          ["Police", NOMS_POL[etat.font]],
          ["Visuel", nomPizza()],
          ["Mise en page", etat.side === "left" ? "Texte à gauche, visuel à droite" : "Texte à droite, visuel à gauche"],
          ["Première ligne", etat.t1 ? "« " + etat.t1 + " »" : "—"],
          ["Seconde ligne", etat.t2 ? "« " + etat.t2 + " »" : "—"],
          ["Mention portée", etat.etab ? etat.etab : "aucune"]
        ];
        doc.setFontSize(8.6);
        lignes.forEach(function(l){
          doc.setFont("helvetica", "normal"); col(GRIS);
          doc.text(l[0], MG, y);
          doc.setFont("helvetica", "bold"); col(ENCRE);
          var t = doc.splitTextToSize(l[1], COL - 42);
          doc.text(t[0], MG + 42, y);
          y += 4.9;
        });
        y += 1.6;
        filet(y);

        /* bon pour accord */
        y += 8;
        section("Bon pour accord", y);
        y += 5.4;
        var para = "Je soussigné(e) " + v("bSig") + (v("bFonc") ? ", agissant en qualité de " + v("bFonc") : "")
                 + " pour l'établissement " + v("bSoc") + ", déclare avoir vérifié le présent bon à tirer "
                 + "(textes, orthographe, visuel, format et quantité) et en autorise l'impression. "
                 + "Toute erreur non signalée à ce stade ne pourra être imputée à GKG.";
        doc.setFont("helvetica", "normal"); doc.setFontSize(8.4); col(ENCRE);
        var pl = doc.splitTextToSize(para, COL);
        doc.text(pl, MG, y);
        y += pl.length * 4.1 + 5;

        var bx = LG - MG - 70, by = y, bw = 70, bh = 27;
        doc.setFont("helvetica", "normal"); doc.setFontSize(8.6); col(ENCRE);
        doc.text("Fait à " + (v("bVille") || "………………"), MG, y + 6);
        doc.text("le " + DATE_FR, MG, y + 12);
        doc.setDrawColor(TRAIT[0], TRAIT[1], TRAIT[2]); doc.setLineWidth(.4);
        doc.rect(bx, by, bw, bh);
        doc.addImage(signatureJpeg(), "JPEG", bx + 1.6, by + 1.6, bw - 3.2, bh - 3.2);
        doc.setFontSize(7); col(GRIS);
        doc.text("Signature du client, vaut bon pour accord", LG - MG, by + bh + 4, { align:"right" });

        /* pied */
        filet(283);
        doc.setFontSize(6.8); col(GRIS);
        doc.text("GKG, distributeur exclusif Augusto à La Réunion · contact@gkg-distribution.com · +262 692 027 061", MG, 288);
        doc.text(REF + " · page 1/1", LG - MG, 288, { align:"right" });

        doc.setProperties({ title:"Bon à tirer " + REF + " — " + v("bSoc"), subject:"Bâche publicitaire Augusto × GKG", author:"GKG" });
        cb(doc);
      }
    }

    function nomFichier(){
      return REF + (v("bSoc") ? "-" + slug(v("bSoc")) : "") + ".pdf";
    }
    function confirme(envoye){
      var ok = document.getElementById("bacheOk"), r = document.getElementById("bacheRef");
      var m1 = document.getElementById("bacheMsg"), m2 = document.getElementById("bacheMsg2");
      if (r) r.textContent = REF;
      if (m1) m1.textContent = envoye ? "bon à tirer" : "bon à tirer";
      if (m2) m2.textContent = envoye ? "envoyé à GKG ✓ réponse sous 24 h ouvrées" : "enregistré ✓";
      if (ok) ok.classList.add("on");
    }

    var bPdf = document.getElementById("bPdf");
    if (bPdf) bPdf.addEventListener("click", function(){
      occupe(bPdf, true);
      construitBat(function(doc){
        occupe(bPdf, false);
        if (!doc) return;
        doc.save(nomFichier());
        confirme(false);
      });
    });

    var API_BAT = "https://julienvantura.alwaysdata.net/bat/";
    var send = document.getElementById("bSend");
    if (send) send.addEventListener("click", function(){
      var etiquette = send.innerHTML;
      occupe(send, true); send.textContent = "Envoi en cours…";
      var fini = function(){ occupe(send, false); send.innerHTML = etiquette; };
      construitBat(function(doc){
        if (!doc) { fini(); return; }
        var NOMS_MEP = { left:"Texte à gauche, visuel à droite", right:"Texte à droite, visuel à gauche" };
        var fd = new FormData();
        fd.append("fichier", doc.output("blob"), nomFichier());
        fd.append("ref", REF);
        fd.append("etablissement", v("bSoc"));
        fd.append("signataire", v("bSig"));
        fd.append("fonction", v("bFonc"));
        fd.append("commune", v("bVille"));
        fd.append("telephone", v("bTel"));
        fd.append("courriel", v("bMail"));
        fd.append("quantite", v("bQte") || "1");
        fd.append("ligne1", etat.t1);
        fd.append("ligne2", etat.t2);
        fd.append("police", NOMS_POL[etat.font]);
        fd.append("fond", NOMS_FOND[etat.bg]);
        fd.append("visuel", nomPizza());
        fd.append("mise_en_page", NOMS_MEP[etat.side]);
        fd.append("piege", v("bPiege"));
        fetch(API_BAT, { method:"POST", body: fd })
          .then(function(r){ return r.json().catch(function(){ return { ok:false, erreur:"réponse inattendue du serveur" }; }); })
          .then(function(rep){
            fini();
            if (rep && rep.ok) { erreur(null); confirme(true); }
            else { erreur((rep && rep.erreur ? rep.erreur : "l'envoi a échoué") + " — enregistrez le PDF et écrivez-nous —"); }
          })
          .catch(function(){
            fini();
            erreur(DANS_CADRE ? "aperçu intégré : ouvrez la maquette en pleine page pour envoyer —"
                              : "l'envoi a échoué, vérifiez votre connexion — vous pouvez enregistrer le PDF et nous l'adresser —");
          });
      });
    });

    var dl = document.getElementById("bDl");
    if (dl) dl.addEventListener("click", function(){
      cv.toBlob(function(b){
        if (!b) return;
        var u = URL.createObjectURL(b), a = document.createElement("a");
        a.href = u; a.download = "visuel-bache-" + (slug(v("bSoc")) || slug(v("bEtab")) || "gkg") + ".png";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function(){ URL.revokeObjectURL(u); }, 5000);
      }, "image/png");
    });

    ["500 100px Poppins", "800 100px Poppins",
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
