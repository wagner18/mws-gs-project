import MainController from './mainController';

// window.dataWorker = new Worker('./js/dataWorker.js');
var map;

export function Main() {

	this.controller = new MainController(document.querySelector('#app-main'));
	this.updateRestaurants();

	/**
	* Initialize Google map, called from HTML.
	*/
	window.initMap = () => {
		let loc = { lat: 40.722216, lng: -73.987501 };
		self.map = new google.maps.Map(document.getElementById('map'), {
			zoom: 12,
			center: loc,
			scrollwheel: false
		});
	};

	const script = document.createElement('script');
	script.setAttribute('async', true);
	script.setAttribute('defer', true);
	script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCAGI5xQ4PXUpi6HNhM7fwIVzSzTVVJz5E&libraries=places&callback=initMap';
	document.getElementById('app-main').appendChild(script);

}

Main.prototype.updateRestaurants = function() {

	const cSelect = document.getElementById('cuisines-select');
	const nSelect = document.getElementById('neighborhoods-select');

	const cIndex = cSelect.selectedIndex;
	const nIndex = nSelect.selectedIndex;

	const cuisine = cSelect[cIndex].value;
	const neighborhood = nSelect[nIndex].value;

	this.controller.fetchRestaurants(cuisine, neighborhood);
	this.controller.fetchNeighborhoods();
	this.controller.fetchCuisines();

};

window.main = new Main();
