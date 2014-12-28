'use strict';

var should = require('should'),
    express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    MemoryStore = require('express-session/session/memory'),
    Cookie = require("express-session/session/cookie"),
    cookieSignature = require("cookie-parser/node_modules/cookie-signature"),
    api = require('../../routes/api'),
    request = require('supertest'),
    sinon = require('sinon');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
var sessionStore = new MemoryStore;
app.use(session({store: sessionStore, secret: 'so secret'}));

app.get('/api/users/:id', api.getUser);
app.delete('/api/users/:id', api.removeUser);
app.post('/api/connect', api.connect);
app.post('/api/disconnect', api.disconnect);
app.get('/api/files', api.listFiles);
app.post('/api/files/upload', api.uploadFiles);
app.get('/api/paths', api.listPaths);
app.put('/api/trip', api.saveTrip);

describe('GET /api/users/:id', function() {

  before(function() {
    var usersCollection = {};
    usersCollection.findOne = sinon.stub();
    usersCollection.findOne.withArgs(sinon.match({_id: '13'}), sinon.match.func).yieldsAsync(null, {_id: 13, name: 'test user'});
    usersCollection.findOne.withArgs(sinon.match.object, sinon.match.func).yieldsAsync(null, null);
    var db = {};
    db.collection = sinon.stub();
    db.collection.withArgs('users').returns(usersCollection);
    api.connectDb(db);
  });

  it('should respond with user object', function(done) {
    request(app)
      .get('/api/users/13')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.eql({"_id": "13", "name": "test user"});
        done();
      });
  });

  it('should return 404 for non-existant user', function(done) {
    request(app)
      .get('/api/users/7')
      .expect(404)
      .expect('Content-Type', /json/)
      .end(done);
  });
});

describe('DELETE /api/users/:id', function() {

  before(function() {
    var usersCollection = {};
    usersCollection.remove = sinon.stub();
    usersCollection.remove.withArgs(sinon.match({_id: '13'}), sinon.match.func).yieldsAsync(null, 1);
    usersCollection.remove.withArgs(sinon.match.object, sinon.match.func).yieldsAsync(null, 0);
    var db = {};
    db.collection = sinon.stub();
    db.collection.withArgs('users').returns(usersCollection);
    api.connectDb(db);
  });

  it('should respond with nothing', function(done) {
    request(app)
      .delete('/api/users/13')
      .expect(204)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  it('should return 404 for non-existant user', function(done) {
    request(app)
      .delete('/api/users/7')
      .expect(404)
      .expect('Content-Type', /json/)
      .end(done);
  });
});

describe('POST /api/connect', function() {

  it('should return user id from session', function(done) {
    sessionStore.set('aSessionId', {
      'cookie': new Cookie,
      'user_id': '13'
    });
    var cookieVal = 'connect.sid=s:'
      + cookieSignature.sign('aSessionId', 'so secret');
    request(app)
      .post('/api/connect')
      .set('cookie', [cookieVal])
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.eql({"id": "13"});
        done();
      });
  });

  it('should reject connect credentials with an error', function(done) {
    request(app)
      .post('/api/connect')
      .send({'error': 'no good'})
      .expect(401)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.eql({"error": "no good"});
        done();
      });
  });

  it('should fail with an access_token for now', function(done) {
    request(app)
      .post('/api/connect')
      .send('access_token', 'abc')
      .expect(500)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.eql({"error": "access_token not supported"});
        done();
      });
  });

  it('should fail without a code or access_token', function(done) {
    request(app)
      .post('/api/connect')
      .expect(500)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.eql({"error": "code or access_token not found"});
        done();
      });
  });
});

describe('POST /api/disconnect', function() {

  it('should fail when not logged in', function(done) {
    request(app)
      .post('/api/disconnect')
      .send({'error': 'no good'})
      .expect(401)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.eql({"error": "not logged in"});
        done();
      });
  });
});

describe('updateUser', function() {

  before(function() {
    var usersCollection = {};
    usersCollection.findAndModify = sinon.stub();
    usersCollection.findAndModify.withArgs(sinon.match({_id: '13'}), null, sinon.match({_id: '13', name: 'test_user'}), sinon.match.object, sinon.match.func).yieldsAsync(null, 0);
    var db = {};
    db.collection = sinon.stub();
    db.collection.withArgs('users').returns(usersCollection);
    api.connectDb(db);
  });

  it('should update the database with the expected data', function(done) {
    api.updateUser({'id': '13', 'name': 'test_user'}, function() {
      done();
    });
  });
});

