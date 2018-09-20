import IDB from 'idb';
import DataCache from './dataCache';
import constants from './constants';

const COLLECTIONS = constants.COLLECTIONS;

/*
* Common database helper functions.
*/
class Storage {

	constructor() {
		const port = 1337; // Change this to your server port
		// Database URL.
		this.DATABASE = {
			RESTAURANTS: `http://0.0.0.0:${port}/restaurants`,
			REVIEWS: `http://0.0.0.0:${port}/reviews/`,
		}

		this.reloadInterval = 0;
		this.reloadTimer = Date.now();
		this.restaurants = [];
		this.idbCache = new DataCache();
		this.syncDataToApi();
	}


	/**
	 * Fetch all restaurants.
	 */
	fetchRestaurants(callback) {
		// Allow reload local data every 5 minutes
		const isTimeToReload = (Date.now() - this.reloadTimer) > this.reloadInterval ? true : false;

		if (isTimeToReload && navigator.onLine) {
			fetch(this.DATABASE.RESTAURANTS).then(response => {
				if (response.status === 200) {
					response.json().then(data => {
						this.restaurants = data;
						this.reloadInterval = 300;
						this.idbCache.cacheData(COLLECTIONS.RESTAURANTS, data);
						callback(null, data);
					});
				} else {
					callback(this.handleResponseError(response, 'api request'), null);
				}
			}).catch(error => callback(error, null));
			return;
		}

		if(this.restaurants.length > 0 ) {
			callback(null, this.restaurants);
			return;
		} else {
			this.idbCache.getCacheAll(COLLECTIONS.RESTAURANTS).then(data => {
				if(data.length > 0 ) {
					this.restaurants = data;
					callback(null, data);
					return;
				}
			});
		}

	}

	/**
	 * Fetch all restaurants.
	 */
	fetchReviews(id, callback) {
		// check unsyced reviews
		this.idbCache.getCacheAll(COLLECTIONS.UNSYNCED_REVIEWS).then((unsycedReviews) => {

			if(!navigator.onLine){
				this.idbCache.getCacheAll(COLLECTIONS.REVIEWS).then((reviews) => {
					const cachedReviews = [...reviews, ...unsycedReviews];
					if(cachedReviews && cachedReviews.length > 0) {
						const filteredReviews = cachedReviews.filter((review) => review.restaurant_id === id);
						callback(null, filteredReviews);
					} else {
						callback(null, []);
					}
				});
			} else {

				// Syced reviews if any unsyced
				// if(unsycedReviews && unsycedReviews.length > 0){
				// 	unsycedReviews.forEach((review) => {
				// 		this.saveReview(review, (error, data) => {
				// 			if(error) console.error(error);
				// 		});
				// 	});
				// 	this.idbCache.clearCache(COLLECTIONS.UNSYNCED_REVIEWS);
				// }

				const reviewsPath = `?restaurant_id=${id}`;
				fetch(this.DATABASE.REVIEWS + reviewsPath).then(response => {
					if (response.status < 400) {
						response.json().then(data => {
							this.idbCache.cacheData(COLLECTIONS.REVIEWS, data);
							callback(null, data);
						});
					} else {
						callback(this.handleResponseError(response, 'API request'), null);
					}
				}).catch(error => callback(error, null));
			}

		});
	}

	/**
	 * Fetch a restaurant by its ID.
	 */
	fetchRestaurantById(id, callback) {
		if(!navigator.onLine) {
			this.idbCache.getCacheById(COLLECTIONS.RESTAURANTS, id).then((response) => {
				callback(null, response);
			}).catch(error => callback(error, null));
		} else {
			const path = `/${id}`;
			fetch(this.DATABASE.RESTAURANTS + path).then(response => {
				if (response.status === 200) {
					response.json().then(data => {
						callback(null, data);
					});
				} else {
					callback(this.handleResponseError(response, 'api request'), null);
				}
			}).catch(error => callback(error, null));
		}
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

	toggleFavorite(id, callback) {
		this.idbCache.getCacheById(COLLECTIONS.RESTAURANTS, id).then((response) => {
			const toogle = response.is_favorite === "true" ? "false" : "true";
			response.is_favorite = toogle;
			return this.idbCache.setCache(COLLECTIONS.RESTAURANTS, response).then(() => {
				callback(null, response);
				if(!navigator.onLine) {
					this.idbCache.setSyncAsPending(COLLECTIONS.RESTAURANTS, false);
				} else {
					const path = `/${id}/?is_favorite=${toogle}`;
					return fetch(this.DATABASE.RESTAURANTS + path, { method: 'PUT' }).then((response) => {
						if (response.status === 200) this.idbCache.setSyncAsPending(COLLECTIONS.RESTAURANTS, true);
					});
				}
			});
		})
		.catch((error) => callback(error, null));
	}


	saveReview(data, callback) {
		if(!navigator.onLine) {
			return this.idbCache.setCache(COLLECTIONS.UNSYNCED_REVIEWS, data).then(() => {
				this.idbCache.setSyncAsPending(COLLECTIONS.REVIEWS, false);
				callback(null, data);
			}).catch((error) => callback(error, null));
		} else {

			return fetch(this.DATABASE.REVIEWS, {
				 method: 'POST',
				 body: JSON.stringify(data)
			})
			.then((response) => {
				if (response.status < 400) {
					response.json().then((responseData) => {
						return this.idbCache.setCache(COLLECTIONS.REVIEWS, responseData).then(() => {
							callback(null, responseData);
							return this.idbCache.setSyncAsPending(COLLECTIONS.REVIEWS, true);
						});
					});
				} else {
					throw new Error(`Error code ${response.status}`);
				}
			}).catch((error) => callback(error, null));

		}
	}


	syncDataToApi() {
		const syncInterval = setInterval(() => {
			if(!navigator.onLine) return;
			this.idbCache.getCacheAll(COLLECTIONS.UNSYNCED_REVIEWS).then((unsycedReviews) => {
				// Syced reviews if any unsyced
				if(unsycedReviews && unsycedReviews.length > 0) {
					unsycedReviews.forEach((review) => {
						this.saveReview(review, (error, data) => {
							if(error) console.error(error);
						});
					});
					this.idbCache.clearCache(COLLECTIONS.UNSYNCED_REVIEWS);
				}
			});
		}, 3000);
	}

	/**
	 * Map marker for a restaurant.
	 */
	mapMarkerForRestaurant(restaurant, map) {
		if(!google) return;
		const marker = new google.maps.Marker({
			position: restaurant.latlng,
			title: restaurant.name,
			url: `./restaurant.html?id=${restaurant.id}`,
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


export default Storage;
