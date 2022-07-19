var express = require('express');
const auth = require('../middlewares/auth');
const Profile = require('../models/Profile');
var router = express.Router();

var User = require('../models/User');
//get profile information

router.get('/:username', auth.isLoggedIn, async (req, res, next) => {
  let givenUsername = req.params.username;

  try {
    let profile = await Profile.findOne({ username: givenUsername });
    if (!profile) {
      return res.status(400).json({ error: 'invalid username' });
    }

    res.json({ profile: profile.profileJSON() });
  } catch (error) {
    next(error);
  }
});
//update profile information

router.put('/:username', auth.isLoggedIn, async (req, res, next) => {
  let givenUsername = req.params.username;

  try {
    let data = req.body;
    let updatedprofile = await Profile.findOneAndUpdate(
      { username: givenUsername },
      data
    );

    let updatedUser = await User.findOneAndUpdate(
      { username: givenUsername },
      data
    );

    res.json({ profile: updatedprofile.profileJSON() });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
