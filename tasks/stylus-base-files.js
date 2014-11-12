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
	var fs = require('fs');
	var _ = require('underscore');
	var path = require('path');

	// List of dependencies
	var deps = [];
	var bases = [];

	grunt.registerMultiTask('stylusbasefiles', 'stylus-deps is a node module for generation dependency trees of Stylus files. Used mostly for grunt-contrib-watch.', function () {
		var done = this.async();

		/**
		 * Available options:
		 * paths
		 * savedir
		 */
		var options = this.options();

		if (typeof options.stylus_task === 'undefined' || !options.stylus_task) {
			grunt.warn('You must specify stylus_task option.');
		}

		var stylusFilesPath = options.stylus_task.concat('files');
		options.paths = grunt.config(options.stylus_task.concat('options').concat('paths')) || [];

		grunt.util.async.forEachSeries(this.files, function (file, next) {
			var srcFile = Array.isArray(file.src) ? file.src[0] : file.src;

			if (!grunt.file.exists(srcFile)) {
				// Warn on invalid source file
				grunt.warn('Source file "' + srcFile + '" not found.');
			}

			// Proceed task
			getImports(srcFile, options, function () {
				next();
			});
		}, function () {
			filterBases();

			setStylusFiles(stylusFilesPath, function () {
				done();
			});
		});
	});

	// Search for imports
	var getImports = function (srcFile, options, callback) {

		var regexString = '@import\\s+["\']([^?*:;{}"]+?)["\']';
		var regex = new RegExp(regexString);
		var regexGlob = new RegExp(regexString, 'g');
		var regexComments = new RegExp('(\\/\\*(.|\n)*?\\*\/|\/\/\\s*.*)', 'g');

		fs.readFile(srcFile, function (err, data) {
			bases.push(path.resolve(srcFile));

			var paths = options.paths;
			paths.push(path.dirname(srcFile));
			
			data = String(data).replace(regexComments, '');

			var search = data.match(regexGlob);

			if (!search) {
				callback(null);
				return;
			}

			var value,
				filename,
				fullfilename;

			for (var key in search) {
				if (!search.hasOwnProperty(key)) {
					continue;
				}

				value = search[key];
				filename = value.match(regex)[1] + '.styl';

				if (paths.length > 0) {
					// Traverse by paths
					for (var item in paths) {
						if (!paths.hasOwnProperty(item)) {
							continue;
						}

						item = paths[item];

						fullfilename = path.resolve(path.join(item, filename));
						if (grunt.file.exists(fullfilename)) {
							addDep(fullfilename);
						}
					}
				}
				else {
					addDep(path.resolve(filename));
				}
			}

			callback();
		});

		var addDep = function (filename) {
			if (filename === 'nib') {
				return;
			}

			filename = path.resolve(filename);

			if (deps.indexOf(filename) === -1) {
				deps.push(filename);
			}
		};
	};

	var setStylusFiles = function (stylusFilesPath, callback) {
		// Save results
		if (_.isEmpty(deps)) {
			grunt.log.ok('No base stylus files are found');
			callback();
			return;
		}

		grunt.log.debug("base files: " + bases.join(', '));

		grunt.config(stylusFilesPath, _.groupBy(bases, function (base) {
			return base.replace(/\.styl$/, '.css');
		}));

		grunt.log.debug('stylusFiles: ' + JSON.stringify(grunt.config(stylusFilesPath)));

		grunt.log.ok('Found ' + bases.length + ' base stylus files');

		callback();
	};

	var filterBases = function () {
		bases = _.difference(bases, deps);
	};
};
