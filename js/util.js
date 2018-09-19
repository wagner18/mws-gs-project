// Utility functions


export default class Util {

	/**
	*
	*/
	static snackbar(el, message, color = '#D9001F') {

		// TODO
		// Create a element if the selected element does not existe
		// var newDiv = document.createElement("div");

		if(!el) {
			console.log(new Error('Snackbar element not valid'));
			return false;
		}

		el.innerHTML = message;
		el.setAttribute('class', 'showSnackbar');
		el.style.background = color;
		setTimeout(() => { el.removeAttribute('class') }, 5500);
	}


	/**
	*
	*/
	static imgLazyLoader(target) {
		const imgs = document.querySelectorAll(target);

		if(!window.IntersectionObserver) {
			console.log('No lazy loading for you :(');
			imgs.forEach(img => Util.preloadImage(img));
		} else {

			const onIntersection = function (entries, obsr) {
				entries.forEach(entry => {
					if (entry.intersectionRatio > 0) {
						obsr.unobserve(entry.target);
						requestAnimationFrame(() => Util.preloadImage(entry.target));
					}
			  });
			};

			const obsrOptions = {
				rootMargin: '30px 0px',
	  		threshold: [0.1]
			}

			const observer = new IntersectionObserver(onIntersection, obsrOptions);
			imgs.forEach(target => observer.observe(target));
		}
	}

	/**
	*
	*/
	static preloadImage(target) {
		if(!target.nodeName === 'IMG') return false;
		target.setAttribute('src', target.getAttribute('data-src'));
		console.log('Image loaded: ',target.getAttribute('data-src'));
		return target;
	}


	/**
	 * Restaurant page URL.
	 */
	static urlForRestaurant(restaurant) {
		return (`./restaurant.html?id=${restaurant.id}`);
	}
	
	/**
	 * Restaurant image URL.
	 */
	static imageUrlForRestaurant(restaurant, size) {
		let img = restaurant.photograph;
		return img ? (`/img/${img}-${size}.jpg`) : '/img/restaurant_placeholder.svg';
	}


}
