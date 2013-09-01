(function ($){
	var noOpp = function (){};
	///////////////////////////////////////////////////////////////
	// appAPI.db.async wrapper
	//
	///////////////////////////////////////////////////////////////
	(function (db){
		function newDbFunctionGenerator(oldDbFunction) {
			return function () {
				var dfd = new $.Deferred();

				var args = Array.prototype.slice.call(arguments);
				var callback = noOpp;
				if (appAPI.utils.isFunction(arguments[arguments.length - 1])) {
					args = Array.prototype.slice.call(arguments, 0, arguments.length -1);
					// Save a ref to the callback if it was passed.
					// Internally, API also uses these functions so we MUST call callback later
					callback = arguments[arguments.length - 1];
				}

				args.push(function (result){
					callback(result);
					dfd.resolve(result);
				});
				// TODO - might need to call the function with setImmediate (to support IE)
				oldDbFunction.apply(null, args);

				return dfd.promise();
			};
		}
		db.set = newDbFunctionGenerator(db.set);
		db.get = newDbFunctionGenerator(db.get);
		db.remove = newDbFunctionGenerator(db.remove);
		db.getList = newDbFunctionGenerator(db.getList);
		db.removeAll = newDbFunctionGenerator(db.removeAll);
		db.getExpiration = newDbFunctionGenerator(db.getExpiration);
		db.updateExpiration = newDbFunctionGenerator(db.updateExpiration);
		db.setFromRemote = function(url, key, expires, onSuccess, onFailure) {
			var dfd = new $.Deferred();

			var oldSetFromRemote = db.setFromRemote;
			// Internally, API also uses these functions so we MUST call callbacks later
			onSuccess = onSuccess || noOpp;
			onFailure = onFailure || noOpp;
			oldDbFunction(url, key,	expires,
				function (result){
					onSuccess(result);
					dfd.resolve(result);
				},
				function (result){
					onFailure(result);
					dfd.reject(result);
			});

			return dfd.promise();
		};
	}(appAPI.db.async));

	///////////////////////////////////////////////////////////////
	// appAPI.request wrapper
	//
	///////////////////////////////////////////////////////////////
	appAPI.request.get = (function (){
		var oldGetRequestFunction = appAPI.request.get;
		return function(urlToGet, onSuccess, onFailure) {
			var dfd = new $.Deferred();

			var requestObj = {};
			if (appAPI.utils.isString(urlToGet)) {
				// Its an old style request
				requestObj.url = urlToGet;
				onSuccess = onSuccess || noOpp;
				onFailure = onFailure || noOpp;
				requestObj.onSuccess = function (response, additionalInfo) {
					onSuccess(response, additionalInfo);
					dfd.resolve(response, additionalInfo);
				};
				requestObj.onFailure = function (httpCode){
					onFailure(httpCode);
					dfd.reject(httpCode);
				};
			}
			else {
				requestObj.url = urlToGet.url;
				urlToGet.onSuccess = urlToGet.onSuccess || noOpp;
				urlToGet.onFailure = urlToGet.onFailure || noOpp;
				requestObj.onSuccess = function (response, additionalInfo) {
					urlToGet.onSuccess(response, additionalInfo);
					dfd.resolve(response, additionalInfo);
				};
				requestObj.onFailure = function (httpCode){
					urlToGet.onFailure(httpCode);
					dfd.reject(httpCode);
				};
				requestObj.additionalRequestHeaders = urlToGet.additionalRequestHeaders;
			}
			oldGetRequestFunction(requestObj);

			return dfd.promise();
		};
	}());
	appAPI.request.post = (function (){
		var oldPostRequestFunction = appAPI.request.post;
		return function(urlToPost, postData, onSuccess, onFailure) {
			var dfd = new $.Deferred();

			var requestObj = {};
			if (appAPI.utils.isString(urlToPost)) {
				// Its an old style request
				onSuccess = onSuccess || noOpp;
				onFailure = onFailure || noOpp;
				requestObj.url = urlToPost;
				requestObj.postData = postData;
				requestObj.onSuccess = function (response, additionalInfo) {
					onSuccess(response, additionalInfo);
					dfd.resolve(response, additionalInfo);
				};
				requestObj.onFailure = function (httpCode){
					onFailure(httpCode);
					dfd.reject(httpCode);
				};
			}
			else {
				urlToPost.onSuccess = urlToPost.onSuccess || noOpp;
				urlToPost.onFailure = urlToPost.onFailure || noOpp;
				requestObj.url = urlToPost.url;
				requestObj.postData = urlToPost.postData;
				requestObj.onSuccess = function (response, additionalInfo) {
					urlToPost.onSuccess(response, additionalInfo);
					dfd.resolve(response, additionalInfo);
				};
				requestObj.onFailure = function (httpCode){
					urlToPost.onFailure(httpCode);
					dfd.reject(httpCode);
				};
				requestObj.additionalRequestHeaders = urlToPost.additionalRequestHeaders;
				requestObj.contentType = urlToPost.contentType;
			}
			oldPostRequestFunction(requestObj);

			return dfd.promise();
		};
    }());
}($jquery_171));