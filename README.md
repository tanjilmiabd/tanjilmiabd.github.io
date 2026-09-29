# tanjilmiabd.github.io

Personal portfolio + blog for Tanjil Mia, built as a plain HTML/CSS/JS site so it
can be hosted for free on GitHub Pages, with an admin page that publishes new
blog posts directly to this repo — no server, no database.

## 1. Put it on GitHub

1. Create a new GitHub account/repo named exactly **`tanjilmiabd.github.io`**
   (username and repo name must match for the short URL to work).
2. Upload every file in this folder to the repo, keeping the same structure
   (`index.html` at the root, `css/`, `js/`, `posts/` as folders).
3. In the repo: **Settings → Pages → Source → Deploy from branch → `main` / `root`**.
4. Wait a minute, then visit `https://tanjilmiabd.github.io/`.

## 2. Update your real links

Open `contact.html` and swap the `#` placeholders for your real LinkedIn,
Facebook, GitHub and X profile links (keep the same "Tanjil Mia" name and
photo on every one of them — that consistency is what helps Google connect
them as one person).

## 3. Publish blog posts from `admin.html`

The blog has no database. Instead, `admin.html` uses the GitHub API to write
a JSON file straight into the `posts/` folder of this repo whenever you hit
**Publish**. GitHub Pages then rebuilds automatically, usually within a minute.

To use it:

1. On GitHub, go to **Settings → Developer settings → Personal access tokens
   → Fine-grained tokens → Generate new token**.
2. Give it a name, set **Repository access** to *only this repository*
   (`tanjilmiabd.github.io`), and under **Permissions** set
   **Contents: Read and write**. Leave everything else as "No access."
3. Copy the generated token — GitHub only shows it once.
4. Open `https://tanjilmiabd.github.io/admin.html`, fill in your GitHub
   username, repo name, branch (`main`), and paste the token, then click
   **Save settings to this browser**.
5. Fill in the post form and click **Publish post**.

**Security note:** the token is stored only in that browser's local storage
and is only ever sent to `api.github.com`. Don't use the admin page on a
public or shared computer, and don't use a full-account token — a
fine-grained token scoped to just this one repo's contents is the safest
option. `admin.html` is marked `noindex` so search engines won't list it,
but the page itself isn't password protected, so treat the URL as
semi-private and only you should have the token to actually publish.

## SEO checklist — what's already in place

- Unique `<title>` and meta description per page, plus `og:` and `twitter:` tags
  so links look good when shared on WhatsApp, Facebook, LinkedIn, or X.
- `Person` + `WebSite` + `ProfilePage` structured data (JSON-LD) on the
  homepage, `BreadcrumbList` on inner pages, and `BlogPosting` structured
  data generated automatically for every blog post.
- Your photo (`assets/tanjil-mia.jpg`) is referenced as the `Person` image in
  the schema, used in the hero, and used to build the social share image
  (`assets/og-cover.jpg`) and favicons.
- `robots.txt` + `sitemap.xml` (with an image entry) so search engines can
  crawl and index the site correctly, while `admin.html` stays out of the
  index.
- Semantic HTML (one `<h1>` per page, proper heading order), descriptive
  `alt` text on images, and `width`/`height` set on images to avoid layout
  shift.

**One thing to finish yourself:** open `index.html` and fill in the empty
`"sameAs": []` array in the Person schema with your real profile URLs
(LinkedIn, Facebook, GitHub, X) once they're live — that's what tells Google
these are all the same person, and it's one of the biggest levers for
ranking on your own name.

## File map

```
index.html         Home
about.html          About / education / languages
experience.html     Work history timeline
skills.html         Skills grouped by category
blog.html           Blog list (reads posts/index.json)
post.html           Single post (reads posts/<slug>.json via ?slug=)
contact.html        Contact details + social links
admin.html          Publish/delete posts via the GitHub API
css/style.css       All styling
js/main.js          Nav + hero animation
js/blog.js          Blog list rendering
js/post.js          Single post rendering + tiny markdown-lite parser
js/admin.js         GitHub API read/write/delete logic
posts/index.json    List of published posts (auto-managed by admin.html)
posts/<slug>.json   One file per post (auto-created by admin.html)
assets/             Your photo, favicons, and the social-share image
site.webmanifest    Icon metadata for browsers/PWA
robots.txt, sitemap.xml   Basic SEO plumbing
```

## Later: a custom domain

If you buy a domain, add a `CNAME` file at the repo root containing just the
domain (e.g. `tanjilmia.com`), then point the domain's DNS at GitHub Pages
per GitHub's custom-domain docs. Update the `og:url` / `canonical` /
`sitemap.xml` URLs in the HTML files to match.
