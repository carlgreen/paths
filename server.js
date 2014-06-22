var express = require('express'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  session = require('express-session'),
  path = require('path'),
  api = require('./routes/api');

var PathApp = function() {
  this.terminator = function(sig) {
    if (typeof sig === "string") {
        console.log('%s: Received %s - terminating paths app ...',
                Date(Date.now()), sig);
        process.exit(1);
    }
    console.log('%s: Node server stopped.', Date(Date.now()));
  };

  this.initialize = function() {
    if (process.env.SESSION_SECRET === undefined) {
      throw new Error('SESSION_SECRET is not defined');
    }
    if (process.env.CLIENT_ID === undefined) {
      throw new Error('CLIENT_ID is not defined');
    }
    if (process.env.CLIENT_SECRET === undefined) {
      throw new Error('CLIENT_SECRET is not defined');
    }

    var terminator = this.terminator;
    process.on('exit', function() {
      terminator();
    });
    ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
      'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
    ].forEach(function(element, index, array) {
      process.on(element, function() {
        terminator(element);
      });
    });

    this.app = express();
    this.app.use(bodyParser());
    this.app.use(cookieParser());
    this.app.use(session({secret: process.env.SESSION_SECRET}));
    this.app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 1337);
    this.app.use(express.static(path.join(__dirname, 'public')));

    this.app.get('/api', api.index);
    this.app.post('/api/connect', api.connect);
    this.app.post('/api/disconnect', api.disconnect);
  };

  this.start = function() {
    var port = this.app.get('port');
    var ip = process.env.OPENSHIFT_NODEJS_IP || "localhost";
    this.app.listen(port, ip, function() {
      console.log("Express server listenting on port " + port);
    });
  };
};

var theApp = new PathApp();
theApp.initialize();
theApp.start();
