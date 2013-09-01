///////////////////////////////////////////////////////////////
// ASYNC DB TEST
///////////////////////////////////////////////////////////////
// Set - Get Test:
appAPI.db.async.set('key', 123, appAPI.time.hoursFromNow(3)).then(function (){
	appAPI.db.async.get('key').then(function (res){
		console.log("Set - Get Result ", res === 123);
	});
});

// Remove Test:
appAPI.db.async.set('key', 123, appAPI.time.hoursFromNow(3)).then(function (){
	appAPI.db.async.remove('key').then(function (){
		appAPI.db.async.get('key').then(function (res){
			console.log("Remove test result: ", !appAPI.utils.isDefined(res));
		});
	});
});

// GetList Test:
appAPI.ready(function ($){
	$.when(appAPI.db.async.set('key1', 123, appAPI.time.hoursFromNow(3)), appAPI.db.async.set('key2', 456, appAPI.time.hoursFromNow(3))).then(function (){
		appAPI.db.async.getList().then(function (result){
			console.log("GetList result ", result);
		});
	});
});


// RemoveAll Test:
appAPI.ready(function ($){
	$.when(appAPI.db.async.set('key1', 123, appAPI.time.hoursFromNow(3)), appAPI.db.async.set('key2', 456, appAPI.time.hoursFromNow(3))).then(function (){
		appAPI.db.async.removeAll().then(function (){
			appAPI.db.async.getList().then(function (result){
				console.log("RemoveAll result ", result);
			});
		});
	});
});
// GetExpiration - UpdateExpiration RemoveAll Test:
appAPI.db.async.set('key', 123, appAPI.time.hoursFromNow(3)).then(function (){
	appAPI.db.async.getExpiration('key').then(function (res){
		console.log("GetExpiration, before: ", res);
		appAPI.db.async.updateExpiration('key', appAPI.time.minutesFromNow(3)).then(function (){
			appAPI.db.async.getExpiration('key').then(function (res){
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
		console.log("Post request test result: ", appAPI.JSON.parse(response), additionalInfo);
	})
	.fail(function (httpCode){
		console.log("Post request test result(fail): ", httpCode);
});