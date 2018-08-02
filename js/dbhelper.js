import IDB from 'idb';

/*
* Common database helper functions.
*/
export default class DBHelper {

	/**
	 * Database URL.
	 * Change this to restaurants.json file location on your server.
	 */
	get DATABASE_URL() {
		const port = 1337; // Change this to your server port
		return `http://localhost:${port}/restaurants`;
	}

	constructor(){
		this._IDB = this.openDatabase();
	}

	openDatabase() {
		if (!navigator.serviceWorker) return Promise.resolve();

		return IDB.open('rreview', 1, (upgradedDB) => {
			switch(upgradedDB.oldVersion){
			case 0: 
				const rreview = upgradedDB.createObjectStore('rreview', {keyPath: 'id'});
				const index = rreview.createIndex('by-id', 'id');
				console.log('Database and Index created');
			}
		});
	}

	cacheData(restaurants = []){
		 // add post the local DB
		this._IDB.then(db => {
			if (!db) return;

			const tx = db.transaction('rreview', 'readwrite');
			const readwriteStore = tx.objectStore('rreview');
			restaurants.forEach((restaurant) => readwriteStore.put(restaurant));
			tx.complete.then(() => console.log('post added to indexedDB'));
		});
	}

	/**
 * Load data from the client database.
 */
	loadCache() {
		return this._IDB.then(db => {
			if (!db) return;
			return db.transaction('rreview')
				.objectStore('rreview')
				.index('by-id')
				.getAll();
		}).then(rreview => rreview);
	};

	/** TODO
	* Implement Socket to load real times database loads
	*/

	/**
	 * Fetch all restaurants.
	 */
	fetchRestaurants(callback) {
		this.loadCache().then(data => {
			if(data.length > 0) {
				callback(null, data);
			} else {

				fetch(this.DATABASE_URL).then(response => {
					if (response.status === 200) {
						response.json().then(data => {
							this.cacheData(data);
							callback(null, data);
							console.log('data loaded from local storage!');
						});
					} else {
						callback(this.handleResponseError(response, 'api request'), null);
					}
				}).catch(error => callback(error, null));

			}
		});
	}
	/**
	 * Fetch a restaurant by its ID.
	 */
	fetchRestaurantById(id, callback) {
		// fetch all restaurants with proper error handling.
		this.fetchRestaurants((error, restaurants) => {

			if (error) {
				callback(error, null);
			} else {

				const restaurant = restaurants.find(r => r.id == id);

				if (restaurant) { // Got the restaurant
					callback(null, restaurant);
				} else { // Restaurant does not exist in the database
					callback('Restaurant does not exist', null);
				}
			}
		});
	}
	/**
	 * Fetch restaurants by a cuisine type with proper error handling.
	 */
	fetchRestaurantByCuisine(cuisine, callback) {
		// Fetch all restaurants	with proper error handling
		this.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Filter restaurants to have only given cuisine type
				const results = restaurants.filter(r => r.cuisine_type == cuisine);
				callback(null, results);
			}
		});
	}
	/**
	 * Fetch restaurants by a neighborhood with proper error handling.
	 */
	fetchRestaurantByNeighborhood(neighborhood, callback) {
		// Fetch all restaurants
		this.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Filter restaurants to have only given neighborhood
				const results = restaurants.filter(r => r.neighborhood == neighborhood);
				callback(null, results);
			}
		});
	}
	/**
	 * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
	 */
	fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
		// Fetch all restaurants
		this.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				let results = restaurants;
				if (cuisine != 'all') { // filter by cuisine
					results = results.filter(r => r.cuisine_type == cuisine);
				}
				if (neighborhood != 'all') { // filter by neighborhood
					results = results.filter(r => r.neighborhood == neighborhood);
				}
				callback(null, results);
			}
		});
	}
	/**
	 * Fetch all neighborhoods with proper error handling.
	 */
	fetchNeighborhoods(callback) {
		// Fetch all restaurants
		this.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Get all neighborhoods from all restaurants
				const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
				// Remove duplicates from neighborhoods
				const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
				callback(null, uniqueNeighborhoods);
			}
		});
	}
	/**
	 * Fetch all cuisines with proper error handling.
	 */
	fetchCuisines(callback) {
		// Fetch all restaurants
		this.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Get all cuisines from all restaurants
				const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
				// Remove duplicates from cuisines
				const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
				callback(null, uniqueCuisines);
			}
		});
	}
	/**
	 * Restaurant page URL.
	 */
	urlForRestaurant(restaurant) {
		return (`./restaurant.html?id=${restaurant.id}`);
	}
	/**
	 * Restaurant image URL.
	 */
	imageUrlForRestaurant(restaurant, size) {
		let img = restaurant.photograph;
		return img ? (`/img/${img}-${size}.jpg`) : '/img/restaurant_placeholder.svg';
	}
	/**
	 * Map marker for a restaurant.
	 */
	mapMarkerForRestaurant(restaurant, map) {
		const marker = new google.maps.Marker({
			position: restaurant.latlng,
			title: restaurant.name,
			url: this.urlForRestaurant(restaurant),
			map: map,
			animation: google.maps.Animation.DROP}
		);
		return marker;
	}

	handleResponseError(response, type){
		switch (response.status) {
			case 400:
				return new Error('Bed request');
			case 404:
				return new Error('Not found');
			case 500: 
				return new Error('Internal server error');
		}
	}

}
