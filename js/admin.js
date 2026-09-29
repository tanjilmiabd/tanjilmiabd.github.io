// ---------- helpers ----------

function b64EncodeUnicode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
function b64DecodeUnicode(str) {
  return decodeURIComponent(escape(atob(str)));
}
function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function notice(el, type, msg) {
  el.innerHTML = `<div class="notice ${type}">${msg}</div>`;
}
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

// ---------- config ----------

const CFG_KEY = "tanjil_admin_cfg";

function getConfig() {
  try { return JSON.parse(localStorage.getItem(CFG_KEY)) || {}; }
  catch { return {}; }
}
function setConfig(cfg) {
  localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
}

const ownerEl = document.getElementById("cfg-owner");
const repoEl = document.getElementById("cfg-repo");
const branchEl = document.getElementById("cfg-branch");
const tokenEl = document.getElementById("cfg-token");
const settingsNotice = document.getElementById("settings-notice");

(function initConfig() {
  const cfg = getConfig();
  ownerEl.value = cfg.owner || "tanjilmiabd";
  repoEl.value = cfg.repo || "tanjilmiabd.github.io";
  branchEl.value = cfg.branch || "main";
  tokenEl.value = cfg.token || "";
})();

document.getElementById("save-settings").addEventListener("click", () => {
  setConfig({
    owner: ownerEl.value.trim(),
    repo: repoEl.value.trim(),
    branch: branchEl.value.trim() || "main",
    token: tokenEl.value.trim(),
  });
  notice(settingsNotice, "ok", "Saved to this browser.");
  loadExistingPosts();
});

document.getElementById("clear-settings").addEventListener("click", () => {
  localStorage.removeItem(CFG_KEY);
  tokenEl.value = "";
  notice(settingsNotice, "ok", "Cleared. The token has been removed from this browser.");
});

// ---------- GitHub API ----------

