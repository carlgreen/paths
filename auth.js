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
      next();
    }
  };
};
