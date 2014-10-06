var googleapis = require('googleapis'),
  https = require('https');

var REDIRECT_URL = 'postmessage';
var oauth2Client = new googleapis.OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET, REDIRECT_URL);

var db;

exports.connectDb = function(connection) {
  db = connection;
};

exports.index = function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
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
            return res.json(401, {error: err});
          }
          successCallback(profile);
        });
    });
  });
}

function updateUser(profile, callback) {
  profile._id = profile.id;
  delete profile.id;
  db.collection('users').findAndModify({"_id": profile._id}, null, profile, {upsert: true, new: true}, callback);
}
// exposed for testing
exports.updateUser = updateUser;

exports.connect = function(req, res) {
  if ('user_id' in req.session) {
    return res.json(200, {"id": req.session.user_id});
  }

  var connectCredentials = req.body;
  if ('error' in connectCredentials) {
    return res.json(401, {error: connectCredentials.error});
  }
  if ('code' in connectCredentials) {
    exchangeCode(connectCredentials.code, res, function(profile) {
      req.session.user_id = profile.id;
      updateUser(profile, function(err, user) {
        if (err) {
          return res.json(500, {name: err.name, msg: err.message});
        }
        return res.json(200, {"id": req.session.user_id});
      });
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

  req.session.user_id = undefined;
  var url = 'https://accounts.google.com/o/oauth2/revoke?token=' + oauth2Client.credentials.access_token;
  https.get(url, function() {
    res.send(200);
  }).on('error', function(e) {
    return res.json(401, {error: 'Failed to revoke access'});
  });
};

exports.getUser = function(req, res) {
  var id = req.params.id;
  db.collection('users').findOne({"_id": id}, function(err, user) {
    if (err) {
      return res.json(500, {name: err.name, msg: err.message});
    }
    if (user === null) {
      return res.json(404, {msg: 'no user found for ' + id});
    }
    return res.json(200, user);
  });
};

exports.removeUser = function(req, res) {
  var id = req.params.id;
  db.collection('users').remove({"_id": id}, function(err, numRemoved) {
    if (err) {
      return res.json(500, {name: err.name, msg: err.message});
    }
    if (numRemoved === 0) {
      return res.json(404, {msg: 'no user found for ' + id});
    }
    console.log('removed ' + numRemoved + ' for id ' + id);
    return res.status(204).end();
  });
};