describe('GET /api/files', function() {

  function setup(err, result) {
    var find = {};
    find.toArray = sinon.stub();
    find.toArray.withArgs(sinon.match.func).yieldsAsync(err, result)
    var filesCollection = {};
    filesCollection.find = sinon.stub();
    filesCollection.find.withArgs(sinon.match({})).returns(find);
    var db = {};
    db.collection = sinon.stub();
    db.collection.withArgs('files').returns(filesCollection);
    api.connectDb(db);
  }

  it('should return an empty list when there are no files', function(done) {
    setup(null, []);
    request(app)
      .get('/api/files')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.eql([]);
        done();
      });
  });

  it('should return a list of files', function(done) {
    setup(null, [{'_id': '1', 'name': '1.csv'}, {'_id': '2', 'name': '2.csv'}]);
    request(app)
      .get('/api/files')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.eql([{"id": "1", "name": "1.csv"}, {"id": "2", "name": "2.csv"}]);
        done();
      });
  });

  it('should return error details when something goes wrong', function(done) {
    setup({'name': 'error1', 'message': 'failed hard'}, null);
    request(app)
      .get('/api/files')
      .expect(500)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.eql({"name": "error1", "msg": "failed hard"});
        done();
      });
  });
});

describe('POST /api/files/upload', function() {

  var filesCollection;
  var docMatcher = function(expected) {
    if (!Array.isArray(expected)) {
      throw new Error('expected an array');
      return null;
    }
    return sinon.match(function(value) {
      if (!Array.isArray(value)) {
        return false;
      }
      if (value.length !== expected.length) {
        return false;
      }
      for (var i = 0; i < value.length; i++) {
        if (value[i].name !== expected[i].name) {
          return false;
        }
        if (typeof value[i].raw === 'undefined') {
          return false;
        }
      }
      return true;
    }, "docMatcher");
  }

  beforeEach(function() {
    filesCollection = {};
    filesCollection.insert = sinon.stub();
    filesCollection.find = sinon.stub();
    var toArray = sinon.stub();
    toArray.withArgs(sinon.match.func).yieldsAsync(null, [{_id: '001', name: '14103101.CSV'}]);
    filesCollection.find.withArgs(sinon.match({state: 'uploaded'})).returns({toArray: toArray});
    filesCollection.findAndModify = sinon.stub();
    filesCollection.findAndModify.withArgs({"_id": "001"}, null, sinon.match.object, sinon.match.func).yieldsAsync(null, {_id: '001', raw: 'abc'});

    var pathsCollection = {};
    pathsCollection.insert = sinon.stub();
    pathsCollection.insert.withArgs(sinon.match.object, sinon.match.func).yieldsAsync(null, [{}]);

    var db = {};
    db.collection = sinon.stub();
    db.collection.withArgs('files').returns(filesCollection);
    db.collection.withArgs('paths').returns(pathsCollection);
    api.connectDb(db);
  });

  it('should upload a single file', function(done) {
    filesCollection.insert.withArgs(docMatcher([{name: 'api.js'}]), sinon.match.func).yieldsAsync(null, [{}]);
    request(app)
      .post('/api/files/upload')
      .attach('uploadedFile', 'test/server/api.js')
      .expect(204)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  it('should upload multiple files', function(done) {
    filesCollection.insert.withArgs(docMatcher([{name: 'api.js'}, {name: 'api.js'}]), sinon.match.func).yieldsAsync(null, [{}, {}]);
    request(app)
      .post('/api/files/upload')
      .attach('uploadedFile', 'test/server/api.js')
      .attach('uploadedFile', 'test/server/api.js')
      .expect(204)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  it('should return a server error when insert fails', function(done) {
    filesCollection.insert.withArgs(docMatcher([{name: 'api.js'}]), sinon.match.func).yieldsAsync({name: 'error', message: 'failed'}, null);
    request(app)
      .post('/api/files/upload')
      .attach('uploadedFile', 'test/server/api.js')
      .expect(500)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.eql({"name": "error", "msg": "failed"});
        done();
      });
  });
});

describe('GET /api/paths', function() {

  var paths= [
    {"_id": "001", "filename": "14110200.CSV", "points": [{"timestamp": "2014-11-02T14:12:34.000Z", "lat": 12.345678, "lng": -123.456789}]},
    {"_id": "002", "filename": "14110201.CSV", "points": [{"timestamp": "2014-11-02T14:33:17.000Z", "lat": -23.456789, "lng": 112.345678}]}
  ];

  before(function() {
    var find = {};
    find.toArray = sinon.stub();
    find.toArray.withArgs(sinon.match.func).yieldsAsync(null, paths);
    var pathsCollection = {};
    pathsCollection.find = sinon.stub();
    pathsCollection.find.withArgs(sinon.match({}), sinon.match.object).returns(find);
    var db = {};
    db.collection = sinon.stub();
    db.collection.withArgs('paths').returns(pathsCollection);
    api.connectDb(db);
  });

  it('should respond with a list of paths', function(done) {
    request(app)
      .get('/api/paths')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.eql(paths);
        done();
      });
  });
});

