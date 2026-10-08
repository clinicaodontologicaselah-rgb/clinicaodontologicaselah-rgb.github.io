window.addEventListener("click", function (event) {
  const target = event.target;
  const anchor = target && target.closest ? target.closest("a[href]") : null;
  if (!anchor) return;

  const href = anchor.getAttribute("href");
  if (!href) return;

  if (
    href.startsWith("#") ||
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("javascript:")
  ) return;

  if (href.startsWith("/")) {
    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    window.location.assign(href);
  }
}, true);


/* Selah: CTA prioritario WhatsApp y elección de sede.
   Conserva los enlaces originales y los eventos de medición de Google Ads. */
(function () {
  if (location.pathname !== "/") return;
  const messages = {
    "50582413023": "Hola, quiero información y agendar una cita en Clínica Dental Selah, sede Los Robles. ¿Qué horarios tienen disponibles?",
    "50577448772": "Hola, quiero información y agendar una cita en Clínica Dental Selah, sede Reparto San Juan. ¿Qué horarios tienen disponibles?"
  };
  let working = false;
  function optimize() {
    if (working) return;
    working = true;
    try {
      const root = document.getElementById("root");
      if (!root) return;
      const hero = root.querySelector("main section") || root.querySelector("main");
      if (!hero) return;
      const anchors = Array.from(hero.querySelectorAll("a"));
      const direct = anchors.find(a => a.textContent.includes("WhatsApp directo") && a.href.includes("wa.me/"));
      const form = anchors.find(a => a.textContent.includes("Solicitar cita en 1 minuto"));
      if (direct) {
        const label = Array.from(direct.querySelectorAll("span")).find(s => s.textContent.trim() === "WhatsApp directo");
        if (label) label.textContent = "Agendar por WhatsApp";
        direct.setAttribute("aria-label", "Agendar cita por WhatsApp, sede Los Robles");
      }
      if (form) {
        const label = Array.from(form.querySelectorAll("span")).find(s => s.textContent.trim() === "Solicitar cita en 1 minuto");
        if (label) label.textContent = "Prefiero completar mis datos";
        form.style.backgroundColor = "transparent";
        form.style.color = "#155e63";
        form.style.border = "1px solid #b7d9dc";
        form.style.boxShadow = "none";
      }
      const promo = Array.from(hero.querySelectorAll("span,div,p")).find(e =>
        e.children.length === 0 && e.textContent.trim().toUpperCase() === "PROMOCIÓN DE ORTODONCIA");
      if (promo) {
        const badge = promo.closest(".inline-flex") || promo.parentElement;
        if (badge && badge !== hero) badge.style.display = "none";
      }
      // Solo sustituir mensajes generales, sin tocar campañas ni enlaces de servicios específicos.
      root.querySelectorAll('a[href*="wa.me/"]').forEach(a => {
        try {
          const u = new URL(a.href);
          const phone = u.pathname.replace(/\D/g, "");
          const current = u.searchParams.get("text") || "";
          if (u.hostname === "wa.me" && messages[phone] && current.includes("u otro servicio dental")) {
            u.searchParams.set("text", messages[phone]);
            a.href = u.toString();
          }
        } catch (_) {}
      });
      if (direct && !document.getElementById("selah-branch-choice")) {
        const row = document.createElement("div");
        row.id = "selah-branch-choice";
        row.style.cssText = "display:flex;flex-wrap:wrap;gap:10px;margin-top:12px;align-items:center";
        const label = document.createElement("span");
        label.textContent = "O agenda directamente en:";
        label.style.cssText = "font-size:13px;color:#334155";
        row.appendChild(label);
        [["Los Robles","50582413023"],["Reparto San Juan","50577448772"]].forEach(([name,phone]) => {
          const a = document.createElement("a");
          a.href = "https://wa.me/" + phone + "?text=" + encodeURIComponent(messages[phone]);
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.textContent = name + " · WhatsApp";
          a.style.cssText = "display:inline-block;padding:10px 14px;border-radius:22px;background:#e8f8ed;color:#17683a;font-size:13px;font-weight:700;text-decoration:none";
          row.appendChild(a);
        });
        const parent = direct.parentElement;
        if (parent) parent.insertAdjacentElement("afterend",row);
      }
    } finally { working = false; }
  }
  let pending = false;
  const observer = new MutationObserver(() => {
    if (pending || working) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; optimize(); });
  });
  function start() {
    optimize();
    const root = document.getElementById("root");
    if (root) observer.observe(root,{childList:true,subtree:true});
    setTimeout(optimize,800);
    setTimeout(optimize,2200);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
})();

