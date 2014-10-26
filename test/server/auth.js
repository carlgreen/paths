'use strict';

var should = require('should'),
  auth = require('../../auth')();

describe('Auth', function() {
  it('should not do anything for /connect', function(done) {
    auth({
      path: '/connect'
    }, {}, done);
  });

  it('should be ok if user_id is in the session', function(done) {
    auth({
      path: '/other',
      session: {
        user_id: '123'
      }
    }, {}, done);
  });

  it('should send 401 if no user_id in the session', function(done) {
    auth({
      path: '/other',
      session: {}
    }, {
      status: function(status) {
        status.should.equal(401);
        done();
      }
    }, null);
  });
});
