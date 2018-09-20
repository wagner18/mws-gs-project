!function(){return function e(t,n,r){function o(u,a){if(!n[u]){if(!t[u]){var c="function"==typeof require&&require;if(!a&&c)return c(u,!0);if(i)return i(u,!0);var s=new Error("Cannot find module '"+u+"'");throw s.code="MODULE_NOT_FOUND",s}var l=n[u]={exports:{}};t[u][0].call(l.exports,function(e){return o(t[u][1][e]||e)},l,l.exports,e,t,n,r)}return n[u].exports}for(var i="function"==typeof require&&require,u=0;u<r.length;u++)o(r[u]);return o}}()({1:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});n.default={COLLECTIONS:{RESTAURANTS:"restaurants",REVIEWS:"reviews",UNSYNCED_REVIEWS:"unsynced_reviews",IS_DATA_SYNCRONIZED:"isDataSyncronzed"}}},{}],2:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var r=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),o=i(e("idb"));function i(e){return e&&e.__esModule?e:{default:e}}var u=i(e("./constants")).default.COLLECTIONS,a=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.dbName="restaurantApp",this._IDB=this.setDatabase(this.dbName),this.setSyncAsPending(u.RESTAURANTS,!0),this.setSyncAsPending(u.REVIEWS,!0)}return r(e,[{key:"setDatabase",value:function(e){return o.default.open(e,1,function(e){switch(console.log("\n\n\n-----",e.oldVersion),e.oldVersion){case 0:e.createObjectStore(u.RESTAURANTS,{keyPath:"id"}).createIndex("by-id","id"),e.createObjectStore(u.REVIEWS,{keyPath:"id"}).createIndex("by-id","restaurant_id"),e.createObjectStore(u.UNSYNCED_REVIEWS,{autoIncrement:!0}).createIndex("by-id","restaurant_id"),e.createObjectStore(u.IS_DATA_SYNCRONIZED,{keyPath:"collection"}),console.log("Database and Index created")}})}},{key:"setSyncAsPending",value:function(e,t){return this._IDB.then(function(n){n.transaction(u.IS_DATA_SYNCRONIZED,"readwrite").objectStore(u.IS_DATA_SYNCRONIZED).put({collection:e,status:t})})}},{key:"cacheData",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[];this._IDB.then(function(n){var r=n.transaction(e,"readwrite"),o=r.objectStore(e);t.forEach(function(e){return o.put(e)}),r.complete.then(function(){return console.log("data added to "+e)})})}},{key:"setCache",value:function(e,t){return this._IDB.then(function(n){var r=n.transaction(e,"readwrite");return r.objectStore(e).put(t),r.complete.then(function(){return console.log("data added to "+e)})})}},{key:"getCacheById",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];return this._IDB.then(function(n){return n.transaction(e).objectStore(e).index("by-id").get(parseInt(t))})}},{key:"getCacheAll",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"by-id";return this._IDB.then(function(n){return n.transaction(e).objectStore(e).index(t).getAll()}).then(function(e){return e})}},{key:"deleteCache",value:function(e,t){return this._IDB.then(function(n){var r=n.transaction(e,"readwrite");return r.objectStore(e).delete(t),r.complete})}},{key:"clearCache",value:function(e){return this._IDB.then(function(t){var n=t.transaction(e,"readwrite");return n.objectStore(e).clear(),n.complete})}}]),e}();n.default=a},{"./constants":1,idb:4}],3:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var r=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),o=(i(e("idb")),i(e("./dataCache")));function i(e){return e&&e.__esModule?e:{default:e}}function u(e){if(Array.isArray(e)){for(var t=0,n=Array(e.length);t<e.length;t++)n[t]=e[t];return n}return Array.from(e)}var a=i(e("./constants")).default.COLLECTIONS,c=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e);this.DATABASE={RESTAURANTS:"http://0.0.0.0:1337/restaurants",REVIEWS:"http://0.0.0.0:1337/reviews/"},this.idbCache=new o.default}return r(e,[{key:"toogleFavorite",value:function(e,t){var n=this;this.idbCache.getCacheById(a.RESTAURANTS,e).then(function(r){var o="true"===r.is_favorite?"false":"true";return r.is_favorite=o,n.idbCache.setCache(a.RESTAURANTS,r).then(function(){if(t(null,r),navigator.onLine){var i="/"+e+"/?is_favorite="+o;return fetch(n.DATABASE.RESTAURANTS+i,{method:"PUT"}).then(function(e){200===e.status&&n.idbCache.setSyncAsPending(a.RESTAURANTS,!0)})}n.idbCache.setSyncAsPending(a.RESTAURANTS,!1)})}).catch(function(e){return t(e,null)})}},{key:"saveReview",value:function(e,t){var n=this;return navigator.onLine?fetch(this.DATABASE.REVIEWS,{method:"POST",body:JSON.stringify(e)}).then(function(r){if(r.status<400)return n.idbCache.setCache(a.REVIEWS,e).then(function(){return t(null,r),n.idbCache.setSyncAsPending(a.REVIEWS,!0)});throw new Error("Error code "+r.status)}).catch(function(e){return t(e,null)}):this.idbCache.setCache(a.UNSYNCED_REVIEWS,e).then(function(){n.idbCache.setSyncAsPending(a.REVIEWS,!1),t(null,e)}).catch(function(e){return t(e,null)})}},{key:"fetchRestaurants",value:function(e){var t=this;this.idbCache.getCacheAll(a.RESTAURANTS).then(function(n){n.length>0?(e(null,n),console.log("data loaded from local storage!")):fetch(t.DATABASE.RESTAURANTS).then(function(n){200===n.status?n.json().then(function(n){t.idbCache.cacheData(a.RESTAURANTS,n),e(null,n)}):e(t.handleResponseError(n,"api request"),null)}).catch(function(t){return e(t,null)})})}},{key:"fetchReviews",value:function(e,t){var n=this;this.idbCache.getCacheAll(a.UNSYNCED_REVIEWS).then(function(r){if(navigator.onLine){r&&r.length>0&&(r.forEach(function(e){n.saveReview(e,function(e,t){e&&console.error(e)})}),n.idbCache.clearCache(a.UNSYNCED_REVIEWS));var o="?restaurant_id="+e;fetch(n.DATABASE.REVIEWS+o).then(function(e){e.status<400?e.json().then(function(e){n.idbCache.cacheData(a.REVIEWS,e),t(null,e)}):t(n.handleResponseError(e,"API request"),null)}).catch(function(e){return t(e,null)})}else n.idbCache.getCacheAll(a.REVIEWS).then(function(n){var o=[].concat(u(n),u(r));if(o&&o.length>0){var i=o.filter(function(t){return t.restaurant_id===e});t(null,i)}else t(null,[])})})}},{key:"fetchRestaurantById",value:function(e,t){var n=this;if(navigator.onLine){var r="/"+e;fetch(this.DATABASE.RESTAURANTS+r).then(function(e){200===e.status?e.json().then(function(e){t(null,e)}):t(n.handleResponseError(e,"api request"),null)}).catch(function(e){return t(e,null)})}else this.idbCache.getCacheById(a.RESTAURANTS,e).then(function(e){t(null,e)}).catch(function(e){return t(e,null)})}},{key:"fetchRestaurantByCuisine",value:function(e,t){this.fetchRestaurants(function(n,r){if(n)t(n,null);else{var o=r.filter(function(t){return t.cuisine_type==e});t(null,o)}})}},{key:"fetchRestaurantByNeighborhood",value:function(e,t){this.fetchRestaurants(function(n,r){if(n)t(n,null);else{var o=r.filter(function(t){return t.neighborhood==e});t(null,o)}})}},{key:"fetchRestaurantByCuisineAndNeighborhood",value:function(e,t,n){this.fetchRestaurants(function(r,o){if(r)n(r,null);else{var i=o;"all"!=e&&(i=i.filter(function(t){return t.cuisine_type==e})),"all"!=t&&(i=i.filter(function(e){return e.neighborhood==t})),n(null,i)}})}},{key:"fetchNeighborhoods",value:function(e){this.fetchRestaurants(function(t,n){if(t)e(t,null);else{var r=n.map(function(e,t){return n[t].neighborhood}),o=r.filter(function(e,t){return r.indexOf(e)==t});e(null,o)}})}},{key:"fetchCuisines",value:function(e){this.fetchRestaurants(function(t,n){if(t)e(t,null);else{var r=n.map(function(e,t){return n[t].cuisine_type}),o=r.filter(function(e,t){return r.indexOf(e)==t});e(null,o)}})}},{key:"urlForRestaurant",value:function(e){return"./restaurant.html?id="+e.id}},{key:"imageUrlForRestaurant",value:function(e,t){var n=e.photograph;return n?"/img/"+n+"-"+t+".jpg":"/img/restaurant_placeholder.svg"}},{key:"mapMarkerForRestaurant",value:function(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:this.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}},{key:"handleResponseError",value:function(e,t){switch(e.status){case 400:return new Error("Bed request");case 404:return new Error("Not found");case 500:return new Error("Internal server error")}}}]),e}();n.default=c},{"./constants":1,"./dataCache":2,idb:4}],4:[function(e,t,n){"use strict";!function(){function e(e){return new Promise(function(t,n){e.onsuccess=function(){t(e.result)},e.onerror=function(){n(e.error)}})}function n(t,n,r){var o,i=new Promise(function(i,u){e(o=t[n].apply(t,r)).then(i,u)});return i.request=o,i}function r(e,t,n){n.forEach(function(n){Object.defineProperty(e.prototype,n,{get:function(){return this[t][n]},set:function(e){this[t][n]=e}})})}function o(e,t,r,o){o.forEach(function(o){o in r.prototype&&(e.prototype[o]=function(){return n(this[t],o,arguments)})})}function i(e,t,n,r){r.forEach(function(r){r in n.prototype&&(e.prototype[r]=function(){return this[t][r].apply(this[t],arguments)})})}function u(e,t,r,o){o.forEach(function(o){o in r.prototype&&(e.prototype[o]=function(){return e=this[t],(r=n(e,o,arguments)).then(function(e){if(e)return new c(e,r.request)});var e,r})})}function a(e){this._index=e}function c(e,t){this._cursor=e,this._request=t}function s(e){this._store=e}function l(e){this._tx=e,this.complete=new Promise(function(t,n){e.oncomplete=function(){t()},e.onerror=function(){n(e.error)},e.onabort=function(){n(e.error)}})}function f(e,t,n){this._db=e,this.oldVersion=t,this.transaction=new l(n)}function h(e){this._db=e}r(a,"_index",["name","keyPath","multiEntry","unique"]),o(a,"_index",IDBIndex,["get","getKey","getAll","getAllKeys","count"]),u(a,"_index",IDBIndex,["openCursor","openKeyCursor"]),r(c,"_cursor",["direction","key","primaryKey","value"]),o(c,"_cursor",IDBCursor,["update","delete"]),["advance","continue","continuePrimaryKey"].forEach(function(t){t in IDBCursor.prototype&&(c.prototype[t]=function(){var n=this,r=arguments;return Promise.resolve().then(function(){return n._cursor[t].apply(n._cursor,r),e(n._request).then(function(e){if(e)return new c(e,n._request)})})})}),s.prototype.createIndex=function(){return new a(this._store.createIndex.apply(this._store,arguments))},s.prototype.index=function(){return new a(this._store.index.apply(this._store,arguments))},r(s,"_store",["name","keyPath","indexNames","autoIncrement"]),o(s,"_store",IDBObjectStore,["put","add","delete","clear","get","getAll","getKey","getAllKeys","count"]),u(s,"_store",IDBObjectStore,["openCursor","openKeyCursor"]),i(s,"_store",IDBObjectStore,["deleteIndex"]),l.prototype.objectStore=function(){return new s(this._tx.objectStore.apply(this._tx,arguments))},r(l,"_tx",["objectStoreNames","mode"]),i(l,"_tx",IDBTransaction,["abort"]),f.prototype.createObjectStore=function(){return new s(this._db.createObjectStore.apply(this._db,arguments))},r(f,"_db",["name","version","objectStoreNames"]),i(f,"_db",IDBDatabase,["deleteObjectStore","close"]),h.prototype.transaction=function(){return new l(this._db.transaction.apply(this._db,arguments))},r(h,"_db",["name","version","objectStoreNames"]),i(h,"_db",IDBDatabase,["close"]),["openCursor","openKeyCursor"].forEach(function(e){[s,a].forEach(function(t){e in t.prototype&&(t.prototype[e.replace("open","iterate")]=function(){var t,n=(t=arguments,Array.prototype.slice.call(t)),r=n[n.length-1],o=this._store||this._index,i=o[e].apply(o,n.slice(0,-1));i.onsuccess=function(){r(i.result)}})})}),[a,s].forEach(function(e){e.prototype.getAll||(e.prototype.getAll=function(e,t){var n=this,r=[];return new Promise(function(o){n.iterateCursor(e,function(e){e?(r.push(e.value),void 0===t||r.length!=t?e.continue():o(r)):o(r)})})})});var d={open:function(e,t,r){var o=n(indexedDB,"open",[e,t]),i=o.request;return i&&(i.onupgradeneeded=function(e){r&&r(new f(i.result,e.oldVersion,i.transaction))}),o.then(function(e){return new h(e)})},delete:function(e){return n(indexedDB,"deleteDatabase",[e])}};void 0!==t?(t.exports=d,t.exports.default=t.exports):self.idb=d}()},{}]},{},[3]);
//# sourceMappingURL=dbhelper.js.map