/* Selah: mensaje transparente en el aviso existente; no crear ventanas nuevas. */
(function () {
  let updating = false;
  function adjust() {
    if (updating) return;
    updating = true;
    try {
      document.querySelectorAll("button,a,span,p,div,h2,h3,strong").forEach(el => {
        if (el.children.length > 0) return;
        const t = el.textContent.trim();
        if (t === "Ver opciones") {
          el.textContent = "Elegir sede";
          el.setAttribute("aria-label","Elegir sede para agendar por WhatsApp");
        } else if (t === "Tu cita está a un mensaje") {
          el.textContent = "Tu cita está a un clic";
        }
      });
    } finally { updating = false; }
  }
  let pending = false;
  const observer = new MutationObserver(() => {
    if (pending || updating) return;
    pending = true;
    setTimeout(() => { pending = false; adjust(); }, 100);
  });
  function start() {
    adjust();
    observer.observe(document.body, {childList:true,subtree:true,characterData:true});
    setTimeout(adjust,600);
    setTimeout(adjust,1800);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
})();

/* Selah: identificar origen y sede en cada enlace WhatsApp del sitio.
   No altera eventos de conversion ni envia mensajes automaticamente. */
(function () {
  const phones = {"50582413023":"Los Robles","50577448772":"Reparto San Juan"};
  const params = new URLSearchParams(location.search);
  const fromAds = params.has("gclid") || params.has("gbraid") || params.has("wbraid") ||
    (/(google)/i.test(params.get("utm_source") || "") && /(cpc|ppc|paid)/i.test(params.get("utm_medium") || ""));
  try { if (fromAds) sessionStorage.setItem("selah_paid_google","1"); } catch (_) {}
  function message(branch) {
    let paid = fromAds;
    try { paid = paid || sessionStorage.getItem("selah_paid_google") === "1"; } catch (_) {}
    return paid
      ? "Hola, llegué desde un anuncio de Clínica Dental Selah en Google y quiero agendar una cita en " + branch + "."
      : "Hola, visité la página web de Clínica Dental Selah y quiero agendar una cita en " + branch + ".";
  }
  function update(anchor) {
    try {
      const u = new URL(anchor.href);
      if (u.hostname !== "wa.me") return;
      const phone = u.pathname.replace(/\D/g,"");
      if (!phones[phone]) return;
      const text = message(phones[phone]);
      if (u.searchParams.get("text") !== text) {
        u.searchParams.set("text",text);
        anchor.href = u.toString();
      }
    } catch (_) {}
  }
  function updateAll() { document.querySelectorAll('a[href*="wa.me/"]').forEach(update); }
  // Actualizar el enlace al instante en el gesto del usuario, incluso si React acaba de renderizarlo.
  document.addEventListener("pointerdown",function(e) {
    const anchor = e.target && e.target.closest ? e.target.closest('a[href*="wa.me/"]') : null;
    if (anchor) update(anchor);
  },true);
  document.addEventListener("click",function(e) {
    const anchor = e.target && e.target.closest ? e.target.closest('a[href*="wa.me/"]') : null;
    if (anchor) update(anchor);
  },true);
  let queued = false;
  const observer = new MutationObserver(function() {
    if (queued) return;
    queued = true;
    setTimeout(function(){queued=false;updateAll();},100);
  });
  function start() {
    updateAll();
    observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["href"]});
    setTimeout(updateAll,700);
    setTimeout(updateAll,2000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
})();
