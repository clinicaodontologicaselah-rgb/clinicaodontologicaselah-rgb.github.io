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

/* Selah: aviso móvil claro y respetuoso, sin interrumpir la navegación. */
(function () {
  const branchLinks = [
    ["Los Robles", "50582413023"],
    ["Reparto San Juan", "50577448772"]
  ];
  const textFor = name => "Hola, quiero agendar una cita en Clínica Dental Selah, sede " + name + ". ¿Qué horarios tienen disponibles?";
  let busy = false;
  function improveNotice() {
    if (busy) return;
    busy = true;
    try {
      const elements = Array.from(document.querySelectorAll("button,a,div,p,span,h2,h3"));
      const button = elements.find(el => el.children.length === 0 && el.textContent.trim() === "Ver opciones");
      if (!button || button.closest("#selah-ethical-notice")) return;
      const wrapper = button.closest("div[class*='fixed'],aside,[role='dialog']") ||
        button.parentElement?.parentElement?.parentElement;
      if (!wrapper || wrapper === document.body || wrapper === document.documentElement) return;
      // Ocultar el aviso anterior y conservarlo en DOM para no alterar componentes React.
      wrapper.style.setProperty("display","none","important");
      if (document.getElementById("selah-ethical-notice")) return;
      const card = document.createElement("aside");
      card.id = "selah-ethical-notice";
      card.setAttribute("aria-label","Agendar cita en Clínica Dental Selah");
      card.style.cssText = "position:fixed;left:12px;right:12px;bottom:84px;z-index:9998;max-width:460px;margin:auto;padding:12px 14px;border:1px solid #cde6e3;border-radius:16px;background:#fff;box-shadow:0 5px 20px rgba(15,55,55,.12);font-family:inherit;color:#153d42";
      const heading = document.createElement("div");
      heading.textContent = "¿Deseas agendar una cita?";
      heading.style.cssText = "font-weight:700;font-size:14px;margin:0 24px 9px 0";
      card.appendChild(heading);
      const close = document.createElement("button");
      close.type = "button";
      close.textContent = "×";
      close.setAttribute("aria-label","Cerrar invitación para agendar");
      close.style.cssText = "position:absolute;right:12px;top:7px;border:0;background:transparent;color:#64748b;font-size:23px;cursor:pointer";
      close.addEventListener("click",() => { card.remove(); sessionStorage.setItem("selah_notice_dismissed","1"); });
      card.appendChild(close);
      const actions = document.createElement("div");
      actions.style.cssText = "display:flex;flex-wrap:wrap;gap:8px";
      branchLinks.forEach(([name,phone]) => {
        const a = document.createElement("a");
        a.href = "https://wa.me/" + phone + "?text=" + encodeURIComponent(textFor(name));
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = "WhatsApp " + name;
        a.style.cssText = "display:inline-block;padding:10px 12px;border-radius:10px;background:#e8f8ed;color:#12653b;font-size:12px;font-weight:700;text-decoration:none";
        actions.appendChild(a);
      });
      card.appendChild(actions);
      if (sessionStorage.getItem("selah_notice_dismissed") !== "1") document.body.appendChild(card);
    } catch (_) {} finally { busy = false; }
  }
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled || busy) return;
    scheduled = true;
    setTimeout(() => { scheduled = false; improveNotice(); },150);
  });
  function start() {
    improveNotice();
    observer.observe(document.body,{childList:true,subtree:true});
    setTimeout(improveNotice,1000);
    setTimeout(improveNotice,2500);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
})();
