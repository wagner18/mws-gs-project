import MainController from './mainController';
import DBHelper from './dbhelper';

var map;

export function Main() {
	this.controller = new MainController(document.querySelector('#app-main'));
	this.controller.fetchNeighborhoods();
	this.controller.fetchCuisines();

	/**
	* Initialize Google map, called from HTML.
	*/
	window.initMap = () => {
		let loc = {
			lat: 40.722216,
			lng: -73.987501
		};
		self.map = new google.maps.Map(document.getElementById('map'), {
			zoom: 12,
			center: loc,
			scrollwheel: false
		});
		this.updateRestaurants();
	};
}

Main.prototype.updateRestaurants = function() {

	const cSelect = document.getElementById('cuisines-select');
	const nSelect = document.getElementById('neighborhoods-select');

	const cIndex = cSelect.selectedIndex;
	const nIndex = nSelect.selectedIndex;

	const cuisine = cSelect[cIndex].value;
	const neighborhood = nSelect[nIndex].value;

	this.controller.fetchRestaurants(cuisine, neighborhood);
};

window.main = new Main();

// document.addEventListener('DOMContentLoaded', (event) => {

// });

