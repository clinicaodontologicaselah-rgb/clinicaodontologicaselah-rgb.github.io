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


/* Selah: mejora reversible de la portada para búsquedas dentales generales.
   No altera las etiquetas de Google Ads ni el seguimiento de clics a wa.me. */
(function () {
  if (location.pathname !== "/") return;
  function optimizeHome() {
    const root = document.querySelector("#root");
    if (!root) return;
    const hero = root.querySelector("main section");
    if (!hero) return;

    // Conservar la promoción en la sección de ortodoncia, no en el primer impacto genérico.
    const promo = Array.from(hero.querySelectorAll("span")).find(el =>
      el.textContent.trim().toUpperCase() === "PROMOCIÓN DE ORTODONCIA");
    if (promo && promo.parentElement) promo.parentElement.style.display = "none";

    // Priorizar un único camino visible hacia WhatsApp en el hero.
    const direct = Array.from(hero.querySelectorAll("a")).find(el =>
      el.textContent.trim() === "WhatsApp directo" && el.href.includes("wa.me/"));
    const formLink = Array.from(hero.querySelectorAll("a")).find(el =>
      el.textContent.trim() === "Solicitar cita en 1 minuto");
    if (direct) {
      const label = direct.querySelector("span");
      if (label) label.textContent = "Agendar por WhatsApp";
      direct.setAttribute("aria-label", "Agendar cita por WhatsApp en Clínica Dental Selah");
    }
    if (formLink) {
      formLink.style.background = "transparent";
      formLink.style.color = "#155e63";
      formLink.style.border = "1px solid #b7d9dc";
      formLink.style.boxShadow = "none";
      const label = formLink.querySelector("span");
      if (label) label.textContent = "Prefiero completar mis datos";
    }

    // Mensajes neutrales para enlaces genéricos. No modificar enlaces de servicios
    // con una intención específica ni la lógica de medición existente.
    root.querySelectorAll('a[href*="wa.me/"]').forEach(link => {
      try {
        const url = new URL(link.href);
        if (url.hostname !== "wa.me") return;
        const message = url.searchParams.get("text") || "";
        if (!message.includes("u otro servicio dental")) return;
        const branch = url.pathname.includes("50577448772") ? "Reparto San Juan" : "Los Robles";
        url.searchParams.set("text",
          "Hola, quiero información o agendar una cita en Clínica Dental Selah. Mi sede preferida es " + branch + ". ¿Me pueden ayudar?");
        link.href = url.toString();
      } catch (_) {}
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(optimizeHome, 250), {once:true});
  } else {
    setTimeout(optimizeHome, 250);
  }
})();
