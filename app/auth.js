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
        res.send(401);
        return;
      }
      if (typeof db === 'undefined') {
        res.send(500);
        return;
      }
      var id = req.session.user_id;
      db.collection('roles').findOne({"_id": id, "roles": role}, {fields: {_id: 1}}, function(err, roles) {
        if (err) {
          return res.send(500);
        }
        if (roles === null) {
          return res.send(401);
        }
        next();
      });
    }
  };
};
