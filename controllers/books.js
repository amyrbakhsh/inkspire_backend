const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Book = require("../models/Book.js");
const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
    try {
      req.body.owner = req.user._id;
      const book = await Book.create(req.body);
      book._doc.owner = req.user;
      res.status(201).json(book);
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  }
);
module.exports = router;
