'use strict';

var should = require('should'),
  sinon = require('sinon'),
  authModule = require('../../auth');

describe('Auth', function() {
  var auth;
  var unexpectedNext = function(done) {
    return function() {
      done(new Error('should not call next'));
    };
  };

  beforeEach(function() {
    auth = authModule();

    var collection = {};
    collection.findOne = sinon.stub();
    collection.findOne.withArgs(sinon.match({_id: '123'}), sinon.match.func).yieldsAsync(null, {_id: 123, name: 'test user'});
    collection.findOne.withArgs(sinon.match({_id: '125'}), sinon.match.func).yieldsAsync({}, null);
    collection.findOne.withArgs(sinon.match.object, sinon.match.func).yieldsAsync(null, null);
    var db = {};
    db.collection = sinon.stub();
    db.collection.returns(collection);
    auth.connectDb(db);
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

  it('should send 401 if user_id in the session is not a user', function(done) {
    auth.doAuth({
      path: '/other',
      session: {
        user_id: '124'
      }
    }, {
      status: function(status) {
        status.should.equal(401);
        done();
      }
    }, unexpectedNext(done));
  });

  it('should send 500 if an error occurs querying the database', function(done) {
    auth.doAuth({
      path: '/other',
      session: {
        user_id: '125'
      }
    }, {
      status: function(status) {
        status.should.equal(500);
        done();
      }
    }, unexpectedNext(done));
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
    }, unexpectedNext(done));
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
    }, unexpectedNext(done));
  });
});
