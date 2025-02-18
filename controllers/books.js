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



router.put("/:bookId", verifyToken, async (req, res) => {
    
    try {
      const book = await Book.findById(req.params.bookId);
      
      if (!book.owner.equals(req.user._id)) {
        return res.status(403).send("You're not allowed to do that!");
      }
  

      
      const updatedBook = await Book.findByIdAndUpdate(
        req.params.bookId,
        req.body,
        { new: true }
      );
  
      // Append req.user to the author property:
      updatedBook._doc.owner = req.user;
  
      // Issue JSON response:
      res.status(200).json(updatedBook);
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  });

  router.delete("/:bookId", verifyToken, async (req, res) => {
    try {
      const book = await Book.findById(req.params.bookId);
  
      if (!book.owner.equals(req.user._id)) {
        return res.status(403).send("You're not allowed to do that!");
      }
  
      const deletedBook = await Book.findByIdAndDelete(req.params.bookId);
      res.status(200).json(deletedBook);
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  });


    
// GET /books - View all books
router.get("/", verifyToken, async (req, res) => {
  try {
    const books = await Book.find().populate("owner", "name").sort({ createdAt: "desc" });
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET /books/:id - View book details
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("owner", "name");
    
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    
    res.status(200).json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET /books/:id/reviews - View all reviews for a book
router.get("/:id/reviews", verifyToken, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("review.reviewer", "name");

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json(book.review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

  
module.exports = router;
