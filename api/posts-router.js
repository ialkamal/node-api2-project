const express = require("express");
const db = require("./db-helpers");

const router = express.Router();

router.post("/", (req, res) => {
  const post = req.body;
  if (!post.title || !post.contents) {
    res.status(400).send({
      errorMessage: "Please provide title and contents for the post.",
    });
  } else {
    db.insert(post)
      .then((newId) => {
        res.status(201).send({ ...post, ...newId });
      })
      .catch((err) =>
        res.status(500).send({
          error: "There was an error while saving the post to the database",
        })
      );
  }
});

router.post("/:id/comments", (req, res) => {
  const comment = req.body;
  const post_id = req.params.id;
  db.findById(post_id)
    .then((post) => {
      if (!post.length)
        res
          .status(404)
          .send({ message: "The post with the specified ID does not exist." });
      else {
        if (!comment.text) {
          res
            .status(400)
            .send({ errorMessage: "Please provide text for the comment." });
        } else {
          db.insertComment({ ...comment, post_id })
            .then((newId) =>
              res.status(201).send({
                ...comment,
                post_id: Number(post_id),
                ...newId,
                post: post[0].title,
              })
            )
            .catch((err) =>
              res.status(500).send({
                error:
                  "There was an error while saving the comment to the database.",
              })
            );
        }
      }
    })
    .catch((err) =>
      res
        .status(500)
        .send({ error: "The posts information could not be retrieved." })
    );
});

router.get("/", (req, res) => {
  db.find()
    .then((posts) => res.status(200).send(posts))
    .catch((err) =>
      res
        .status(500)
        .send({ error: "The posts information could not be retrieved." })
    );
});

router.get("/:id", (req, res) => {
  db.findById(req.params.id)
    .then((post) => {
      if (!post.length)
        res
          .status(404)
          .send({ message: "The post with the specified ID does not exist." });
      else res.status(200).send(post);
    })
    .catch((err) =>
      res
        .status(500)
        .send({ error: "The posts information could not be retrieved." })
    );
});

router.get("/:id/comments", (req, res) => {
  db.findPostComments(req.params.id)
    .then((comments) => {
      if (!comments.length)
        res
          .status(404)
          .send({ message: "The post with the specified ID does not exist." });
      else res.status(200).send(comments);
    })
    .catch((err) =>
      res
        .status(500)
        .send({ error: "The posts information could not be retrieved." })
    );
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.findById(id)
    .then((post) => {
      if (!post.length)
        res
          .status(404)
          .send({ message: "The post with the specified ID does not exist." });
      else {
        db.remove(id)
          .then(() => res.sendStatus(204))
          .catch((err) =>
            res.status(500).send({
              error: "The post could not be removed.",
            })
          );
      }
    })
    .catch((err) =>
      res
        .status(500)
        .send({ error: "The posts information could not be retrieved." })
    );
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const updatedPost = req.body;
  db.findById(id)
    .then((post) => {
      if (!post.length)
        res
          .status(404)
          .send({ message: "The post with the specified ID does not exist." });
      else {
        // Update the Post
        if (!updatedPost.title || !updatedPost.contents) {
          res.status(400).send({
            errorMessage: "Please provide title and contents for the post.",
          });
        } else {
          db.update(id, updatedPost)
            .then((count) => {
              if (count === 1) res.status(200).send({ ...updatedPost, id });
            })
            .catch((err) =>
              res.status(500).send({
                error: "The post information could not be modified.",
              })
            );
        }
      }
    })
    .catch((err) =>
      res
        .status(500)
        .send({ error: "The posts information could not be retrieved." })
    );
});

module.exports = router;
