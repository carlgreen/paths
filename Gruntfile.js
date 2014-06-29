'use strict';

module.exports = function(grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({
    // Watches files for changes and runs tasks based on the changed files
    watch: {
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        files: [
          'public/**/*'
        ],
        options: {
          livereload: true
        }
      },
      express: {
        files: [
          'server.js',
          'routes/**/*.js'
        ],
        tasks: ['express:dev', 'wait'],
        options: {
          livereload: true,
          spawn: false //Without this option specified express won't be reloaded
        }
      }
    },

    express: {
      options: {
        port: process.env.PORT || 1337
      },
      dev: {
        options: {
          script: 'server.js',
          debug: true
        }
      }
    },

    open: {
      server: {
        url: 'http://localhost:<%= express.options.port %>'
      }
    }
  });

  grunt.registerTask('wait', 'Used for delaying livereload until after server has restarted', function() {
    grunt.log.ok('Waiting for server reload...');
    var done = this.async();
    setTimeout(function() {
      grunt.log.writeln('Done waiting!');
      done();
    }, 500);
  });

  grunt.registerTask('serve', 'Compile then start an express web server', function () {
    grunt.task.run([
        'express:dev',
        'open',
        'watch'
      ]);
  });
};
