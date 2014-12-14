module.exports = function(role) {
  if (typeof role === 'undefined') {
    throw new Error('required role must be provided');
  }
  var db;
  return {
    connectDb: function(connection) {
      db = connection;
    },
    doAuth: function(req, res, next) {
      // don't need to be authenticated to authenticate
      if (req.path === '/connect') {
        next();
        return;
      }
      if (!('user_id' in req.session)) {
        res.json(401, {error: 'no user in session'});
        return;
      }
      if (typeof db === 'undefined') {
        res.json(500, {error: 'no database defined'});
        return;
      }
      var id = req.session.user_id;
      db.collection('roles').findOne({"_id": id, "roles": role}, {fields: {_id: 1}}, function(err, roles) {
        if (err) {
          console.error(err);
          return res.json(500, {error: err});
        }
        if (roles === null) {
          return res.json(401, {error: 'user does not have the \'' + role + '\' role'});
        }
        next();
      });
    }
  };
};
