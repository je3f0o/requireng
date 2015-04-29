/* jshint quotmark:false */
"use strict";

var fs     = require("fs"),
	path   = require("path"),
	async  = require("async"),
	mkdirp = require("mkdirp"),
	Module = require("./module"),
	utils  = require("./utilities"),

	opt    = require("node-getopt").create([
		[ "c"    , "="       , "Controller"                  ] ,
		[ "S"    , "="       , "Service"                     ] ,
		[ "F"    , "="       , "Factory"                     ] ,
		[ "d"    , "="       , "Directive"                   ] ,
		[ "f"    , "="       , "Filter"                      ] ,
		[ "s"    , "="       , "State"                       ] ,
		[ "a"    , ""        , "Abstract / without template" ] ,
		[ "u"    , ""        , "Uninstall module"            ] ,
		[ "v"    , "version" , "show version"                ] ,
		[ "h"    , "help"    , "display this help"           ]
	]).bindHelp().parseSystem(),

	BASE_DIR = process.cwd(),
	version  = "0.0.1";

var RequireJS = function () {};
var p = RequireJS.prototype;

p.bootstrap = function (callback) {
	async.waterfall(
		[
			// bootstrap
			function (cb) {
				if (opt.options.version) {
					utils.exit(null, "Version : " + version);
				} else if (opt.argv[0] === "init") {
					this.init(cb);
				} else {
					cb();
				}
			}.bind(this),
			this.init_module.bind(this),
			function (cb) {
				var state_name = opt.argv[0],
					err;

				if (this.module.type === "state") {
					this.state = this.module_name;

					if (! opt.options.u) {
						this.module_name = state_name;

						if (! state_name) {
							err = "State name required.";
						} else if (! /^[a-zA-Z]+$/.test(state_name)) {
							err = "Invalid state name '" + state_name + "'";
						}
					}
				} else if (! /^[a-zA-Z]+$/.test(this.module_name)) {
					err = "Invalid " + this.module.type + " name '" + this.module_name + "'";
				}

				cb(err);
			}.bind(this),
			function (cb) {
				var public_dir = path.join(BASE_DIR, "public");

				this.function_name             = this.module_name.capitalize();
				this.function_name_with_suffix = this.function_name + "_" + this.module.suffix; 

				this.filename_with_suffix = utils.get_filename(this);
				this.filename             = this.filename_with_suffix.replace("_" + this.module.type, "");

				this.require_json_path = path.join(BASE_DIR, "requireng.json");
				this.require_json      = require(this.require_json_path);

				this.js_dir  = path.join(public_dir, "js");
				this.js_path = path.join(this.js_dir, this.module.dir, this.filename_with_suffix + ".js");
				
				if (this.module.has_template) {
					this.html_dir  = path.join(public_dir, "templates")
					this.html_path = path.join(this.html_dir, this.module.dir, this.filename_with_suffix + ".html");
				}

				cb()
			}.bind(this)
		],
		callback
	);
};

p.init = function (callback) {
	var application_name = opt.argv[1];
	
	async.waterfall(
		[
			function (cb) {
				var err = null;

				if (! application_name) {
					err = "Application name required.";
				}

				cb(err);
			},
			function (cb) {
				var require_ng_path = path.join(BASE_DIR, "requireng.json"),
					require_ng_json;

				if (! fs.existsSync(require_ng_path)) {
					require_ng_json = {
						appication_name : application_name,
						base_dir        : "public/js",
						output_path     : "public/js/app",
						router_manager  : "modules/main_module",
						libs            : [],
						states          : [],
						filters         : {},
						services        : {},
						factories       : {},
						directives      : {},
						controllers     : {},
						dependencies    : []
					};
					fs.writeFileSync(require_ng_path, JSON.stringify(require_ng_json, null, 4));
					utils.done();
				} else {
					cb("RequireNG is already initialized or requireng.json file exists.");
				}
			}
		],
		callback
	);
};

