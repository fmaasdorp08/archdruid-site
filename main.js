/* ============================================================
   CONFIG — everything that needs real client data lives here.
   ============================================================ */
const CONFIG = {
  // International format, digits only.
  whatsappNumber: "27736147488",
  brand: "Archdruid™",
};

// Colourway names are descriptive, taken from the photos. Names, edition
// counts, sizes and prices are not known yet: leave a field out and it is hidden.
// pos = CSS object-position for the card crop; video = optional looping clip.
const PIECES = [
  { id: "01", name: "Panel Anorak", variant: "Sand / Black",
    images: ["img/model-sand.jpg", "img/duo-roof-b.jpg"],
    desc: "Half-zip anorak in sand and black panels, with an elasticated cuff and hem and a woven label at the chest.",
    specs: { Colourway: "Sand / Black" } },
  { id: "02", name: "Panel Anorak", variant: "Navy / White piping",
    images: ["img/model-navy-close.jpg", "img/flat-navy.jpg", "img/model-navy-roof.jpg", "img/label-black.jpg", "img/label-navy-lime.jpg"],
    desc: "Half-zip anorak in navy with white piping and a banded chest strap. The inner label is printed in lime.",
    specs: { Colourway: "Navy / White piping" } },
  { id: "03", name: "Panel Anorak", variant: "Coral / Ivory",
    images: ["img/model-coral-wall.jpg", "img/model-coral-close.jpg", "img/flat-coral-ivory.jpg", "img/label-coral.jpg"],
    desc: "Half-zip anorak in coral with ivory sleeves and hem panels, and a white chest band with black piping.",
    specs: { Colourway: "Coral / Ivory" } },
  { id: "04", name: "Panel Anorak", variant: "Olive / Charcoal",
    images: ["img/flat-olive.jpg"],
    desc: "Half-zip anorak in olive and charcoal panels with a reflective piping line and a small woven chest label.",
    specs: { Colourway: "Olive / Charcoal" } },
  { id: "05", name: "Panel Anorak", variant: "Cream / Navy piping",
    images: ["img/flat-cream.jpg"],
    desc: "Half-zip anorak in cream with navy piping and a diagonal chest strap.",
    specs: { Colourway: "Cream / Navy piping" } },
  { id: "06", name: "Panel Anorak", variant: "White / Black piping",
    images: ["img/poster-white-anorak.jpg"], video: "video/white-anorak.mp4",
    desc: "Half-zip anorak in white with black piping, a chest strap and a panelled hem.",
    specs: { Colourway: "White / Black piping" } },
  { id: "07", name: "Panel Anorak", variant: "Coral / Black",
    images: ["img/flat-coral-black.jpg"], light: true,
    desc: "Half-zip anorak with a black body, coral sleeves and cream piping.",
    specs: { Colourway: "Coral / Black" } },
  { id: "08", name: "Panel Anorak", variant: "Royal blue / Grey",
    images: ["img/flat-navy-grey.jpg"], light: true,
    desc: "Half-zip anorak in royal blue with grey sleeve and hem panels and a diagonal chest strap.",
    specs: { Colourway: "Royal blue / Grey" } },
  { id: "09", name: "Cargo Trouser", variant: "Black",
    images: ["img/duo-roof-b.jpg", "img/duo-roof-a.jpg"], pos: "78% 88%",
    desc: "Wide black cargo trouser with contrast stitching and printed pocket details.",
    specs: { Colourway: "Black" } },
];

/* ============================================================
   Helpers
   ============================================================ */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

$("#yr").textContent = new Date().getFullYear();

function toast(msg) {
  let t = $("#toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:200;background:#e9e4da;color:#0a0b0c;font:400 12px/1.4 'JetBrains Mono',monospace;letter-spacing:.08em;padding:12px 16px;max-width:90vw";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.display = "block";
  clearTimeout(t._h);
  t._h = setTimeout(() => (t.style.display = "none"), 4000);
}

function waLink(text) {
  if (!CONFIG.whatsappNumber) return "#";
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

function wire(a, text) {
  a.href = waLink(text);
  if (!CONFIG.whatsappNumber) {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      toast("Preview: WhatsApp number not set yet.");
    });
  } else {
    a.target = "_blank";
    a.rel = "noopener";
  }
}

