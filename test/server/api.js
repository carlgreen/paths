'use strict';

var should = require('should'),
    express = require('express'),
    api = require('../../routes/api'),
    request = require('supertest');

var app = express();

app.get('/api/users/:id', api.getUser);

describe('GET /api/users/:id', function() {

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
