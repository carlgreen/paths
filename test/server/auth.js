'use strict';

var should = require('should'),
  authModule = require('../../auth');

describe('Auth', function() {
  var auth;

  beforeEach(function() {
    auth = authModule();
    auth.connectDb({});
  });

  it('should not do anything for /connect', function(done) {
    auth.doAuth({
      path: '/connect'
    }, {}, done);
  });

  it('should be ok if user_id is in the session', function(done) {
    auth.doAuth({
      path: '/other',
      session: {
        user_id: '123'
      }
    }, {}, done);
  });

  it('should send 401 if no user_id in the session', function(done) {
    auth.doAuth({
      path: '/other',
      session: {}
    }, {
      status: function(status) {
        status.should.equal(401);
        done();
      }
    }, null);
  });

  it('should send 500 if database is not configured', function(done) {
    // make it like it was never configured
    auth.connectDb(undefined);

    auth.doAuth({
      path: '/other',
      session: {
        user_id: '123'
      }
    }, {
      status: function(status) {
        status.should.equal(500);
        done();
      }
    }, null);
  });
});
