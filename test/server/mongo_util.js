'use strict';

var should = require('should'),
  mongoUtil = require('../../app/mongo_util');

describe('MongoUtil', function() {
  describe('demongofy_ids', function() {
    it('should change _id to id in documents', function() {
      var result = mongoUtil.demongofy_ids([
        {"_id": "1", "name": "a"},
        {"_id": "2", "name": "b"}
      ]);
      result.should.eql([
        {"id": "1", "name": "a"},
        {"id": "2", "name": "b"}
      ]);
    });

    it('should ignore documents without _id', function() {
      var result = mongoUtil.demongofy_ids([
        {"name": "a"},
        {"_id": "2", "name": "b"}
      ]);
      result.should.eql([
        {"name": "a"},
        {"id": "2", "name": "b"}
      ]);
    });

    it('should do nothing when not given an array', function() {
      var result = mongoUtil.demongofy_ids(
        {"_id": "2", "name": "b"}
      );
      result.should.eql(
        {"_id": "2", "name": "b"}
      );
    });
  });
});