function ghHeaders() {
  const cfg = getConfig();
  return {
    Authorization: "Bearer " + (tokenEl.value.trim() || cfg.token || ""),
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function repoBase() {
  const owner = ownerEl.value.trim();
  const repo = repoEl.value.trim();
  return `https://api.github.com/repos/${owner}/${repo}/contents/`;
}

async function ghGetFile(path) {
  const branch = branchEl.value.trim() || "main";
  const res = await fetch(repoBase() + path + "?ref=" + encodeURIComponent(branch), {
    headers: ghHeaders(),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub read failed (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return { sha: data.sha, content: b64DecodeUnicode(data.content.replace(/\n/g, "")) };
}

async function ghPutFile(path, content, message, sha) {
  const branch = branchEl.value.trim() || "main";
  const body = {
    message,
    content: b64EncodeUnicode(content),
    branch,
  };
  if (sha) body.sha = sha;
  const res = await fetch(repoBase() + path, {
    method: "PUT",
    headers: { ...ghHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub write failed (${res.status}): ${await res.text()}`);
  return res.json();
}

async function ghDeleteFile(path, message, sha) {
  const branch = branchEl.value.trim() || "main";
  const res = await fetch(repoBase() + path, {
    method: "DELETE",
    headers: { ...ghHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ message, sha, branch }),
  });
  if (!res.ok) throw new Error(`GitHub delete failed (${res.status}): ${await res.text()}`);
}

// ---------- new post form ----------

const titleEl = document.getElementById("p-title");
const slugEl = document.getElementById("p-slug");
const dateEl = document.getElementById("p-date");
const tagsEl = document.getElementById("p-tags");
const excerptEl = document.getElementById("p-excerpt");
const contentEl = document.getElementById("p-content");
const publishNotice = document.getElementById("publish-notice");

dateEl.value = todayISO();

let slugTouched = false;
slugEl.addEventListener("input", () => { slugTouched = true; });
titleEl.addEventListener("input", () => {
  if (!slugTouched) slugEl.value = slugify(titleEl.value);
});

document.getElementById("clear-form").addEventListener("click", () => {
  titleEl.value = ""; slugEl.value = ""; tagsEl.value = "";
  excerptEl.value = ""; contentEl.value = ""; dateEl.value = todayISO();
  slugTouched = false;
  publishNotice.innerHTML = "";
});

document.getElementById("publish-btn").addEventListener("click", async () => {
  const title = titleEl.value.trim();
  const slug = (slugEl.value.trim() || slugify(title));
  if (!title || !slug) {
    notice(publishNotice, "err", "Please add a title.");
    return;
  }
  if (!ownerEl.value.trim() || !repoEl.value.trim() || !(tokenEl.value.trim() || getConfig().token)) {
    notice(publishNotice, "err", "Fill in and save your repository settings and token first.");
    return;
  }

  const post = {
    slug,
    title,
    date: dateEl.value || todayISO(),
    tags: tagsEl.value.split(",").map((t) => t.trim()).filter(Boolean),
    excerpt: excerptEl.value.trim(),
    content: contentEl.value,
  };

  notice(publishNotice, "warn", "Publishing…");
  try {
    // 1. write the post file (update if it already exists)
    const existing = await ghGetFile(`posts/${slug}.json`);
    await ghPutFile(
      `posts/${slug}.json`,
      JSON.stringify(post, null, 2),
      (existing ? "Update post: " : "Add post: ") + title,
      existing ? existing.sha : undefined
    );

    // 2. update the index
    const indexFile = await ghGetFile("posts/index.json");
    let list = [];
    if (indexFile) {
      try { list = JSON.parse(indexFile.content); } catch { list = []; }
    }
    list = list.filter((p) => p.slug !== slug);
    list.unshift({ slug, title, date: post.date, tags: post.tags, excerpt: post.excerpt });
    await ghPutFile(
      "posts/index.json",
      JSON.stringify(list, null, 2),
      "Update post index: " + title,
      indexFile ? indexFile.sha : undefined
    );

    notice(publishNotice, "ok", `Published. It will appear on the blog page within a minute, at post.html?slug=${slug}`);
    loadExistingPosts();
  } catch (err) {
    notice(publishNotice, "err", "Something went wrong: " + err.message);
  }
});

// ---------- existing posts list ----------

async function loadExistingPosts() {
  const wrap = document.getElementById("existing-posts");
  try {
    const file = await ghGetFile("posts/index.json");
    const list = file ? JSON.parse(file.content) : [];
    if (!list.length) {
      wrap.innerHTML = "<p>No posts published yet.</p>";
      return;
    }
    wrap.innerHTML = list
      .map(
        (p) => `
      <div class="existing-post-row" data-slug="${escapeHtml(p.slug)}">
        <span>${escapeHtml(p.date)} — ${escapeHtml(p.title)}</span>
        <button data-slug="${escapeHtml(p.slug)}">Delete</button>
      </div>`
      )
      .join("");
    wrap.querySelectorAll("button[data-slug]").forEach((btn) => {
      btn.addEventListener("click", () => deletePost(btn.dataset.slug));
    });
  } catch (err) {
    wrap.innerHTML = `<p>Couldn't load posts (${escapeHtml(err.message)}). Save your settings above with a valid token.</p>`;
  }
}

async function deletePost(slug) {
  if (!confirm(`Delete "${slug}"? This can't be undone.`)) return;
  try {
    const postFile = await ghGetFile(`posts/${slug}.json`);
    if (postFile) await ghDeleteFile(`posts/${slug}.json`, "Delete post: " + slug, postFile.sha);

    const indexFile = await ghGetFile("posts/index.json");
    let list = indexFile ? JSON.parse(indexFile.content) : [];
    list = list.filter((p) => p.slug !== slug);
    await ghPutFile("posts/index.json", JSON.stringify(list, null, 2), "Remove post from index: " + slug, indexFile.sha);

    loadExistingPosts();
  } catch (err) {
    alert("Delete failed: " + err.message);
  }
}

loadExistingPosts();
