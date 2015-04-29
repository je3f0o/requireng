
"use strict";

define([], function () {

	var state = {
		url : "",
		abstract : ABSTRACT,
		TEMPLATE,
		controller : [
			"$scope", "data",
			function OBJECT_NAME ($scope, data) {

				console.log("Called : OBJECT_NAME");
			}
		],
		resolve : {
			data : [
				function () {

					return "OBJECT_NAME";
				}
			]
		}
	};

	return state;
});
