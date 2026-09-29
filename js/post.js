function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

// Very small, safe markdown-lite: escapes HTML first, then applies
// a handful of formatting rules on top of the escaped text.
function renderContent(raw) {
  const escaped = escapeHtml(raw || "");
  const lines = escaped.split(/\r?\n/);
  const html = [];
  let para = [];

  const flush = () => {
    if (para.length) {
      html.push("<p>" + para.join(" ") + "</p>");
      para = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { flush(); continue; }
    if (/^## /.test(trimmed)) { flush(); html.push("<h3>" + trimmed.slice(3) + "</h3>"); continue; }
    if (/^# /.test(trimmed)) { flush(); html.push("<h2>" + trimmed.slice(2) + "</h2>"); continue; }
    let t = trimmed
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    para.push(t);
  }
  flush();
  return html.join("\n");
}

const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

if (!slug) {
  document.getElementById("post-title").textContent = "Post not found";
  document.getElementById("post-body").innerHTML = "<p>No post was specified.</p>";
} else {
  fetch(`posts/${encodeURIComponent(slug)}.json?_=` + Date.now())
    .then((r) => {
      if (!r.ok) throw new Error("not found");
      return r.json();
    })
    .then((post) => {
      const url = "https://tanjilmiabd.github.io/post.html?slug=" + encodeURIComponent(slug);
      document.title = post.title + " — Tanjil Mia";
      document.getElementById("page-title").textContent = post.title + " — Tanjil Mia";
      document.getElementById("page-desc").setAttribute("content", post.excerpt || post.title);
      document.getElementById("page-canonical").setAttribute("href", url);
      document.getElementById("og-title").setAttribute("content", post.title + " — Tanjil Mia");
      document.getElementById("og-desc").setAttribute("content", post.excerpt || post.title);
      document.getElementById("og-url").setAttribute("content", url);
      document.getElementById("post-date").textContent = post.date;
      document.getElementById("post-title").textContent = post.title;
      document.getElementById("post-body").innerHTML = renderContent(post.content);

      const ld = document.createElement("script");
      ld.type = "application/ld+json";
      ld.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        datePublished: post.date,
        dateModified: post.date,
        description: post.excerpt || post.title,
        url,
        image: "https://tanjilmiabd.github.io/assets/og-cover.jpg",
        keywords: (post.tags || []).join(", "),
        author: { "@type": "Person", name: "Md. Tanjil Mia", url: "https://tanjilmiabd.github.io/" },
        publisher: { "@type": "Person", name: "Md. Tanjil Mia" },
      });
      document.head.appendChild(ld);
    })
    .catch(() => {
      document.getElementById("post-title").textContent = "Post not found";
      document.getElementById("post-body").innerHTML = "<p>This post doesn't exist or hasn't been published yet.</p>";
    });
}
