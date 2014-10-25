var should = require('should'),
  parser = require('../../parser.js');

describe('parsing', function() {
  it('should test something', function(done) {
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
});
