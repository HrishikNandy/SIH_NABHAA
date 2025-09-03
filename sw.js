/* ===== Nabha Digital Shiksha — Service Worker ===== */
/* Version: bump this (v1, v2, v3...) whenever you change PRECACHE_URLS */
const CACHE_NAME = "nabha-shiksha-v1";

/* List EVERYTHING you want guaranteed offline */
const PRECACHE_URLS = [
  // --- PAGES ---
  "index-new.html",
  "about-new.html",
  "courses-new.html",
  "teacher-new.html",   // teacher dashboard
  "quiz-new.html",      // student quiz player
  "offline.html",

  // --- ASSETS ---
  "style-new.css",
  "script-new.js",
  "teacher-new.js",

  // PWA manifest + icons
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",

  // --- SYLLABUS PDFs (local, offline-ready) ---
  "syllabus/Basic_Computer_Skills.pdf",
  "syllabus/Safe_Internet_Use.pdf",
  "syllabus/MS_Office_Basics.pdf",
  "syllabus/Punjabi_Language.pdf",
  "syllabus/Hindi_Language.pdf",
  "syllabus/English_Language_Skills.pdf",
  "syllabus/Interactive_Mathematics.pdf",
  "syllabus/Science_Technology.pdf",
  "syllabus/Environmental_Studies.pdf",
  "syllabus/General_Knowledge.pdf",
  "syllabus/Financial_Literacy.pdf",
  "syllabus/Digital_Career_Skills.pdf",
  "syllabus/Teacher_Support.pdf"
  // If you move images locally (e.g., assets/img/*), add them here too.
];

/* Install: pre-cache all core assets + PDFs */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting(); // activate new SW immediately
});

/* Activate: clean old caches if version changed */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null)))
    )
  );
  self.clients.claim();
});

/* Fetch strategy:
   - For navigations/HTML → network-first (updates), then cache, then offline page.
   - For assets (CSS/JS/PDF/images) → cache-first, then network.
*/
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin files (your site’s own files)
  if (url.origin !== self.location.origin) return;

  // HTML pages (navigations)
  const isHTML =
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html");

  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // update cache with fresh copy
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() =>
          // offline fallback: cached page, else offline.html
          caches.match(req).then((cached) => cached || caches.match("offline.html"))
        )
    );
    return;
  }

  // Non-HTML (CSS/JS/PDF/images): cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => {
          // optional: return a tiny fallback for images, otherwise nothing
          return undefined;
        });
    })
  );
});
