function IndexController(container) {
	this._container = container;
	this._registerServiceWorker();
}

IndexController.prototype._registerServiceWorker = function() {

	if (navigator.serviceWorker) {

		if (navigator.serviceWorker.controller) return;

		navigator.serviceWorker.register('./sw.js', {scope: './'}).then((swReg) => {
			console.log('\nServiceWorker successfully registred. Scope\n', swReg.scope);
		}).catch((err) => {
			console.log('\nServiceWorker swReg failed :(\n', err.message);
		});
	}
};

