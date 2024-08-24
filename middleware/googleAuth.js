module.exports = (req, res, next) => {
  req
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect(process.env.LOGIN_URL);
    }
  };