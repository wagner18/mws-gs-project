// Utility functions


export default class Util {

	static snackbar(el, message, color = '#D9001F') {

		// TODO
		// Create a element if the selected element does not existe
		// var newDiv = document.createElement("div"); 

		if(!el) {
			console.log(new Error('Snackbar element not valid')); 
			return false;
		}

		el.innerHTML = message;
		el.style.visibility = 'visible';
		el.style.background = color;
		setTimeout(() => { el.style.visibility = 'hidden'; }, 5500);
	}
}