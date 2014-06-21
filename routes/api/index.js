var googleapis = require('googleapis'),
  https = require('https');

var REDIRECT_URL = 'postmessage';
var oauth2Client = new googleapis.OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET, REDIRECT_URL);

exports.index = function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
};

exports.connect = function(req, res) {
  if ('user_id' in req.session) {
    return res.json(200, {"id": req.session['user_id']});
  }

  var connectCredentials = req.body;
  if ('error' in connectCredentials) {
    return res.json(401, {error: connectCredientials.error});
  }
  if ('code' in connectCredentials) {
    exchangeCode(connectCredentials['code'], res, function(profile) {
      req.session['user_id'] = profile['id'];
      return res.json(200, profile);
    });
  } else if ('access_token' in connectCredentials) {
    return res.json(500, {error: 'access_token not supported'});
  } else {
    return res.json(500, {error: 'code or access_token not found'});
  }
};

exports.disconnect = function(req, res) {
  if (!('user_id' in req.session)) {
    return res.json(401, {error: 'not logged in'});
  }

  req.session['user_id'] = undefined;
  var url = 'https://accounts.google.com/o/oauth2/revoke?token=' + oauth2Client.credentials.access_token;
  https.get(url, function() {
    res.send(200);
  }).on('error', function(e) {
    return res.json(401, {error: 'Failed to revoke access'});
  });
};

function exchangeCode(code, res, successCallback) {
  oauth2Client.getToken(code, function(err, tokens) {
    if (err) {
      return res.json(401, {error: err});
    }
    oauth2Client.credentials = tokens;
    googleapis.discover('oauth2', 'v2').execute(function(err, client) {
      if (err) {
        return res.json(500, {error: err});
      }
      client.oauth2.userinfo.get()
        .withAuthClient(oauth2Client)
        .execute(function(err, profile) {
          if (err) {
            return res.json(401, {error: error});
          }
          successCallback(profile);
        });
    });
  });
}