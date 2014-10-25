var parse = require('csv-parse');

var makeIsoDate = function(dateStr, timeStr) {
  var year = '20' + dateStr.substring(0, 2),
    month = parseInt(dateStr.substring(2, 4)) - 1,
    day = dateStr.substring(4, 6),
    hour = timeStr.substring(0, 2),
    minute = timeStr.substring(2, 4),
    second = timeStr.substring(4, 6);
  return new Date(Date.UTC(year, month, day, hour, minute, second)).toISOString();
};

var formatLatLng = function(latLngStr) {
  var latLng = parseFloat(latLngStr.slice(0, -1));
  var dir = latLngStr.charAt(latLngStr.length - 1);
  if (dir === 'S' || dir === 'W') {
    latLng *= -1;
  }
  return latLng;
};

exports.parse = function(data, successCb, errorCb) {
  var output = [];
  var parser = parse({columns: true});
  parser.on('readable', function() {
    var record;
    while (record = parser.read()) {
      var timestamp = makeIsoDate(record.DATE, record.TIME);
      var lat = formatLatLng(record['LATITUDE N/S']);
      var lng = formatLatLng(record['LONGITUDE E/W']);
      output.push({
        timestamp: timestamp,
        lat: lat,
        lng: lng
      });
    }
  });
  parser.on('error', function(err) {
    errorCb(err);
  });
  parser.on('finish', function() {
    successCb(output);
  });
  parser.write(data);
  parser.end();
};
