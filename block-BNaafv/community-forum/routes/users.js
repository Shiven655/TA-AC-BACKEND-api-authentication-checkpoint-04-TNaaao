module.exports = router;
var express = require('express');
const auth = require('../middlewares/auth');
let Profile = require('../models/User');

var router = express.Router();

var User = require('../models/Profile');

/* register user */
router.post('/register', async function (req, res, next) {
  let data = req.body;
  try {
    let user = await User.create(data);
    let token = await user.createToken();

    res.json({ user: user.userJSON(token) });
  } catch (error) {
    next(error);
  }
});

//login user

router.post('/login', async function (req, res, next) {
  let { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'email/password required' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'user is not registered' });
    }

    let result = await user.verifyPassword(password);

    if (!result) {
      return res.status(400).json({ error: 'incorrect password' });
    }

    let token = await user.createToken();

    res.json({ user: user.userJSON(token) });
  } catch (error) {
    next(error);
  }
});

//get current user

router.get('/current-user', auth.isLoggedIn, async (req, res, next) => {
  let payload = req.user;
  let token = req.headers.authorization;
  try {
    let user = await User.findOne({ username: payload.username });
    res.json({ user: user.userJSON(token) });
  } catch (error) {
    next(error);
  }
});

//follow user

router.get('/follow/:userId', auth.isLoggedIn, async (req, res, next) => {
  let userId = req.params.userId;
  let loggedprofile = req.user;
  try {
    let loggedUser = await User.findOne({ username: loggedprofile.username });
    console.log(loggedUser.following.includes(userId));
    if (userId === loggedUser.id) {
      return res.status(400).json({ error: 'you cannot follow yourself' });
    } else if (loggedUser.following.includes(userId)) {
      return res
        .status(400)
        .json({ error: 'you can not follow same person twice' });
    } else {
      let updatedTargetUser = await User.findByIdAndUpdate(userId, {
        $push: { followers: loggedUser.id },
      });

      let updatedUser = await User.findByIdAndUpdate(loggedUser.id, {
        $push: { following: userId },
      });

      return res.json({ updatedUser, updatedTargetUser });
    }
  } catch (error) {
    next(error);
  }
});

//unfollow user

router.get('/unfollow/:userId', auth.isLoggedIn, async (req, res, next) => {
  let userId = req.params.userId;
  let loggedprofile = req.user;
  try {
    let loggedUser = await User.findOne({ username: loggedprofile.username });

    if (userId === loggedUser.id) {
      return res.status(400).json({ error: 'you cannot unfollow yourself' });
    } else if (!loggedUser.following.includes(userId)) {
      return res
        .status(400)
        .json({ error: 'you can not follow same person twice' });
    } else {
      let updatedTargetUser = await User.findByIdAndUpdate(userId, {
        $pull: { followers: loggedUser.id },
      });

      let updatedUser = await User.findByIdAndUpdate(loggedUser.id, {
        $pull: { following: userId },
      });

      return res.json({ updatedUser, updatedTargetUser });
    }
  } catch (error) {
    next(error);
  }
});

//block user by admin

router.get('/block/:username', auth.isAdmin, async (req, res, next) => {
  let username = req.params.username;

  try {
    let updateduser = await User.findOneAndUpdate(
      { username },
      { isBlocked: true }
    );

    let updatedProfile = await Profile.findOneAndUpdate(
      { username },
      { isBlocked: true }
    );

    return res.json({ updatedProfile });
  } catch (error) {
    next(error);
  }
});

//unblock user by admin

router.get('/unblock/:username', auth.isAdmin, async (req, res, next) => {
  let username = req.params.username;

  try {
    let updateduser = await User.findOneAndUpdate(
      { username },
      { isBlocked: false }
    );

    let updatedProfile = await Profile.findOneAndUpdate(
      { username },
      { isBlocked: false }
    );

    return res.json({ updatedProfile });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