p.init_module = function (callback) {
	async.waterfall(
		[
			function (cb) {
				var selected_opts = [],
					err, module_type;

				if (opt.options.s) { this.module_name = opt.options.s; selected_opts.push("state");      }
				if (opt.options.f) { this.module_name = opt.options.f; selected_opts.push("filter");     }
				if (opt.options.F) { this.module_name = opt.options.F; selected_opts.push("factory");    }
				if (opt.options.S) { this.module_name = opt.options.S; selected_opts.push("service");    }
				if (opt.options.d) { this.module_name = opt.options.d; selected_opts.push("directive");  }
				if (opt.options.c) { this.module_name = opt.options.c; selected_opts.push("controller"); }

				if (! selected_opts.length) {
					err = "[-c, -f, -F, -S, -d, -s] one of those options must be set.";
				} else if (selected_opts.length > 1) {
					err = "Ambiguous modules selected -> [" + selected_opts.join(", ") + "].";
				} else {
					module_type = selected_opts[0];
				}

				cb(err, module_type);
			}.bind(this),
			function (module_type, cb) {
				this.module = new Module(module_type, ! opt.options.a);
				cb();
			}.bind(this)
		],
		callback
	);
};

p.do_action = function (callback) {
	if (opt.options.u) {
		this.uninstall(callback);
	} else {
		this.install(callback);
	}
};

p.install = function (callback) {
	async.waterfall(
		[
			function (cb) {
				var is_module_exist = !! this.require_json[this.module.dir][this.function_name],
					err;

				is_module_exist = is_module_exist || fs.existsSync(this.js_path);
				is_module_exist = is_module_exist || fs.existsSync(this.html_path);
				
				err = is_module_exist ? "Sorry, this module is alrady exists." : null;

				cb(err);
			}.bind(this),
			// install module
			function (cb) {
				var dir      = path.dirname(this.js_path),
					template = "<h1>" + this.function_name_with_suffix + "</h1>",
					template_content;

				if (! fs.existsSync(dir)) { mkdirp.sync(dir); }

				template_content = fs.readFileSync(this.module.template_path).toString()
									 .replace(/OBJECT_NAME/g, this.function_name_with_suffix);
				
				if (this.module.has_template) {
					dir = path.dirname(this.html_path);
					if (! fs.existsSync(dir)) { mkdirp.sync(dir); }

					fs.writeFileSync(this.html_path, template);

					template = 'templateUrl : "/templates/' + this.module.dir + '/' + this.filename_with_suffix + '.html"';
					template_content = template_content.replace("ABSTRACT", "false");
				} else if (this.module.type === "state") {
					template = 'template : "<ui-view/>"';
					template_content = template_content.replace("ABSTRACT", "true");
				} else {
					template = 'template : "' + template + '"';
				}

				template_content = template_content.replace("TEMPLATE", template);

				if (this.module.type === "state") {
					this.require_json.states.push(this.state);
				} else {
					this.require_json[this.module.dir][this.function_name] = this.filename;
				}

				fs.writeFileSync(this.js_path, template_content);

				cb();
			}.bind(this)
		],
		callback
	);
};

p.uninstall = function (callback) {
	var function_name = this.function_name;

	async.waterfall(
		[
			function (cb) {
				var err, filename;

				if (this.module.type === "state") {
					this.require_json.states.forEach(function (state) {
						if (state === this.state) {
							function_name = state;
							filename      = state;
						}
					}, this);
				} else {
					filename = this.require_json[this.module.dir][function_name];
				}

				if (filename === void 0) {
					err = function_name + " module doesn't exists.";
				}

				cb(err, filename);
			}.bind(this),
			function (filename, cb) {
				var module_type = this.module.type,
					filepath, index;

				if (this.module.has_template !== void 0) {
					if (this.state) { filename  = this.state; }
					filename += "_" + module_type;

					filepath = path.join(this.html_dir, this.module.dir, filename + ".html");
					if (fs.existsSync(filepath)) { fs.unlinkSync(filepath); }
				} else {
					filename += "_" + module_type;
				}

				filepath = path.join(this.js_dir, this.module.dir, filename + ".js");
				if (fs.existsSync(filepath)) { fs.unlinkSync(filepath); }

				if (this.state) {
					index = this.require_json[this.module.dir].indexOf(function_name);
					if (index !== -1) {
						this.require_json[this.module.dir].splice(index, 1);
					}
				} else {
					delete this.require_json[this.module.dir][function_name];
				}

				cb();
			}.bind(this)
		],
		callback
	);
};

