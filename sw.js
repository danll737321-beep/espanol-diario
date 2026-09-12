const CACHE_NAME = 'espanol-diario-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './vocab.json',
  './verbs.json',
  './grammar.json',
  './patterns.json',
  './pronunciation.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 策略：核心資產走「快取優先，背景更新」；其他請求走「網路優先，失敗才用快取」
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
        return networkResponse;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
