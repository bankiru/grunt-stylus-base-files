/*
 * grunt-stylus-deps
 * https://github.com/alright/grunt-stylus-deps
 *
 * Copyright (c) 2013 Alright
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
	// Modules
	var path = require('path');

	grunt.registerMultiTask('stylusbasefiles', 'stylus-deps is a node module for generation dependency trees of Stylus files. Used mostly for grunt-contrib-watch.', function () {
		/*  prepare options  */
		var options = this.options({
			paths: []
		});

		grunt.verbose.writeflags(options, "Options");

		var imports = [];
		var files = [];

		this.files.forEach(function (file) {
			try {
				/*  start with an empty object  */
				file.src.forEach(function (src) {
					files.push(path.resolve(src));

					if (!grunt.file.exists(src))
						throw 'Source file "' + src.red + '" not found.';
					else {
						var found_imports = findImports(src, options);
						grunt.log.debug("found " + found_imports.length + " @import directives in file \"" + src.green + "\"");
						imports = imports.concat(found_imports);
					}
				});
			}
			catch (e) {
				grunt.fail.warn(e);
			}
		});

		var configPath = ((this.target == 'files' ? this.name : this.nameArgs) + ':dest').split(':');
		files = files.filter(function(file) {
			var isBaseFile = (imports.indexOf(file) == -1);
			if (isBaseFile) {
				grunt.log.writeln('File ' + file.cyan + ' recognized as base Stylus file.');
			}
			return isBaseFile;
		});

		grunt.config(configPath, files);

		grunt.log.ok('Found ' + files.length.toString().cyan + ' base stylus files');
	});

	// Search for imports
	var findImports = function (src, options) {

		var regexString = '@import\\s+["\']([^?*:;{}"]+?)["\']';
		var regex = new RegExp(regexString);
		var regexGlob = new RegExp(regexString, 'g');
		var regexComments = new RegExp('(\\/\\*(.|\n)*?\\*\/|\/\/\\s*.*)', 'g');
		var imports = [];
		var data;

		var addImport = function(filename) {
			if (filename === 'nib' || filename === null) {
				return;
			}

			filename = path.resolve(filename);

			if (imports.indexOf(filename) === -1) {
				imports.push(filename);
			}
		};


		try { data = grunt.file.read(src); }
		catch (e) { grunt.fail.warn(e); return []; }

		var paths = options.paths;
		paths.push(path.dirname(src));

		data = String(data).replace(regexComments, '');

		var search = data.match(regexGlob);

		if (!search) {
			return [];
		}

		search.forEach(function (value) {
			var filename = value.match(regex)[1] + '.styl';

			if (grunt.file.exists(path.resolve(filename))) {
				addImport(filename);
			}

			paths.forEach(function (paths_item) {
				var filename_in_path = path.join(paths_item, filename);
				if (grunt.file.exists(path.resolve(filename_in_path))) {
					addImport(filename_in_path);
				}
			});
		});

		return imports;
	};
};