describe('POST /api/trip', function() {

  var tripsCollection = {},
    pathsCollection = {};

  beforeEach(function() {
    tripsCollection.update = sinon.stub();
    tripsCollection.update.withArgs(sinon.match({"_id": "trip0", "name": "trip0"}), sinon.match({"_id": "trip0", "name": "trip0"}), {"upsert": true}, sinon.match.func).yieldsAsync({name: 'error', message: 'duplicate ID'}, null);
    tripsCollection.update.withArgs(sinon.match.object, sinon.match.object, {"upsert": true}, sinon.match.func).yieldsAsync(null, {});

    pathsCollection.findAndModify = sinon.stub();
    pathsCollection.findAndModify.withArgs(sinon.match({"_id": {$in: ["1"]}}), null, sinon.match.object, sinon.match.func).yieldsAsync({name: 'error', message: 'failed'}, null);
    pathsCollection.findAndModify.withArgs(sinon.match.object, null, sinon.match.object, sinon.match.func).yieldsAsync(null, {});

    var db = {};
    db.collection = sinon.stub();
    db.collection.withArgs('trips').returns(tripsCollection);
    db.collection.withArgs('paths').returns(pathsCollection);
    api.connectDb(db);
  });

  it('should return a server error and not update paths if trip update failed', function(done) {
      request(app)
        .put('/api/trip')
        .send({name: 'trip0', paths: ["0"]})
        .expect(500)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.eql({"name": "error", "msg": "duplicate ID"});
          sinon.assert.calledWith(tripsCollection.update, sinon.match({"_id": "trip0", "name": "trip0"}), sinon.match({"_id": "trip0", "name": "trip0"}), {"upsert": true}, sinon.match.func);
          sinon.assert.notCalled(pathsCollection.findAndModify);
          done();
        });
  });

  it('should add the trip and the trip to the paths', function(done) {
    request(app)
      .put('/api/trip')
      .send({name: 'trip1', paths: ["2", "3"]})
      .expect(204)
      .end(function(err, res) {
        if (err) return done(err);
        sinon.assert.calledWith(tripsCollection.update, sinon.match({"_id": "trip1", "name": "trip1"}), sinon.match({"_id": "trip1", "name": "trip1"}), {"upsert": true}, sinon.match.func);
        sinon.assert.calledWith(pathsCollection.findAndModify, sinon.match({"_id": {$in: ["2", "3"]}}), null, sinon.match({"$set": {"name": "trip1"}}), sinon.match.func);
        done();
      });
  });

  it('should return a server error when paths update fails', function(done) {
    request(app)
      .put('/api/trip')
      .send({name: 'trip1', paths: ["1"]})
      .expect(500)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.eql({"name": "error", "msg": "failed"});
        sinon.assert.calledWith(tripsCollection.update, sinon.match({"_id": "trip1", "name": "trip1"}), sinon.match({"_id": "trip1", "name": "trip1"}), {"upsert": true}, sinon.match.func);
        sinon.assert.calledWith(pathsCollection.findAndModify, sinon.match({"_id": {$in: ["1"]}}), null, sinon.match({"$set": {"name": "trip1"}}), sinon.match.func);
        done();
      });
  });
});
