// Mobile nav toggle
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => links.classList.toggle("open"));
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => links.classList.remove("open"))
    );
  }

  // Hero typewriter — single orchestrated moment, runs once
  const tw = document.getElementById("typewriter");
  if (tw && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const text = tw.dataset.text || "tanjil mia";
    tw.textContent = "";
    let i = 0;
    const type = () => {
      if (i <= text.length) {
        tw.textContent = text.slice(0, i);
        i++;
        setTimeout(type, 70);
      }
    };
    setTimeout(type, 500);
  } else if (tw) {
    tw.textContent = tw.dataset.text || "tanjil mia";
  }
});
