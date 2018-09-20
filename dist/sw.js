const CACHE_KEY = 'rreview-cache-v1';
const CACHE_IMGS = 'rreview-cache-imgs';
const allCaches = [ CACHE_KEY, CACHE_IMGS ];

self.addEventListener('install', (event) => {

	const toCache = [
		'/',
		'/manifest.json',
		'/index.html',
		'/restaurant.html',
		'/js/main.js',
		'/js/restaurant_info.js',
		'/js/dataWorker.js',
		'/js/storage.js',
		'/css/styles.css',
		'/css/small-screen.css',
		'/css/medium-screen.css',
		'/css/large-screen.css',
		'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff',
		// 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCAGI5xQ4PXUpi6HNhM7fwIVzSzTVVJz5E&libraries=places&callback=initMap',
	];

	event.waitUntil(
		caches.open(CACHE_KEY).then((cache) => cache.addAll(toCache)).catch((err) => {
			console.erro('Caching failed - ', err);
		})
	);
});


self.addEventListener('fetch', (event) => {

	const requestURL = new URL(event.request.url);

	if (requestURL.origin === location.origin) {
		if (requestURL.pathname.startsWith('/restaurant')) {
			event.respondWith(caches.match(requestURL.pathname).then((response) => response));
			return;
		}

		if (requestURL.pathname.startsWith('/img')) {
			event.respondWith(handleImages(event.request));
			return;
		}
	}

	event.respondWith(
		caches.match(event.request).then((response) => {
			return response || fetch(event.request);
		})
	);

});


function handleImages(request) {
	const cacheUrl = request.url;
	return caches.match(cacheUrl).then((response) => {

		const cacheImage = () => {
			return caches.open(CACHE_IMGS).then((cache) => {
				return fetch(request).then(updateResponse => {
					cache.put(cacheUrl, updateResponse.clone());
					return updateResponse;
				});
			});
		};

		return response || cacheImage();
	});
}
