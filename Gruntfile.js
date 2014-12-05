'use strict';

module.exports = function(grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Configurable paths for the application
  var appConfig = {
    app: require('./bower.json').appPath || 'public',
    dist: 'dist'
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: appConfig,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: ['<%= yeoman.app %>/js/{,*/}*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: true
        }
      },
      mochaTest: {
        files: ['test/server/{,*/}*.js'],
        tasks: [/*'env:test', */'newer:jshint:test', 'mochaTest']
      },
      jsTest: {
        files: ['test/client/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        files: [
          '<%= yeoman.app %>/**/*'
        ],
        options: {
          livereload: true
        }
      },
      express: {
        files: [
          'server.js',
          'app/**/*.js',
          'routes/**/*.js'
        ],
        tasks: ['newer:jshint:server', 'express:dev', 'wait'],
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
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      server: {
        options: {
          jshintrc: '.jshintrc_server'
        },
        src: ['server.js', 'app/{,*/}*.js', 'routes/{,*/}*.js']
      },
      all: [
        '<%= yeoman.app %>/js/{,*/}*.js'
      ],
      test: {
        options: {
          jshintrc: 'test/client/.jshintrc'
        },
        src: ['test/*/spec/{,*/}*.js']
      }
    },

    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= yeoman.dist %>/{,*/}*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      }
    },

    wiredep: {
      app: {
        src: ['<%= yeoman.app %>/index.html'],
        ignorePath:  /..\//
      }
    },

    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.html',
            'views/{,*/}*.html'
          ]
        }]
      }
    },

    karma: {
      unit: {
        configFile: 'test/karma.conf.js',
        singleRun: true
      }
    },

    mochaTest: {
      options: {
        reporter: 'spec'
      },
      src: ['test/server/**/*.js']
    },

    mochacov: {
      options: {
        instrument: true,
        reporter: 'mocha-lcov-reporter',
        output: 'coverage/mocha/lcov.info'
      },
      server: ['test/server/**/*.js']
    },

    env: {
      test: {
        NODE_ENV: 'test'
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
        'wiredep',
        'express:dev',
        'open',
        'watch'
      ]);
  });

  grunt.registerTask('test', function(target) {
    if (target === 'server') {
      return grunt.task.run([
        'env:test',
        'mochaTest',
        'mochacov'
      ]);
    }
    if (target === 'client') {
      return grunt.task.run([
        'karma'
      ]);
    } else {
      grunt.task.run([
        'test:server',
        'test:client'
      ]);
    }
  });

  grunt.registerTask('build', [
    'clean:dist',
    'wiredep',
    'copy:dist'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};
