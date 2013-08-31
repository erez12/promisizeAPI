(function (){
	var noOpp = function (){};
	///////////////////////////////////////////////////////////////
	// appAPI.db.async wrapper
	//
	///////////////////////////////////////////////////////////////
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
	(function (db){
		db.set = newDbFunctionGenerator(db.set);
		db.get = newDbFunctionGenerator(db.get);
		db.remove = newDbFunctionGenerator(db.remove);
		db.getList = newDbFunctionGenerator(db.getList);
		db.getExpiration = newDbFunctionGenerator(db.getExpiration);
		db.updateExpiration = newDbFunctionGenerator(db.updateExpiration);
		db.removeAll = newDbFunctionGenerator(db.removeAll);
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
	function newRequstFunctionGenerator(oldRequestFunction) {
		return function (requestData) {
			var dfd = new $.Deferred();

			requestData.onSuccess = dfd.resolve;
			requestData.onFailure = dfd.reject;
			oldRequestFunction(requestData);

			return dfd.promise();
		};
	}
	appAPI.appAPI.request.get = newRequstFunctionGenerator(appAPI.appAPI.request.get);
	appAPI.appAPI.request.post = newRequstFunctionGenerator(appAPI.appAPI.request.post);
}());


function asseert(val1, val2){
	if (val === val2){
		console.log("val1 is equal to val2");
	}
	else {
		console.log("expected " + val1 + " but found " + val2);
	}
}

$.when(appAPI.db.async.set("", 123))
appAPI.db.async.set("key1", 123, appAPI.time.minutesFromNow(3)).then(function (){
	appAPI.db.async.get("key1").then(function (res){
		assert(res, 123);
	});
});
