module.exports = function(config) {
  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine', 'sinon'],

    // list of files / patterns to load in the browser
    files: [
      'http://ajax.googleapis.com/ajax/libs/angularjs/1.2.6/angular.js',
      'http://ajax.googleapis.com/ajax/libs/angularjs/1.2.6/angular-route.js',
      'https://apis.google.com/js/auth:plusone.js',
      'test/client/vendor/angular-mocks-1.2.6.js',
      'public/js/app.js',
      'public/js/services.js',
      'public/js/services/error_service.js',
      'public/js/services/paths_service.js',
      'public/js/controllers.js',
      'public/js/controllers/start_controller.js',
      'public/js/controllers/paths_controller.js',
      'public/js/controllers/map_controller.js',
      'public/js/controllers/admin_controller.js',
      'test/client/spec/controllers/paths_controller.js',
      'test/client/spec/controllers/admin_controller.js',
      'test/client/spec/services/error_service.js',
      'test/client/spec/services/paths_service.js'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - IE (only Windows)
    browsers: [
      'ChromeHeadless',
    ],

    // Which plugins to enable
    plugins: [
      'karma-coverage',
      // 'karma-chrome-launcher',
      'karma-jasmine',
      'karma-sinon'
    ],

    // coverage reporter generates the coverage
    reporters: [
      'progress',
      'coverage'
    ],

    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      'public/js/**/*.js': ['coverage']
    },

    coverageReporter: {
      reporters: [
        {type: 'text'},
        {type: 'lcov'}
      ]
    },

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
