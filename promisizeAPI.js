(function (){
	var noOpp = function (){};
	///////////////////////////////////////////////////////////////
	// appAPI.db.async wrapper
	//
	///////////////////////////////////////////////////////////////
	function newDbFunctionGenerator(oldDbFunction) {
		return function () {
			var dfd = new $.Deferred();
			var args = Array.prototype.slice.call(arguments);

			args.push(dfd.resolve);
			oldDbFunction.apply(null, args);

			return dfd.promise();
		};
	}
	(function (db){
		db.set = newDbFunctionGenerator(db.set);
		db.get = newDbFunctionGenerator(db.get);
		db.remove = newDbFunctionGenerator(db.remove);
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
