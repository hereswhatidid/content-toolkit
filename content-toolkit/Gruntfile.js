'use strict';
module.exports = function(grunt) {

	grunt.initConfig({
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
			'assets/js/*.js',
			'assets/js/plugins/*.js',
			'!assets/js/scripts.min.js'
			]
		},
		less: {
			development: {
				options: {
					paths: ['css']
				},
				files: {
					'css/styles.dev.css' : 'css/styles.less'
				}
			},
			production: {
				options: {
					paths: ['css'],
					yuicompress: true
				},
				files: {
					'css/styles.min.css' : 'css/styles.dev.css'
				}
			}
		},
		uglify: {
			development: {
				options: {
					mangle: false,
					compress: false,
					beautify: true
				},
				files: {
					'js/scripts.dev.js': [
						'js/vendor/bootstrap.js',
						'js/vendor/knockout-2.3.0.js',
						'js/vendor/knockout.mapping-2.4.1.js',
						'js/vendor/pager.js',
						'js/scripts.js'
						]
				}
			},
			production: {
				options: {
					compress: {
						global_defs: {
							"DEBUG": false
						},
						dead_code: true
					}
				},
				files: {
					'js/scripts.min.js': [
					'js/scripts.dev.js'
					]
				}
			}
		},

		watch: {
			less: {
				files: [
				'css/styles.less'
				],
				tasks: ['less:development'],
				options: {
					spawn: false
				}
			},
			js: {
				files: [
				'js/scripts.js'
				],
				tasks: ['jshint', 'uglify:development'],
				options: {
					spawn: false
				}
			}
		},
		clean: {
			dist: [
			'css/styles.min.css',
			'js/scripts.min.js'
			]
		}
	});

	// Load tasks
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-less');
	
	// Register tasks
	grunt.registerTask('default', [
		'jshint',
		'clean',
		'uglify'
		]);
	
	grunt.registerTask('prod', [
		'jshint',
		'clean',
		'uglify:production',
		'less:production'
	]);

	grunt.registerTask('dev', [
		'watch'
		]);

};