/* ============================================================
   Render archive
   ============================================================ */
const grid = $("#grid");
grid.innerHTML = PIECES.map((p, i) => `
  <button class="card" data-i="${i}"${p.light ? ' data-tone="light"' : ""} aria-label="${p.name}, ${p.variant}">
    <div class="card__plate">
      <img src="${p.images[0]}" alt="${p.name} — ${p.variant}" loading="lazy" ${p.pos ? `style="object-position:${p.pos}"` : ""} onerror="this.remove()">
      <span class="card__no">${p.id}</span>
      ${p.video ? '<span class="card__state" data-s="motion">Motion</span>' : ""}
    </div>
    <div class="card__info">
      <span class="card__name">${p.name}<br><small>${p.variant}</small></span>
      <span class="card__ed">View</span>
    </div>
  </button>`).join("");

wire($('[data-wa="general"]'), `Hi, I'd like to request a piece from ${CONFIG.brand}.`);
wire($('[data-wa="collector"]'), `Hi, please add me to the ${CONFIG.brand} collectors list.`);

/* ============================================================
   Piece overlay — 3D push-in
   ============================================================ */
const sheet = $("#sheet");
const panel = $(".sheet__panel", sheet);
const media = $(".sheet__media", sheet);
let lastFocus = null;

function showImage(src, alt, pos) {
  const img = $("#sheet-img");
  img.style.visibility = "visible";
  img.src = src;
  img.alt = alt;
  img.style.objectPosition = pos || "50% 50%";
}

function openSheet(i) {
  const p = PIECES[i];
  const label = `${p.name} — ${p.variant}`;
  lastFocus = document.activeElement;

  // media: image, optional looping clip, thumbnails
  $$("video, .thumbs", media).forEach((n) => n.remove());
  if (p.light) media.dataset.tone = "light"; else delete media.dataset.tone;
  showImage(p.images[0], label, p.pos);
  if (p.video) {
    const v = document.createElement("video");
    v.src = p.video; v.poster = p.images[0];
    v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true; v.setAttribute("aria-label", label + " in motion");
    media.appendChild(v);
    v.play().catch(() => {});
  }
  if (p.images.length > 1) {
    const t = document.createElement("div");
    t.className = "thumbs";
    t.innerHTML = p.images.map((s, k) => `<button type="button" data-k="${k}" aria-label="Image ${k + 1}"${k === 0 ? ' aria-current="true"' : ""}><img src="${s}" alt=""></button>`).join("");
    t.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      $$("button", t).forEach((x) => x.removeAttribute("aria-current"));
      b.setAttribute("aria-current", "true");
      showImage(p.images[+b.dataset.k], label, +b.dataset.k === 0 ? p.pos : "");
    });
    media.appendChild(t);
  }

  $("#sheet-no").textContent = `Piece ${p.id}`;
  $("#sheet-title").textContent = label;
  $("#sheet-desc").textContent = p.desc;
  const rows = { ...p.specs, Sizes: "Ask on WhatsApp", Price: "Ask on WhatsApp" };
  $("#sheet-specs").innerHTML = Object.entries(rows).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");

  const cta = $("#sheet-cta");
  cta.replaceWith(cta.cloneNode(true));
  wire($("#sheet-cta"), `Hi, I'd like to request piece ${p.id} — ${p.name}, ${p.variant} (${CONFIG.brand}).`);

  sheet.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  if (reduce) {
    gsap.set(sheet, { autoAlpha: 1 });
  } else {
    gsap.set(sheet, { autoAlpha: 0 });
    gsap.to(sheet, { autoAlpha: 1, duration: .35, ease: "power2.out" });
    gsap.fromTo(panel, { rotateY: -28, z: -500, y: 40, opacity: 0 },
      { rotateY: 0, z: 0, y: 0, opacity: 1, duration: .9, ease: "expo.out" });
  }
  $("#sheet-close").focus();
}

