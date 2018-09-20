import IDB from 'idb';
import constants from './constants';

const COLLECTIONS = constants.COLLECTIONS;

/*
* Common database helper functions.
*/
export default class DataCache {

  constructor(){
		this.dbName = "restaurantApp";
		this._IDB = this.setDatabase(this.dbName);
		this.setSyncAsPending(COLLECTIONS.RESTAURANTS, true);
		this.setSyncAsPending(COLLECTIONS.REVIEWS, true);
	}

	setDatabase(dbName) {
		return IDB.open(dbName, 1, (upgradedDB) => {
			switch(upgradedDB.oldVersion){
				case 0:
					const restaurants = upgradedDB.createObjectStore(COLLECTIONS.RESTAURANTS, {keyPath: 'id'});
					restaurants.createIndex('by-id', 'id');

					const reviews = upgradedDB.createObjectStore(COLLECTIONS.REVIEWS, {keyPath: 'id'});
					reviews.createIndex('by-id', 'restaurant_id');

					const unsyncedReviews = upgradedDB.createObjectStore(COLLECTIONS.UNSYNCED_REVIEWS, {autoIncrement: true});
					unsyncedReviews.createIndex('by-id', 'restaurant_id');

					upgradedDB.createObjectStore(COLLECTIONS.IS_DATA_SYNCRONIZED, { keyPath: 'collection' });
					console.log('Database and Index created');
			}
		});
	}

	/**
	 * Set local data sync as panding
	 */
	setSyncAsPending(collection, status) {
		return this._IDB.then(db => {
			const tx = db.transaction(COLLECTIONS.IS_DATA_SYNCRONIZED, 'readwrite');
			tx.objectStore(COLLECTIONS.IS_DATA_SYNCRONIZED).put({ collection, status });
		});
	}


	cacheData(collection, data = []){
		 // add post the local DB
		this._IDB.then(db => {
			const tx = db.transaction(collection, 'readwrite');
			const readwriteStore = tx.objectStore(collection);
			data.forEach((item) => readwriteStore.put(item));
			return tx.complete;
		});
	}


	setCache(collection, data){
		return this._IDB.then(db => {
			const tx = db.transaction(collection, 'readwrite');
			tx.objectStore(collection).put(data);
      return tx.complete;
		});
	}


	getCacheById(collection, id = false) {
		return this._IDB.then(db => {
			return db.transaction(collection)
				.objectStore(collection).index('by-id').get(parseInt(id));
		});
	}


	getCacheAll(collection, index = 'by-id') {
		return this._IDB.then(db => {
			return db.transaction(collection)
				.objectStore(collection)
				.index(index)
				.getAll();
		}).then(restaurants => restaurants);
	}


	deleteCache(collection, id) {
		return this._IDB.then(db => {
			const tx = db.transaction(collection, 'readwrite');
			tx.objectStore(collection).delete(id);
			return tx.complete;
		});
	}


	clearCache(collection) {
		return this._IDB.then(db => {
			const tx = db.transaction(collection, 'readwrite');
			tx.objectStore(collection).clear();
			return tx.complete;
		});
	}


}
