document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  // ---------- mobile nav toggle ----------
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => links.classList.toggle("open"));
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => links.classList.remove("open"))
    );
  }

  // ---------- hero typewriter (single orchestrated moment) ----------
  const tw = document.getElementById("typewriter");
  if (tw) {
    const text = tw.dataset.text || "tanjil mia";
    if (reduceMotion) {
      tw.textContent = text;
    } else {
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
    }
  }

  // ---------- scroll progress bar ----------
  const bar = document.getElementById("scrollProgress");
  if (bar) {
    const updateBar = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const height = h.scrollHeight - h.clientHeight;
      bar.style.width = height > 0 ? (scrolled / height) * 100 + "%" : "0%";
    };
    document.addEventListener("scroll", updateBar, { passive: true });
    updateBar();
  }

  // ---------- animated counters (data-count="2+" → parses number + suffix) ----------
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    const animateCount = (el) => {
      const raw = el.dataset.count;
      const match = raw.match(/^(-?[\d.]+)(.*)$/);
      const target = match ? parseFloat(match[1]) : NaN;
      const suffix = el.dataset.suffix !== undefined ? el.dataset.suffix : match ? match[2] : "";
      if (reduceMotion || isNaN(target)) {
        el.textContent = raw;
        return;
      }
      const duration = 1100;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => cio.observe(el));
  }

  // ---------- cursor glow (desktop, fine pointer only) ----------
  const glow = document.getElementById("cursorGlow");
  if (glow && finePointer && !reduceMotion) {
    let tx = -400, ty = -400, cx = -400, cy = -400;
    window.addEventListener("mousemove", (e) => {
      tx = e.clientX;
      ty = e.clientY;
    });
    const loop = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      glow.style.left = cx + "px";
      glow.style.top = cy + "px";
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  } else if (glow) {
    glow.style.display = "none";
  }

  // ---------- tilt cards (event delegation so dynamically-added cards work too) ----------
  if (finePointer && !reduceMotion) {
    const strength = 8;
    document.addEventListener("mousemove", (e) => {
      const card = e.target.closest(".tilt-card");
      document.querySelectorAll(".tilt-card.tilting").forEach((c) => {
        if (c !== card) {
          c.style.transform = "";
          c.classList.remove("tilting");
        }
      });
      if (!card) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(700px) rotateY(${px * strength}deg) rotateX(${-py * strength}deg) translateY(-2px)`;
      card.classList.add("tilting");
    });
  }
});
