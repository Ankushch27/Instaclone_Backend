const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Post = require('../models/post');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(422).json({ error: 'Please add all the fields' });
  }
  User.findOne({ email })
    .then((savedUser) => {
      if (savedUser) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }
      const user = new User(req.body);

      user
        .save()
        .then((user) => {
          // res.json({ msg: 'Signup successful' });
          res.send(user);
        })
        .catch((error) => console.log(error));
    })
    .catch((error) => console.log(error));
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(422).json({ error: 'Please add email and password' });
  }
  User.findOne({ email })
    .then((savedUser) => {
      if (!savedUser) {
        return res.status(422).json({ error: 'Invalid email or password' });
      }
      bcrypt.compare(password, savedUser.password).then(async (doMatch) => {
        try {
          if (doMatch) {
            // res.json({ msg: 'Logged in successfully' });
            const token = await savedUser.generateAuthToken();
            res.json({ user: savedUser, token });
          } else return res.status(422).json({ error: 'Invalid email or password' });
        } catch (error) {
          console.error(error);
        }
      });
    })
    .catch((error) => console.log('Login Error:', error));
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new Error();
    }
    Post.find({ postedBy: req.params.id })
      .populate('postedBy', '_id name')
      .exec((error, posts) => {
        if (error) return res.status(422).json({ error });
        else res.json({ user, posts });
      });
  } catch (error) {
    res.status(404).send();
  }
});

router.put('/follow', auth, (req, res) => {
  User.findByIdAndUpdate(
    req.body.uid,
    {
      $push: { followers: req.user._id },
    },
    { new: true },
    (error, result) => {
      if (error) return res.status(422).json({ error });
      User.findByIdAndUpdate(
        req.user._id,
        { $push: { following: req.body.uid } },
        { new: true }
      )
        .then((result) => res.json(result))
        .catch((error) => res.status(422).json({ error }));
    }
  );
});

router.put('/unfollow', auth, (req, res) => {
  User.findByIdAndUpdate(
    req.body.uid,
    {
      $pull: { followers: req.user._id },
    },
    { new: true },
    (error, result) => {
      if (error) return res.status(422).json({ error });
      User.findByIdAndUpdate(
        req.user._id,
        { $pull: { following: req.body.uid } },
        { new: true }
      )
        .then((result) => res.json(result))
        .catch((error) => res.status(422).json({ error }));
    }
  );
});

module.exports = router;
