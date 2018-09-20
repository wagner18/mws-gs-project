import Storage from './storage';
import Util from './util';


export default class RestaurantInfo {

	constructor() {
		this.map = null;
		this.restaurant = null;
		// this.db = new Storage();

		this.dataWorker = new Worker('./js/dataWorker.js');
		this.fetchRestaurantFromURL();

	}


	postMessage({ action, input }) {
		this.dataWorker.postMessage({ action, input });
		this.dataWorker.onmessage = (event) => {

			if(!event.data) throw new Error(`There is no data: ${event}`);

			if(event.data.action === 'fetchRestaurantById') {
				this.restaurant = event.data.result;
				if (!this.restaurant) {
					console.error('There is no data');
					return;
				}
				requestAnimationFrame(() => this.initMap(this.restaurant));
				requestAnimationFrame(() => this.fillRestaurantHTML(this.restaurant));
				requestAnimationFrame(() => this.fillBreadcrumb(this.restaurant));
			}

			if(event.data.action === 'fetchReviews') {
				requestAnimationFrame(() =>  this.fillReviewsHTML(event.data.result));
			}

			if(event.data.action === 'saveReview') {
				const commentList = document.querySelector('#reviews-list');
				commentList.prepend(this.createReviewHTML(event.data.result));
			}

		};
	}

	/**
	 * Get current restaurant from page URL.
	 */
	fetchRestaurantFromURL(callback) {
		if (this.restaurant) { // restaurant already fetched!
			callback(null, this.restaurant);
			return;
		}

		const id = this.getParameterByName('id');
		if (!id) { // no id found in URL
			callback('No restaurant id in URL', null);
		} else {
			this.postMessage({
				action: 'fetchRestaurantById',
				input: {id: parseInt(id)}
			});
		}
	};

	/**
	 * Create restaurant HTML and add it to the webpage
	 */
	fillRestaurantHTML(restaurant = this.restaurant) {
		const name = document.getElementById('restaurant-name');
		name.innerHTML = restaurant.name;

		const address = document.getElementById('restaurant-address');
		address.innerHTML = restaurant.address;

		const image = document.getElementById('restaurant-img');
		image.className = 'restaurant-img';
		image.src = Util.imageUrlForRestaurant(restaurant, 600);
		image.alt = `${restaurant.name} - ${restaurant.cuisine_type} Cuisine`;
		image.srcset = `${Util.imageUrlForRestaurant(restaurant, 1200)} 600w, ${Util.imageUrlForRestaurant(restaurant, 600)} 400w`;

		const cuisine = document.getElementById('restaurant-cuisine');
		cuisine.innerHTML = restaurant.cuisine_type;

		// fill operating hours
		if (restaurant.operating_hours) {
			this.fillRestaurantHoursHTML();
		}

		this.postMessage({
			action: 'fetchReviews',
			input: {id: parseInt(restaurant.id)}
		});
	};

	/**
	 * Create restaurant operating hours HTML table and add it to the webpage.
	 */
	fillRestaurantHoursHTML(operatingHours = this.restaurant.operating_hours) {
		const hours = document.getElementById('restaurant-hours');
		for (let key in operatingHours) {
			const row = document.createElement('tr');

			const day = document.createElement('td');
			day.innerHTML = key;
			row.appendChild(day);

			const time = document.createElement('td');
			time.innerHTML = operatingHours[key];
			row.appendChild(time);

			hours.appendChild(row);
		}
	};

	/**
	 * Create all reviews HTML and add them to the webpage.
	 */
	fillReviewsHTML(reviews = []) {
		reviews.reverse();
		const container = document.getElementById('reviews-container');
		const title = document.createElement('h3');
		title.innerHTML = 'Reviews';
		container.appendChild(title);

		if (!reviews) {
			const noReviews = document.createElement('p');
			noReviews.innerHTML = 'No reviews yet!';
			container.appendChild(noReviews);
			return;
		}
		const ul = document.getElementById('reviews-list');
		reviews.forEach(review => {
			ul.appendChild(this.createReviewHTML(review));
		});
		container.appendChild(ul);
	};

	/**
	 * Create review HTML and add it to the webpage.
	 */
	createReviewHTML(review) {
		const li = document.createElement('li');
		const name = document.createElement('p');
		name.innerHTML = review.name;
		li.appendChild(name);

		const date = document.createElement('p');
		const createdAt = new Date(review.createdAt);
		date.innerHTML = createdAt.toDateString();
		li.appendChild(date);

		const rating = document.createElement('p');
		rating.innerHTML = `Rating: ${review.rating}`;
		li.appendChild(rating);

		const comments = document.createElement('p');
		comments.innerHTML = review.comments;
		li.appendChild(comments);

		return li;
	};

	/**
	 * Add restaurant name to the breadcrumb navigation menu
	 */
	fillBreadcrumb(restaurant) {
		const breadcrumb = document.getElementById('breadcrumb');
		const li = document.createElement('li');
		li.innerHTML = restaurant.name;
		li.setAttribute('aria-label', restaurant.name);
		li.setAttribute('aria-current', 'page');
		breadcrumb.appendChild(li);
	};

	/**
	 * Get a parameter by name from page URL.
	 */
	getParameterByName(name, url) {
		if (!url)
			url = window.location.href;
		name = name.replace(/[\[\]]/g, '\\$&');
		const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
			results = regex.exec(url);
		if (!results)
			return null;
		if (!results[2])
			return '';
		return decodeURIComponent(results[2].replace(/\+/g, ' '));
	};


	sendReview() {
		const formData = {
			restaurant_id: parseInt(this.restaurant.id)
		};
		let isDataValid = true;
		const formDataFields = document.querySelectorAll(".field");
		formDataFields.forEach((field) => {
			// TODO: You gotta sanitize this data man!
			if(field.value === '' || field.value === undefined || field.value === null || !field.value) isDataValid = false;
			formData[field.name] = field.value;
		});

		if(!isDataValid) return;
		this.postMessage({
			action: 'saveReview',
			input: {data: formData}
		});
	}

	/**
	* Initialize Google map, called from HTML.
	*/
	initMap(restaurant) {
		window.initMap = () => {
			this.map = new google.maps.Map(document.getElementById('map'), {
				zoom: 16,
				center: restaurant.latlng,
				scrollwheel: false
			});
			this.addMarkersToMap(restaurant);
		};

		const script = document.createElement('script');
		script.setAttribute('async', true);
		script.setAttribute('defer', true);
		script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCAGI5xQ4PXUpi6HNhM7fwIVzSzTVVJz5E&libraries=places&callback=initMap';
		document.getElementById('app-inside').appendChild(script);
	}


	/**
	 * Add markers for current restaurants to the map.
	 */
	addMarkersToMap(restaurant) {
		if(!google) return;
		const marker = new google.maps.Marker({
			position: restaurant.latlng,
			title: restaurant.name,
			url: `./restaurant.html?id=${restaurant.id}`,
			map: this.map,
			animation: google.maps.Animation.DROP}
		);
	};

}

window.restaurantInfo = new RestaurantInfo();
