const CACHE_VERSION = "v1";
const CACHE_NAME = `image-cache-${CACHE_VERSION}`;
const MAX_ITEMS = 300; // limit images in cache (like big CDNs)
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const API_CACHE = `api-cache-${CACHE_VERSION}`;
const STATIC_CACHE = `static-cache-${CACHE_VERSION}`;
// --- Utility: Limit cache size ---
async function limitCacheSize(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
        await cache.delete(keys[0]);
        await limitCacheSize(cacheName, maxItems);
    }
}

// --- Utility: Clean expired items ---
async function cleanOldEntries(cacheName) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    const now = Date.now();
    for (const key of keys) {
        const response = await cache.match(key);
        const dateHeader = response?.headers?.get("date");
        if (dateHeader) {
            const age = now - new Date(dateHeader).getTime();
            if (age > CACHE_TTL) await cache.delete(key);
        }
    }
}
// --- INSTALL STATIC FILES (optional offline shell) ---
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            return cache.addAll([
                "/", // homepage
                "/index.html",
                "/offline.html",
                "/styles.css",
                "/half_logo.svg",
                "/logo.svg",
            ]);
        })
    );
    self.skipWaiting(); // <— Add this
});

// --- Main fetch handler ---
self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);
    if (event.request.destination === "image") {
        event.respondWith(
            caches.open(CACHE_NAME).then(async (cache) => {
                const cached = await cache.match(event.request);

                if (cached) {
                    // Serve cached image immediately
                    // Then refresh in background (stale-while-revalidate)
                    event.waitUntil(
                        fetch(event.request)
                            .then((fresh) => {
                                cache.put(event.request, fresh.clone());
                                cleanOldEntries(CACHE_NAME);
                            })
                            .catch(() => { })
                    );
                    return cached;
                }

                // Not cached → fetch + store
                return fetch(event.request)
                    .then((response) => {
                        cache.put(event.request, response.clone());
                        limitCacheSize(CACHE_NAME, MAX_ITEMS);
                        return response;
                    })
                    .catch(() => new Response(null, { status: 404 }));
            })
        );
        return; // <— add this
    }

    // Handle API requests (GET only)
    if (url.pathname.startsWith("/service/") && event.request.method === "GET") {
        event.respondWith(
            caches.open(API_CACHE).then(async (cache) => {
                // ✅ If offline, instantly return cached API response if available
                if (!navigator.onLine) {
                    const cached = await cache.match(event.request);
                    if (cached) {
                        console.warn("Offline → serving cached API:", url.href);
                        return cached;
                    }
                    return new Response(
                        JSON.stringify({ error: "Offline mode: no cached data" }),
                        { headers: { "Content-Type": "application/json" }, status: 503 }
                    );
                }

                try {
                    // Online: Fetch from network and update cache
                    const response = await fetch(event.request);
                    cache.put(event.request, response.clone());
                    limitCacheSize(API_CACHE, MAX_ITEMS);
                    return response;
                } catch (error) {
                    // If fetch fails (network issue), fallback to cached
                    const cached = await cache.match(event.request);
                    if (cached) return cached;
                    return new Response(
                        JSON.stringify({ error: "Network error: no cached data" }),
                        { headers: { "Content-Type": "application/json" }, status: 503 }
                    );
                }
            })
        );
        return;
    }
    // Handle static files (HTML/CSS/JS)
    if (event.request.destination === "document" || event.request.mode === "navigate") {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, clone));
                    return response;
                })
                .catch(async () => {
                    const cache = await caches.open(STATIC_CACHE);
                    const cached = await cache.match(event.request);
                    return cached || (await cache.match("/offline.html"));
                })
        );
    }
});
// --- CLEAN OLD CACHES ---
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter(
                        (key) =>
                            (key.startsWith("image-cache-") ||
                                key.startsWith("api-cache-") ||
                                key.startsWith("static-cache-")) &&
                            ![CACHE_NAME, API_CACHE, STATIC_CACHE].includes(key)
                    )
                    .map((oldKey) => caches.delete(oldKey))
            )
        )
    );
    self.clients.claim(); // <— Add this
});