let jwt = require('jsonwebtoken');

module.exports = {
  isLoggedIn: async (req, res, next) => {
    let token = req.headers.authorization;
    if (!token) {
      return res.status(400).json({ error: 'token required' });
    }

    try {
      let payload = await jwt.verify(token, process.env.SECRET);
      req.user = payload;
      next();
    } catch (error) {
      next(error);
    }
  },
  isAdmin: async (req, res, next) => {
    let token = req.headers.authorization;
    if (!token) {
      return res.status(400).json({ error: 'token required' });
    }

    try {
      let payload = await jwt.verify(token, process.env.SECRET);
      if (!payload.isAdmin) {
        return res.status(400).json({ error: 'You have to loggedin as Admin' });
      }
      req.user = payload;
      next();
    } catch (error) {
      next(error);
    }
  },
};