function closeSheet() {
  const done = () => {
    gsap.set(sheet, { autoAlpha: 0 });
    sheet.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    $$("video", media).forEach((v) => v.pause());
    if (lastFocus) lastFocus.focus();
  };
  if (reduce) return done();
  gsap.to(panel, { rotateY: 22, z: -400, opacity: 0, duration: .45, ease: "power3.in" });
  gsap.to(sheet, { autoAlpha: 0, duration: .45, delay: .1, onComplete: done });
}

grid.addEventListener("click", (e) => {
  const c = e.target.closest(".card");
  if (c) openSheet(+c.dataset.i);
});
$("#sheet-close").addEventListener("click", closeSheet);
sheet.addEventListener("click", (e) => { if (e.target === sheet) closeSheet(); });
addEventListener("keydown", (e) => {
  if (e.key === "Escape" && sheet.getAttribute("aria-hidden") === "false") closeSheet();
});

/* ============================================================
   Motion
   ============================================================ */
if (!reduce && window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  // Intro: title lines rise
  gsap.from(".line > span", { yPercent: 110, duration: 1.3, ease: "expo.out", stagger: .09, delay: .15 });
  gsap.from(".hero__meta, .nav", { opacity: 0, duration: 1, delay: .9 });

  // Hero: pinned (sticky) scroll. The title is pushed through the camera,
  // the photo and backdrop move at different depths.
  const hero = gsap.timeline({
    scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom bottom", scrub: .6 },
  });
  hero.to(".hero__title", { z: 700, scale: 1.25, opacity: 0, ease: "power2.in" }, 0)
      .to(".hero__figure", { yPercent: -14, scale: 1.1, ease: "none" }, 0)
      .to(".hero__bg", { yPercent: 10, scale: 1.18, ease: "none" }, 0)
      .to(".hero__meta", { opacity: 0, ease: "none" }, 0);

  // Scroll-scrubbed video: scroll position drives the playhead, eased so it
  // glides instead of stepping. The clips are encoded with dense keyframes.
  function scrubVideo(video, trigger) {
    if (!video) return;
    video.src = video.dataset.src;
    video.load();
    let target = 0;
    ScrollTrigger.create({
      trigger, start: "top top", end: "bottom bottom",
      onUpdate: (self) => { target = self.progress * (video.duration || 0); },
    });
    (function tick() {
      if (video.readyState >= 2 && video.duration) {
        const d = target - video.currentTime;
        if (Math.abs(d) > 0.02) video.currentTime += d * 0.18;
      }
      requestAnimationFrame(tick);
    })();
  }
  scrubVideo($("#hero-video"), "#hero");
  scrubVideo($("#motion-video"), "#motion");

  // Section headings
  $$(".section-head > *").forEach((el) => {
    gsap.from(el, { y: 60, opacity: 0, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%" } });
  });

  // Cards: tilt up out of depth, image parallax inside the plate
  $$(".card").forEach((card) => {
    gsap.from(card, { rotateX: 16, y: 90, opacity: 0, transformOrigin: "50% 100%", duration: 1.1, ease: "power3.out",
      scrollTrigger: { trigger: card, start: "top 88%" } });
    const img = $("img", card);
    if (img) gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: "none",
      scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true } });
  });

  // Collectors + request
  gsap.from(".collectors__inner", { rotateX: -14, y: 60, opacity: 0, duration: 1.1, ease: "power3.out",
    scrollTrigger: { trigger: ".collectors", start: "top 70%" } });
  gsap.from(".request > *", { y: 50, opacity: 0, duration: .9, stagger: .12, ease: "power3.out",
    scrollTrigger: { trigger: ".request", start: "top 75%" } });

  // Pointer tilt on cards (desktop only)
  if (finePointer) {
    $$(".card").forEach((card) => {
      const rx = gsap.quickTo(card, "rotateX", { duration: .5, ease: "power3.out" });
      const ry = gsap.quickTo(card, "rotateY", { duration: .5, ease: "power3.out" });
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        ry(x * 10); rx(-y * 10);
      });
      card.addEventListener("pointerleave", () => { rx(0); ry(0); });
    });
  }
}
