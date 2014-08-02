'use strict';

var should = require('should'),
    express = require('express'),
    api = require('../../routes/api'),
    request = require('supertest'),
    sinon = require('sinon');

var app = express();

app.get('/api/users/:id', api.getUser);

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
});
