'use strict';

var should = require('should'),
  parser = require('../../parser');

describe('Parser', function() {
  it('should parse simple file', function(done) {
    var input = 'INDEX,TAG,DATE,TIME,LATITUDE N/S,LONGITUDE E/W\n'
      + '1\0\0\0\0\0,T,120617,193517,012.345678N,123.456789W\n'
      + '2\0\0\0\0\0,T,120617,193519,023.456789S,112.345678E\n';
    parser.parse(input, function(result) {
      result.should.eql([
        {timestamp: '2012-06-17T19:35:17.000Z', lat: 12.345678, lng: -123.456789},
        {timestamp: '2012-06-17T19:35:19.000Z', lat: -23.456789, lng: 112.345678}
      ]);
      done();
    }, function(err) {
      done(err);
    });
  });

  it('should handle invalid number in lat/lng', function(done) {
    var input = 'INDEX,TAG,DATE,TIME,LATITUDE N/S,LONGITUDE E/W\n'
      + '1\0\0\0\0\0,T,120617,193517,aN,123.456789W\n'
      + '2\0\0\0\0\0,T,120617,193519,023.456789S,112.345678E\n';
    parser.parse(input, function() {
      done(new Error('Shouldn\'t get here'));
    }, function(err) {
      err.should.be.ok;
      done();
    });
  });

  it('should handle invalid date', function(done) {
    var input = 'INDEX,TAG,DATE,TIME,LATITUDE N/S,LONGITUDE E/W\n'
      + '1\0\0\0\0\0,T,12aa17,193517,012.345678N,123.456789W\n';
    parser.parse(input, function() {
      done(new Error('Shouldn\'t get here'));
    }, function(err) {
      err.should.be.ok;
      done();
    });
  });
});
