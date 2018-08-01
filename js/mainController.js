import DBHelper from './dbhelper';
import Util from './util';


export default function MainController(container) {

	// let restaurants,neighborhoods, cuisines;

	this.markers = [];
	this._container = container;
	this._registerServiceWorker();

	this.db = new DBHelper();
}

MainController.prototype._registerServiceWorker = function() {

	if (navigator.serviceWorker) {

		if (navigator.serviceWorker.controller) return;

		navigator.serviceWorker.register('/sw.js', {scope: ''}).then((swReg) => {
			console.log('\nServiceWorker successfully registred. Scope\n', swReg.scope);
		}).catch((err) => {
			console.log('\nServiceWorker swReg failed :(\n', err.message);
		});

	  // check connetion every 5 seconds
	  const checkConnection = setTimeout(() => {
	    if(!navigator.onLine) handleError(new Error('No Connection'));
	  }, 5000);
	}
};


MainController.prototype.fetchRestaurants = function(cuisine, neighborhood) {
	this.db.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
		if (error) { // Got an error!
			handleError(error);
		} else {
			this.resetRestaurants(restaurants);
			this.fillRestaurantsHTML();
			return restaurants;
		}
	});
}


/**
 * Fetch all neighborhoods and set their HTML.
 */
MainController.prototype.fetchNeighborhoods = function() {
	this.db.fetchNeighborhoods((error, neighborhoods) => {
		if (error) { // Got an error
			handleError(error);
		} else {
			this.neighborhoods = neighborhoods;
			this.fillNeighborhoodsHTML();
		}
	});
};


/**
 * Set neighborhoods HTML.
 */
MainController.prototype.fillNeighborhoodsHTML = function(neighborhoods = this.neighborhoods) {
	const select = document.getElementById('neighborhoods-select');
	neighborhoods.forEach(neighborhood => {
		const option = document.createElement('option');
		option.innerHTML = neighborhood;
		option.value = neighborhood;
		select.append(option);
	});
};

/**
 * Fetch all cuisines and set their HTML.
 */
MainController.prototype.fetchCuisines = function() {
	this.db.fetchCuisines((error, cuisines) => {
		if (error) { // Got an error!
			handleError(error);
		} else {
			this.cuisines = cuisines;
			this.fillCuisinesHTML();
		}
	});
};

/**
 * Set cuisines HTML.
 */
MainController.prototype.fillCuisinesHTML = function(cuisines = this.cuisines) {
	const select = document.getElementById('cuisines-select');
	cuisines.forEach(cuisine => {
		const option = document.createElement('option');
		option.innerHTML = cuisine;
		option.value = cuisine;
		select.append(option);
	});
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
MainController.prototype.resetRestaurants = function(restaurants) {
	// Remove all restaurants
	this.restaurants = [];
	const ul = document.getElementById('restaurants-list');
	ul.innerHTML = '';

	// Remove all map markers
	this.markers.forEach(m => m.setMap(null));
	this.markers = [];
	this.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
MainController.prototype.fillRestaurantsHTML = function(restaurants = this.restaurants) {
	const ul = document.getElementById('restaurants-list');
	restaurants.forEach(restaurant => {
		ul.append(this.createRestaurantHTML(restaurant));
	});
	this.addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
MainController.prototype.createRestaurantHTML = function(restaurant) {

	const li = document.createElement('li');
	li.setAttribute('aria-label', `${restaurant.name} - ${restaurant.cuisine_type} - ${restaurant.address}`);

	const image = document.createElement('img');
	image.className = 'restaurant-img';
	image.src = this.db.imageUrlForRestaurant(restaurant, 600);
	image.alt = `Photo of ${restaurant.name} restaurant`;
	image.srcset = `${this.db.imageUrlForRestaurant(restaurant, 1200)} 1200w, ${this.db.imageUrlForRestaurant(restaurant, 600)} 600w`;

	li.append(image);

	const name = document.createElement('h2');
	name.innerHTML = restaurant.name;
	li.append(name);

	const neighborhood = document.createElement('p');
	neighborhood.innerHTML = restaurant.neighborhood;
	li.append(neighborhood);

	const address = document.createElement('p');
	address.innerHTML = restaurant.address;
	li.append(address);

	const more = document.createElement('a');
	more.innerHTML = 'View Details';
	more.href = this.db.urlForRestaurant(restaurant);
	li.append(more);

	// const hr = document.createElement('hr');
	// hr.className = 'list-hr';
	// li.append(hr);

	return li;
};

/**
 * Add markers for current restaurants to the map.
 */
MainController.prototype.addMarkersToMap = function(restaurants = this.restaurants) {
	restaurants.forEach(restaurant => {
		// Add marker to the map
		const marker = this.db.mapMarkerForRestaurant(restaurant, self.map);
		google.maps.event.addListener(marker, 'click', () => {
			window.location.href = marker.url;
		});
		this.markers.push(marker);
	});
};

function handleError(error) {
	Util.snackbar(document.querySelector('#snackbar'), error.message);
}
