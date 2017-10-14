module.exports = function(config) {
  config.set({
    //根目录
    basePath: '',
    //mocha框架
    frameworks: ['mocha'],
    //注入静态脚本
    files: [
      'node_modules/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'src/*.js',
      'test/*.mocha.js'
    ],

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    preprocessors: {
      'src/*.js': ['coverage']
    },

    coverageReporter: {
      type: 'text-summary',
      dir: 'coverage/'
    },

    // test results reporter to use
    reporters: ['progress', 'coverage'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests on file changes
    autoWatch: true,

    // start these browsers
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};


frameworks: ['mocha'],
    reporters: ['progress'],
    browsers: ['Chrome'],
    autoWatch: true,

    // these are default values anyway
    singleRun: false,
    colors: true,
    
    files : [
      //3rd Party Code
      'bower_components/angular/angular.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angularjs-scope.safeapply/src/Scope.SafeApply.js',
      'app/scripts/lib/router.js',

      //App-specific Code
      'app/scripts/config/config.js',
      'app/scripts/services/**/*.js',
      'app/scripts/directives/**/*.js',
      'app/scripts/controllers/**/*.js',
      'app/scripts/filters/**/*.js',
      'app/scripts/config/routes.js',
      'app/scripts/app.js',

      //Test-Specific Code
      'node_modules/chai/chai.js',
      'test/lib/chai-should.js',
      'test/lib/chai-expect.js'
    ]