function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

fetch("posts/index.json?_=" + Date.now())
  .then((r) => r.json())
  .then((posts) => {
    const el = document.getElementById("post-list");
    if (!posts.length) {
      el.innerHTML = '<div class="empty-state">No posts yet — the first one is on its way.</div>';
      return;
    }
    posts.sort((a, b) => (a.date < b.date ? 1 : -1));
    el.innerHTML = posts.map((p) => `
      <article class="post-card">
        <div class="pdate">${escapeHtml(p.date)}</div>
        <div>
          <h3><a href="post.html?slug=${encodeURIComponent(p.slug)}">${escapeHtml(p.title)}</a></h3>
          <p>${escapeHtml(p.excerpt || "")}</p>
          ${p.tags && p.tags.length ? `<div class="tags">${p.tags.map((t) => `<span>${escapeHtml(t)}</span>`).join("")}</div>` : ""}
        </div>
      </article>`).join("");
  })
  .catch(() => {
    document.getElementById("post-list").innerHTML =
      '<div class="empty-state">No posts yet — the first one is on its way.</div>';
  });
