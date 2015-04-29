
"use strict";

define([], function () {

	var OBJECT_NAME = [
		function OBJECT_NAME () {
			console.log("Called : OBJECT_NAME");

			return {
				restrict : "EA",
				scope : {
					data : "=data"
				},
				TEMPLATE,
				transclude : false,
				replace : true,
				link : function (scope, element, attrs) {
					
				},
				controller : [
					"$scope",
					function ($scope) {

						console.log("OBJECT_NAME is fired!");
					}
				]
			};
		}
	];

	return OBJECT_NAME;
});
