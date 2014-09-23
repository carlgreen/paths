'use strict';

var should = require('should'),
    express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    api = require('../../routes/api'),
    request = require('supertest'),
    sinon = require('sinon');

var app = express();
app.use(bodyParser());
app.use(cookieParser());
app.use(session({secret: 'so secret'}));

app.get('/api/users/:id', api.getUser);
app.delete('/api/users/:id', api.removeUser);
app.post('/api/connect', api.connect);

describe('GET /api/users/:id', function() {

  before(function() {
    var collection = {};
    collection.findOne = sinon.stub();
    collection.findOne.withArgs(sinon.match({_id: '13'}), sinon.match.func).yieldsAsync(null, {_id: 13, name: 'test user'});
    collection.findOne.withArgs(sinon.match.object, sinon.match.func).yieldsAsync(null, null);
    var db = {};
    db.collection = sinon.stub();
    db.collection.returns(collection);
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
    var collection = {};
    collection.remove = sinon.stub();
    collection.remove.withArgs(sinon.match({_id: '13'}), sinon.match.func).yieldsAsync(null, 1);
    collection.remove.withArgs(sinon.match.object, sinon.match.func).yieldsAsync(null, 0);
    var db = {};
    db.collection = sinon.stub();
    db.collection.returns(collection);
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
