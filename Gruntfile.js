'use strict';

module.exports = function(grunt){

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			output: ['dist']
		},
		uglify: {
		  options: {
		    // the banner is inserted at the top of the output
		    banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
		  },
		  dist: {
		    files: {
		      	'dist/js/<%= pkg.name %>.min.js': ['src/js/angular/app.js']
		    }
		  }
		},
		cssmin: {
		  add_banner: {
		    options: {
		      banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
		    },
		    files: {
		      'dist/app.css': ['src/app.css']
		    }
		  }
		},
		copy: {
		  main: {
		    files: [
		      {expand: true, cwd: 'src/data', src: ['*'], dest: 'dist/data', filter: 'isFile'},
		      {expand: true, cwd: 'src/templates', src: ['*'], dest: 'dist/templates', filter: 'isFile'},
		      {expand: true, cwd: 'src/images', src: ['*'], dest: 'dist/images', filter: 'isFile'},
		      {expand: true, cwd: 'src/js/lib/angular/', src: ['angular.min.js'], dest: 'dist/js', filter: 'isFile'},
		      {expand: true, cwd: 'src/js/lib/angular-route', src: ['angular-route.min.js'], dest: 'dist/js', filter: 'isFile'},
		      {expand: true, cwd: 'src/js/lib/angular-local-storage', src: ['angular-local-storage.min.js'], dest: 'dist/js', filter: 'isFile'},
		      {expand: true, cwd: 'src/js/lib/underscore', src: ['underscore.js'], dest: 'dist/js', filter: 'isFile'},
		      {expand: true, cwd: 'src', src: ['index.html', 'app.css', 'icon.png', 'icon16.png', 'icon48.png', 'icon128.png', 'manifest.json'], dest: 'dist/', filter: 'isFile'},
		      {expand: true, cwd: 'src/js/lib/bootstrap/dist/css/', src: ['bootstrap.css'], dest: 'dist/', filter: 'isFile'},
		      {expand: true, cwd: 'src/js/lib/bootstrap/fonts', src: ['*'], dest: 'dist/fonts', filter:'isFile'}
		    ]
		  }
		},
		processhtml: {
		    dist: {
		      files: {
		        'dist/index.html': ['src/index.html']
		      }
		    }
	  	}
	});
	
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-processhtml');

	grunt.registerTask('default', ['clean', 'uglify', 'cssmin', 'copy', 'processhtml']);
}