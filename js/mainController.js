import Util from './util';


export default function MainController(container) {
	this.markers = [];
	this._container = container;
	this._registerServiceWorker();

	this.dataWorker = new Worker('./js/dataWorker.js');

	if (navigator) checkConnection();
}

MainController.prototype._registerServiceWorker = function() {
	if (navigator.serviceWorker) {
		if (navigator.serviceWorker.controller) return;

		navigator.serviceWorker.register('/sw.js', {scope: '/'}).then((swReg) => {
			console.log('\nServiceWorker successfully registred. Scope\n', swReg.scope);
		}).catch((err) => {
			console.log('\nServiceWorker swReg failed :(\n', err.message);
		});

	}
};


MainController.prototype.postMessage = function({ action, input }) {
	this.dataWorker.postMessage({ action, input });
	this.dataWorker.onmessage = (event) => {

		if(!event.data) throw new Error(`There is no data: ${event}`);

		if(event.data.action === 'fetchRestaurantByCuisineAndNeighborhood') {
			// this.resetRestaurants();
			requestAnimationFrame(() => this.fillRestaurantsHTML(event.data.result));
		}

		if(event.data.action === 'fetchNeighborhoods') {
			requestAnimationFrame(() => this.fillNeighborhoodsHTML(event.data.result));
		}

		if(event.data.action === 'fetchCuisines') {
			requestAnimationFrame(() => this.fillCuisinesHTML(event.data.result));
		}

		if(event.data.action === 'toggleFavorite') {
			const restaurant = event.data.result;
			const el = document.querySelector(`#favorite-${restaurant.id}`);
			const btnEl = document.querySelector(`#favorite-button-${restaurant.id}`);
			if(restaurant.is_favorite === "true") {
				el.classList.remove('hidden');
				el.classList.add('visible');
				btnEl.innerHTML = 'Remove from favorites';
			} else {
				el.classList.remove('visible');
				el.classList.add('hidden');
				btnEl.innerHTML = 'Add to favorites';
			}
		}
	};
}


MainController.prototype.fetchRestaurants = function(cuisine, neighborhood) {
	this.postMessage({
		action: 'fetchRestaurantByCuisineAndNeighborhood',
		input: {
			cuisine,
			neighborhood
		}
	});
}


/**
 * Fetch all neighborhoods and set their HTML.
 */
MainController.prototype.fetchNeighborhoods = function() {
	this.postMessage({
		action: 'fetchNeighborhoods',
		input: null
	});
};

/**
 * Fetch all cuisines and set their HTML.
 */
MainController.prototype.fetchCuisines = function() {
	this.postMessage({
		action: 'fetchCuisines',
		input: null
	});
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
MainController.prototype.resetRestaurants = function(restaurants) {
	// Remove all restaurants
	const ul = document.getElementById('restaurants-list');
	ul.innerHTML = '';

	// Remove all map markers
	this.markers.forEach(m => m.setMap(null));
	this.markers = [];
};


/**
 * Set neighborhoods HTML.
 */
MainController.prototype.fillNeighborhoodsHTML = function(neighborhoods) {
	const select = document.getElementById('neighborhoods-select');
	neighborhoods.forEach(neighborhood => {
		const option = document.createElement('option');
		option.innerHTML = neighborhood;
		option.value = neighborhood;
		select.append(option);
	});
};


/**
 * Set cuisines HTML.
 */
MainController.prototype.fillCuisinesHTML = function(cuisines) {
	const select = document.getElementById('cuisines-select');
	cuisines.forEach(cuisine => {
		const option = document.createElement('option');
		option.innerHTML = cuisine;
		option.value = cuisine;
		select.append(option);
	});
};


/**
 * Create all restaurants HTML and add them to the webpage.
 */
MainController.prototype.fillRestaurantsHTML = function(restaurants) {
	const animate = () => {
		this.resetRestaurants();
		const ul = document.getElementById('restaurants-list');
		restaurants.forEach(restaurant => {
			ul.append(this.createRestaurantHTML(restaurant));
		});

		Util.imgLazyLoader('.img-lazy-load');
		if(self.initMap) this.addMarkersToMap(restaurants);
	}

	requestAnimationFrame(animate);
};

/**
 * Create restaurant HTML.
 */
MainController.prototype.createRestaurantHTML = function(restaurant) {

	const li = document.createElement('li');
	li.setAttribute('id', `restaurant-${restaurant.id}`);
	li.setAttribute('aria-label', `${restaurant.name} - ${restaurant.cuisine_type} - ${restaurant.address}`);

	const image = document.createElement('img');
	image.className = 'img-lazy-load restaurant-img';
	image.setAttribute('data-src', Util.imageUrlForRestaurant(restaurant, 600));
	image.alt = `${restaurant.name} - ${restaurant.cuisine_type} Cuisine`;

	li.append(image);

	const isFavorite = document.createElement('img');
	isFavorite.src = '/img/heart.svg';
	isFavorite.setAttribute('id', `favorite-${restaurant.id}`);
	isFavorite.classList.add('favorite-icon', 'hidden');
	if(restaurant.is_favorite === "true") {
		isFavorite.classList.remove('hidden');
		isFavorite.classList.add('visible');
	}
	li.append(isFavorite);

	const name = document.createElement('h2');
	name.innerHTML = restaurant.name;
	li.append(name);

	const cuisine = document.createElement('p');
	cuisine.className = 'cuisine-type';
	cuisine.innerHTML = restaurant.cuisine_type;
	li.append(cuisine);

	const neighborhood = document.createElement('p');
	neighborhood.innerHTML = restaurant.neighborhood;
	li.append(neighborhood);

	const address = document.createElement('p');
	address.innerHTML = restaurant.address;
	li.append(address);


	const more = document.createElement('a');
	more.innerHTML = 'View Details';
	more.classList.add('item-button');
	more.setAttribute('role', 'button');
	more.href = Util.urlForRestaurant(restaurant);
	li.append(more);

	const favorite = document.createElement('button');
	favorite.setAttribute('id', `favorite-button-${restaurant.id}`);
	favorite.innerHTML = restaurant.is_favorite === "true" ? 'Remove from favorites' : 'Add to favorites';
	favorite.classList.add('item-button');
	favorite.addEventListener('click', () => this.toggleFavorite(restaurant));
	li.append(favorite);

	return li;
};

/**
 * Add markers for current restaurants to the map.
 */
MainController.prototype.addMarkersToMap = function(restaurants) {
	if(!google) return;
	restaurants.forEach(restaurant => {
		const marker = new google.maps.Marker({
			position: restaurant.latlng,
			title: restaurant.name,
			url: `./restaurant.html?id=${restaurant.id}`,
			map: self.map,
			animation: google.maps.Animation.DROP}
		);

		google.maps.event.addListener(marker, 'click', () => {
			window.location.href = marker.url;
		});
		this.markers.push(marker);
	});
};

MainController.prototype.toggleFavorite = function(restaurant) {
	this.postMessage({
		action: 'toggleFavorite',
		input: {id: restaurant.id}
	});
}


function checkConnection() {
	if(!navigator.onLine) handleError(new Error('No Connection'));
	// check connetion every 5 seconds
	const checkTimeout = setTimeout(() => {
		checkConnection();
  }, 10000);
}

function handleError(error) {
	requestAnimationFrame(() => Util.snackbar(document.querySelector('#snackbar'), error.message));
}
