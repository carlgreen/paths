module.exports = function() {
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
        res.status(401);
        return;
      }
      if (typeof db === 'undefined') {
        res.status(500);
        return;
      }
      var id = req.session.user_id;
      db.collection('users').findOne({"_id": id}, function(err, user) {
        if (err) {
          return res.status(500);
        }
        if (user === null) {
          return res.status(401);
        }
        next();
      });
    }
  };
};
