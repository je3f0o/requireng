/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name  : utilities.js
* Purpose    :
* Created at : 2015-04-29
* Updated at : 2015-04-30
* Author     : jeefo
_._._._._._._._._._._._._._._._._._._._._.*/

"use strict";

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.uncapitalize = function () {
    return this.charAt(0).toLowerCase() + this.slice(1);
};

exports.exit = function (err, message) {
	console.log(message);
	process.exit(err ? 1 : 0);
};

exports.done = function () {
	exports.exit(null, "Done!");
};

exports.fix_naming = function (str) {
	return str
			.replace(/([A-Z]+)/g, function ($1) { return "_" + $1.toLowerCase(); })
			.replace(/__/g, "_")
			.replace(/^_/, "");
};

exports.get_filename = function (reqng) {
	var filename;

	if (reqng.state) {
		filename = reqng.state + "_state";
	} else {
		filename = exports.fix_naming(reqng.function_name_with_suffix);
	}

	reqng.function_name_with_suffix = reqng.function_name_with_suffix.replace(/_+/g, "");

	return filename;
};
