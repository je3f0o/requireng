/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name  : module.js
* Purpose    :
* Created at : 2015-04-29
* Updated at : 2015-04-30
* Author     : jeefo
_._._._._._._._._._._._._._._._._._._._._.*/

"use strict";

var path            = require("path"),
	pluralize       = require("pluralize"),
	TEMPLATE_DIR    = path.join(__dirname, "templates"),
	JS_TEMPLATE_DIR = path.join(TEMPLATE_DIR, "js");

module.exports = function Module (module_type, has_template) {
	var module_configs  = {
			filter     : {},
			factory    : {},
			service    : {},
			state      : { has_template : has_template },
			directive  : { has_template : has_template },
			controller : { has_template : has_template }
		},

		module        = module_configs[module_type],
		template_name = module_type === "state" ? "module_config" : "module";

	return {
		type                 : module_type,
		dir                  : pluralize(module_type),
		suffix               : module_type.capitalize(),
		has_template         : module.has_template,
		template_path        : path.join(JS_TEMPLATE_DIR, module_type + ".tmpl.js"),
		module_template_path : path.join(JS_TEMPLATE_DIR, template_name + ".tmpl.js")
	};
};
