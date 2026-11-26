const CACHE_NAME = 'food-diary-shell-v1';
const APP_ROOT = '/food-diary/';

// Removes cached build files (/assets/...) that the current page no longer uses,
// so old app versions do not pile up in storage after each update.
async function pruneOldAssets(cache, html) {
  const used = new Set(Array.from(html.matchAll(/assets\/[^"'\s)]+/g), (match) => match[0]));
  const keys = await cache.keys();
  await Promise.all(keys.map((request) => {
    const path = new URL(request.url).pathname;
    const index = path.indexOf('assets/');
    if (index === -1) return undefined;
    return used.has(path.slice(index)) ? undefined : cache.delete(request);
  }));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(APP_ROOT))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          const forPruning = response.clone();
          caches.open(CACHE_NAME).then(async (cache) => {
            await cache.put(APP_ROOT, copy);
            await pruneOldAssets(cache, await forPruning.text());
          });
        }
        return response;
      }).catch(() => caches.match(APP_ROOT))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
