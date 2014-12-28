var fs = require('fs'),
  googleapis = require('googleapis'),
  https = require('https'),
  multiparty = require('multiparty'),
  ObjectID = require('mongodb').ObjectID,
  parser = require('../../app/parser'),
  slug = require('slug');

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

exports.listFiles = function(req, res) {
  db.collection('files').find({}).toArray(function(err, files) {
    if (err) {
      return res.json(500, {name: err.name, msg: err.message});
    }
    for (var i = 0; i < files.length; i++) {
      files[i].id = files[i]._id;
      delete files[i]._id;
    }
    return res.json(200, files);
  });
};

function findUploadedFiles(errorCb, filesCb) {
  db.collection('files').find({state: 'uploaded'}).toArray(function(err, files) {
    if (err) {
      return errorCb(err);
    }
    filesCb(files);
  });
}

function parseFile(file, errorCb, rawCb) {
  db.collection('files').findAndModify({"_id": file._id, state: 'uploaded'}, null, {"$set": {state: "parsing"}}, function(err, file) {
    if (err) {
      errorCb(err);
    }
    rawCb(file.raw, function(parsed) {
      var path = {
        _id: file._id,
        filename: file.name,
        points: parsed
      };
      db.collection('paths').insert(path, function(err, result) {
        if (err) {
          errorCb(err);
        }
        if (result.length !== 1) {
          console.log('expected one path to be inserted, not ' + result.length);
        }
        console.log('saved path ' + result[0].filename + ' with ' + result[0].points.length + ' points');
        db.collection('files').findAndModify({"_id": file._id}, null, {"$set": {state: "parsed"}, "$unset": {raw: 1}}, {new: true}, function(err, file) {
          if (err) {
            errorCb(err);
          }
          console.log('parsed file ' + file.name);
        });
      });
    }, errorCb);
  });
}

exports.uploadFiles = function(req, res) {
  var form = new multiparty.Form();

  form.parse(req, function(err, fields, formfiles) {
    var files = [];
    var uploadedFile = formfiles.uploadedFile;
    var deleteCb = function (err) {
      if (err) {
        console.error('could not delete ' + err.path);
        console.error(err);
      }
    };
    for (var i = 0; i < uploadedFile.length; i++) {
      // TODO get async on this
      var content = fs.readFileSync(uploadedFile[i].path, {options: {encoding: 'String'}});
      files.push({
        name: uploadedFile[i].originalFilename,
        raw: content.toString(),
        state: 'uploaded',
        uploaded: new Date()
      });
      fs.unlink(uploadedFile[i].path, deleteCb);
    }
    db.collection('files').insert(files, function(err, result) {
      if (err) {
        return res.json(500, {name: err.name, msg: err.message});
      }
      console.log('uploaded ' + result.length + ' files');
      findUploadedFiles(function(err) {
        // do something better here
        console.log(err);
      }, function(files) {
        var errorHandler = function(err) {
          // do something better here
          console.log(err);
        };
        // TODO is any of this async? should it be?
        for (var i = 0; i < files.length; i++) {
          parseFile(files[i], errorHandler, parser.parse);
        }
      });
      return res.status(204).end();
    });
  });
};

exports.listPaths = function(req, res) {
  db.collection('paths').find({}, {filename: 0, "points.timestamp": 0}).toArray(function(err, paths) {
    if (err) {
      return res.json(500, {name: err.name, msg: err.message});
    }
    for (var i = 0; i < paths.length; i++) {
      paths[i].id = paths[i]._id;
      delete paths[i]._id;
    }
    return res.json(200, paths);
  });
};

exports.saveTrip = function(req, res) {
  var trip = req.body;
  var tripId = slug(trip.name);
  db.collection('trips').update({_id: tripId, name: trip.name}, {_id: tripId, name: trip.name}, {upsert: true}, function(err) {
    if (err) {
      return res.json(500, {name: err.name, msg: err.message});
    }
    var pathIds = [];
    trip.paths.forEach(function(id) {
      pathIds.push(new ObjectID(id));
    });
    db.collection('paths').update({_id: {$in: pathIds}}, {"$set": {"trip": tripId}}, {"multi": true}, function(err, modified) {
      if (err) {
        return res.json(500, {name: err.name, msg: err.message});
      }
      console.log('set trip to ' + tripId + ' on ' + modified + ' paths');
      return res.status(204).end();
    });
  });
};
