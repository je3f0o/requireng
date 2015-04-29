
"use strict";

define([
	"modules/filters_module",
	"modules/services_module",
	"modules/factories_module",
	"modules/directives_module",
	"modules/controllers_module",

	DEPENDENCIES
], function () {
	var args        = Array.prototype.slice.call(arguments),
		depends     = args.slice(0, 5),
		states      = args.slice(5),
		module_name = MODULE_NAME;

	angular
		.module(module_name, depends)
		.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {
			$locationProvider.html5Mode({
				enabled     : true,
				requireBase : false
			});
			$urlRouterProvider.otherwise("/app/error/404/Not-Found");

			$stateProvider
				METHODS;
		});
	
	return module_name;
});
