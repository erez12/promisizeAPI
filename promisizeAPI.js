(function (){
	var noOpp = function (){};
	///////////////////////////////////////////////////////////////
	// appAPI.db.async wrapper
	//
	///////////////////////////////////////////////////////////////
	(function (db){
		function newDbFunctionGenerator(oldDbFunction) {
			return function () {
				var dfd = new $.Deferred();

				var args = Array.prototype.slice.call(arguments.length - 1);
				// Save a ref to the callback if it was passed.
				// Internally, API also uses these functions so we MUST call callback later
				var callback = appAPI.utils.isFunction(arguments[arguments.length - 1]) ? arguments[arguments.length - 1] : noOpp;

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
	appAPI.request.get = function(urlToGet, onSuccess, onFailure) {
		var dfd = new $.Deferred();

		var oldGetRequestFunction = appAPI.request.get;
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
	appAPI.request.post = function(urlToPost, postData, onSuccess, onFailure) {
		var dfd = new $.Deferred();

		var oldPostRequestFunction = appAPI.request.post;
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
			requestObj.additionalRequestHeaders = urlToGet.additionalRequestHeaders;
			requestObj.contentType = urlToPost.contentType;
		}
		oldPostRequestFunction(requestObj);

		return dfd.promise();
    };
}());

///////////////////////////////////////////////////////////////
// ASYNC DB TEST
///////////////////////////////////////////////////////////////
// Set - Get Test:
appAPI.db.async.set('key', 123).then(function (){
	appAPI.db.async.get('key', 123).then(function (res){
		console.log("Set - Get Result ", res === 123);
	});
});

// Remove Test:
appAPI.db.async.set('key', 123).then(function (){
	appAPI.db.async.remove('key').then(function (){
		appAPI.db.async.get('key', 123).then(function (res){
			console.log("Remove test result: ", appAPI.utils.isDefined(res));
		});
	});
});

// GetList Test:
$.when(appAPI.db.async.set('key1', 123), appAPI.db.async.set('key2', 456)).then(function (){
	appAPI.db.async.getList().then(function (result){
		console.log("GetList result ", result);
	});
});

// RemoveAll Test:
$.when(appAPI.db.async.set('key1', 123), appAPI.db.async.set('key2', 456)).then(function (){
	appAPI.db.async.removeAll().then(function (){
		appAPI.db.async.getList().then(function (result){
			console.log("RemoveAll result ", result);
		});
	});
});

// GetExpiration - UpdateExpiration RemoveAll Test:
appAPI.db.async.set('key', 123, appAPI.time.hoursFromNow(3)).then(function (){
	appAPI.db.async.getExpiration().then(function (res){
		console.log("GetExpiration, before: ", res);
		appAPI.db.async.updateExpiration(appAPI.time.minutesFromNow(3)).then(function (){
			appAPI.db.async.getExpiration().then(function (res){
				console.log("GetExpiration, after: ", res);
			});
		});
	});
});

///////////////////////////////////////////////////////////////
// REQUEST TEST
///////////////////////////////////////////////////////////////
// Get Test
var getData = {
	url: 'http://google.com',
	additionalRequestHeaders: {}
};
appAPI.request.get(getData)
	.done(function (response, additionalInfo){
		console.log("Get request test result: ", response.length, additionalInfo);
	})
	.fail(function (httpCode){
		console.log("Get request test result(fail): ", httpCode);
});

// Post Test
var postData = {
	url: 'http://infinite-plains-4163.herokuapp.com',
    postData: {hello: "world"},
    additionalRequestHeaders: { foo: "bar"}
};
appAPI.request.post(postData)
	.done(function (response, additionalInfo){
		console.log("Post request test result: ", response.length, additionalInfo);
	})
	.fail(function (httpCode){
		console.log("Post request test result(fail): ", httpCode);
});