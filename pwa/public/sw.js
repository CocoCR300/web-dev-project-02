const CACHE_NAME = "cachedex-v1";
const CACHE_PATHS = [
    "/",
    "index.html",
	"manifest.json",
	"images/icon.png",
	"images/maskable_icon_x48.png",
	"images/maskable_icon_x96.png",
	"images/maskable_icon_x128.png",
	"images/maskable_icon_x192.png",
    "assets/index-Bw7BbzrN.js",
    "assets/index-VBRRgj-L.css",
];

self.addEventListener("install", event => {
	self.skipWaiting();

    const promise = caches
        .open(CACHE_NAME)
        .then(cache => {
            console.log("Service worker activated")
            return cache.addAll(CACHE_PATHS)
        })

    event.waitUntil(promise)
})

self.addEventListener("fetch", event => {
    const promise = caches
        .match(event.request)
        .then(async response => {
            const url = event.request.url
            console.log(`Resource at ${url} requested`)
            if (response) {
                console.log("Cache hit!")
                return response
            }

			console.log("Cache miss :(")
			const externalResponse = await fetch(event.request)

            return externalResponse;
		})

    event.respondWith(promise)
})

self.addEventListener("activate", (event) => {
    const promise = caches
        .keys()
        .then(cacheNames => {
            const promises = cacheNames.map(name => {
                if (name !== CACHE_NAME) {
                    console.log("Deleting old cache: ", name)
                    return caches.delete(name);
                }

                return Promise.resolve(false)
            })

            return Promise.all(promises);
        })

    event.waitUntil(promise)
})

