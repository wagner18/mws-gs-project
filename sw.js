// const CACHE_KEY = 'rreview-cache-v1';

// self.addEventListener('install', (event) => {

// 	const urlsToCasche = [
// 		'./',
// 		// 'js/restaurant_info.js'
// 		// 'restaurant.html',
// 		'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff',
// 		'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff'
// 	];

// 	event.waitUntil(
// 		caches.open(CACHE_KEY).then((cache) => cache.addAll(urlsToCasche)).catch((err) => {
// 			console.log('Caching failed - ', err.message);
// 		})
// 	);
// });


// self.addEventListener('fetch', (event) => {

// 	event.respondWith(
//     caches.match(event.request).then(response => {

//       if (response) return response;

//       const fetchRequest = event.request.clone();

//       return fetch(fetchRequest).then(response => {

//         if(!response || response.status !== 200 || response.type !== 'basic') return response;

//         const responseClone = response.clone();
//         caches.open(CACHE_KEY).then(cache => {
//           cache.put(event.request, responseClone);
//         });

//         return response;
//       });
//     })
//   );

// });

