// importScripts('storage.js');
import Storage from './storage';


// const dataObject = new Storage();
const dataObject = new Storage();

self.onmessage = function(e) {
  const input = e.data.input;
  const action = e.data.action;

  try {

    switch (action) {

      case "fetchRestaurantById":
        dataObject.fetchRestaurantById(input.id, (error, result) => {
          if(error) console.warn(error);
          postMessage({ action, result });
        });
        break;

      case "fetchRestaurantByCuisineAndNeighborhood":
        dataObject.fetchRestaurantByCuisineAndNeighborhood(input.cuisine, input.neighborhood, (error, result) => {
          if(error) console.warn(error);
          postMessage({ action, result });
        });
        break;

      case "fetchNeighborhoods":
        dataObject.fetchNeighborhoods((error, result) => {
          if(error) console.warn(error);
          postMessage({ action, result });
        });
        break;

      case "fetchCuisines":
        dataObject.fetchCuisines((error, result) => {
          if(error) console.warn(error);
          postMessage({ action, result });
        });
        break;

      case "toggleFavorite":
        dataObject.toggleFavorite(input.id, (error, result) => {
          if(error) console.warn(error);
          postMessage({ action, result });
        });
        break;

      case "fetchReviews":
        dataObject.fetchReviews(input.id, (error, result) => {
          if(error) console.warn(error);
          postMessage({ action, result });
        });
        break;

      case "saveReview":
        dataObject.saveReview(input.data, (error, result) => {
          if(error) console.warn(error);
          postMessage({ action, result });
        });
        break;

      default:
        postMessage({action, result: "Action not found"});
    }

  }
  catch(e) {
    postMessage(undefined);
  }
};
