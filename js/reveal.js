// Scroll-reveal: fades/slides elements with class "reveal" into view once,
// and exposes window.initReveal(root) so pages that inject cards after a
// fetch (blog list, home preview) can re-scan for newly added elements.
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let io;

  function ensureObserver() {
    if (io || reduceMotion || !("IntersectionObserver" in window)) return;
    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
  }

  function initReveal(root) {
    root = root || document;
    const els = root.querySelectorAll(".reveal:not(.reveal-bound)");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("visible", "reveal-bound"));
      return;
    }
    ensureObserver();
    els.forEach((el) => {
      el.classList.add("reveal-bound");
      io.observe(el);
    });
  }

  window.initReveal = initReveal;
  document.addEventListener("DOMContentLoaded", () => initReveal());
})();
