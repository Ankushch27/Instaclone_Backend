const express = require('express');
const Post = require('../models/post');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/createpost', auth, (req, res) => {
  const { title, body, image } = req.body;
  if (!title || !body || !image) {
    return res.status(422).json({ error: 'Please add all the fields' });
  }
  const post = new Post({
    ...req.body,
    postedBy: req.user,
  });
  post
    .save()
    .then((data) => {
      res.json({ post: data });
    })
    .catch((error) => console.log(error));
});

router.get('/posts', auth, (req, res) => {
  Post.find()
    .populate('postedBy', '_id name')
    .populate('comments.postedBy', '_id name')
    .then((posts) => {
      res.json({ posts });
    })
    .catch((error) => console.log(error));
});

router.get('/myposts', auth, (req, res) => {
  Post.find({ postedBy: req.user._id })
    .populate('postedBy', '_id name')
    .then((myposts) => {
      res.json({ myposts });
    })
    .catch((error) => console.log(error));
});

router.put('/like', auth, (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { likes: req.user._id },
    },
    { new: true }
  )
    .populate('postedBy', '_id name')
    .exec((error, result) => {
      if (error) return res.status(422).json({ error });
      else res.json(result);
    });
});

router.put('/unlike', auth, (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $pull: { likes: req.user._id },
    },
    { new: true }
  )
    .populate('postedBy', '_id name')
    .exec((error, result) => {
      if (error) return res.status(422).json({ error });
      else res.json(result);
    });
});

router.put('/comment', auth, (req, res) => {
  const comment = {
    text: req.body.comment,
    postedBy: req.user._id,
  };
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { comments: comment },
    },
    { new: true }
  )
    .populate('comments.postedBy', '_id name')
    .exec((error, result) => {
      if (error) return res.status(422).json({ error });
      else res.json({ result });
    });
});

router.delete('/deletePost/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.postId,
      postedBy: req.user._id,
    });
    if (!post) return res.status(404).send('Post not found');
    res.send(post);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
