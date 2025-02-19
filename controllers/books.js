const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Book = require("../models/Book.js");
const router = express.Router();
const upload = require("../middleware/upload.js");
const uploadImageToImgur = require("../config/imgur.js");

module.exports = router;



// Add Book with Image Upload
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
    try {
        console.log("Received book creation request from user:", req.user._id);
        console.log("Request body:", {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category
        });
        
        // Validate required fields
        if (!req.body.title || !req.body.description || !req.body.category) {
            console.log("Missing required fields in request");
            return res.status(400).json({ error: "All fields (title, description, category) are required." });
        }

        // Handle image upload
        let imageUrl = null;
        if (req.file) {
            console.log("Received image file:", {
                originalname: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype
            });
            try {
                imageUrl = await uploadImageToImgur(req.file.buffer);
                console.log("Image successfully uploaded to Imgur:", imageUrl);
            } catch (imgurError) {
                console.error("Imgur upload failed:", imgurError);
                return res.status(500).json({ error: "Failed to upload image to Imgur" });
            }
        } else {
            console.log("No image file received in request");
        }

        // Create new book
        const newBook = await Book.create({
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            owner: req.user._id,
            image: imageUrl,
        });

        console.log("Successfully created new book:", {
            id: newBook._id,
            title: newBook.title,
            image: newBook.image
        });

        res.status(201).json(newBook);
    } catch (err) {
        console.error("Error creating book:", err);
        res.status(500).json({ 
            error: "Failed to create book",
            details: err.message 
        });
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
    const book = await Book.findById(req.params.id).populate("reviews.owner", "name");

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json(book.reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//add review
router.post("/:bookId/reviews", verifyToken, async (req, res) => {
    try {
      req.body.owner = req.user._id;
      const book = await Book.findById(req.params.bookId);
      book.reviews.push(req.body);
      await book.save();
      const newReview = book.reviews[book.reviews.length - 1];
      newReview._doc.owner = req.user;
      res.status(201).json(newReview);
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  });



//update reviews 
router.put("/:bookId/reviews/:reviewId", verifyToken, async (req, res) => {
    try {
      const book = await Book.findById(req.params.bookId);
      const review = book.reviews.id(req.params.reviewId);
  
      // ensures the current user is the author of the comment
      if (review.owner.toString() !== req.user._id) {
        return res
          .status(403)
          .json({ message: "You are not authorized to edit this review" });
      }
  
      review.text = req.body.text;
      await book.save();
      res.status(200).json({ message: "review updated successfully" });
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  });





//delete reviews
  router.delete("/:bookId/reviews/:reviewId", verifyToken, async (req, res) => {
    try {
      const book = await Book.findById(req.params.bookId);
      const review = book.reviews.id(req.params.reviewId);
      console.log('book',book)
      console.log('review',review)
      // ensures the current user is the author of the comment
      console.log("review owner: ", review.owner)
      console.log(req.user._id)
      if (review.owner.toString() !== req.user._id) {
        return res
          .status(403)
          .json({ message: "You are not authorized to edit this review" });
      }
      book.reviews.remove({ _id: req.params.reviewId });
      await book.save();
      res.status(200).json({ message: "review deleted successfully" });
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  });

module.exports = router;
