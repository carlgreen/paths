module.exports = function() {
  return function(req, res, next) {
    // don't need to be authenticated to authenticate
    if (req.path === '/connect') {
      next();
      return;
    }
    if (!('user_id' in req.session)) {
      res.status(401);
      return;
    }
    next();
  };
};