p.update_dependencies = function (callback) {
	var dir             = this.module.dir,
		module_type     = this.module.type,
		is_state        = module_type === "state",
		indent_space    = is_state ? "\t\t\t\t" : "\t\t",
		module_filename = is_state ? "main_module.js" : dir + "_module.js",
		module_file_dir = path.join(this.js_dir, "modules"),
		module_filepath = path.join(module_file_dir, module_filename),
		module_template;

	async.waterfall(
		[
			function (cb) {
				if (is_state && fs.existsSync(module_filepath)) {
					module_template	= fs.readFileSync(module_filepath).toString();
					module_template = module_template.replace(/^[\s\t]*\.state\([^;]*/gm, indent_space + "METHODS");
					module_template = module_template.replace(/^[\s\t]*\"states\/[^\]]*/gm, "\n\tDEPENDENCIES\n");
				} else {
					module_template	= fs.readFileSync(this.module.module_template_path).toString();
				}

				cb();
			}.bind(this),
			function (cb) {
				var dir             = this.module.dir,
					has_template    = this.module.has_template,
					modules_object  = this.require_json[dir],
					suffix          = this.module.suffix,
					args            = is_state ? "states" : "arguments",
					module_keys     = is_state ? Object.keys(modules_object.sort()) : Object.keys(modules_object).sort(),
					module_name     = is_state ? "myModules" : "my" + dir.capitalize(),
					dependencies    = [],
					methods         = [];

				has_template = has_template && module_type === "state" ? false : has_template;
				
				module_keys.forEach(function (method, index) {
					var filename = modules_object[method];

					if (! is_state) {
						if (module_type === "directive") {
							method = method.uncapitalize();
						} else {
							method += "_" + suffix;
							method = utils.fix_naming(method);
						}
					}

					dependencies.push('"' + dir + '/' + filename + '_' + module_type + '"');

					if (is_state) {
						methods.push('.state("' + filename + '", ' + args + '[' + index + '])');
					} else {
						methods.push('.' + module_type + '("' + method + '", ' + args + '[' + index + '])');
					}
				});

				module_template = module_template
					.replace("DEPENDENCIES" , dependencies.join(",\n\t"))
					.replace("METHODS"      , methods.join("\n" + indent_space))
					.replace("MODULE_NAME"  , '"' + module_name + '"');

				if (! fs.existsSync(module_file_dir)) { mkdirp.sync(module_file_dir); }

				fs.writeFileSync(module_filepath, module_template);
				fs.writeFileSync(this.require_json_path, JSON.stringify(this.require_json, null, 4));

				if (opt.options.u) {
					utils.done();
				}

				fs.writeFileSync("this.json", JSON.stringify(this, null, 4));
				cb(null, this.js_path);
			}.bind(this)
		],
		callback
	);
};


var requirejs;
async.waterfall(
	[
		function (cb) {
			requirejs = new RequireJS();
			requirejs.bootstrap(cb);
		},
		function (cb) {
			requirejs.do_action(cb);
		},
		function (cb) {
			requirejs.update_dependencies(cb);
		}
	],
	function (err, path) {
		var message = err ? ("ERROR: " + err) : ("SUCCESS: " + path);
		utils.exit(err, message);
	}
);



