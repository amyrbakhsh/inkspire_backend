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
        // Validate required fields
        if (!req.body.title || !req.body.description || !req.body.category) {
            console.log("Missing required fields in request");
            return res.status(400).json({ error: "All fields (title, description, category) are required." });
        }

        // Handle image upload
        let imageUrl = null;
        if (req.file) {
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

        res.status(201).json(newBook);
    } catch (err) {
        console.error("Error creating book:", err);
        res.status(500).json({ 
            error: "Failed to create book",
            details: err.message 
        });
    }
});

// Update Book
router.put("/:bookId", verifyToken, upload.single("image"), async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        if (!book.owner.equals(req.user._id)) {
            return res.status(403).send("You're not allowed to do that!");
        }
        
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Validate required fields
        if (!req.body.title || !req.body.description || !req.body.category) {
            return res.status(400).json({ error: "All fields (title, description, category) are required." });
        }

        // Update book details
        book.title = req.body.title;
        book.description = req.body.description;
        book.category = req.body.category;

        // Handle image upload
        if (req.file) {
            try {
                const imageUrl = await uploadImageToImgur(req.file.buffer);
                book.image = imageUrl;
            } catch (imgurError) {
                return res.status(500).json({ error: "Failed to upload image to Imgur" });
            }
        }

        await book.save();
        res.status(200).json(book);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Book
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

// Add review
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

// Update review
router.put("/:bookId/reviews/:reviewId", verifyToken, async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        const review = book.reviews.id(req.params.reviewId);


        if (review.owner.toString() !== req.user._id) {
            return res.status(403).json({ message: "You are not authorized to edit this review" });
        }
        review.text = req.body.text;
        await book.save();
        res.status(200).json({ message: "review updated successfully" });
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// Delete review
router.delete("/:bookId/reviews/:reviewId", verifyToken, async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        const review = book.reviews.id(req.params.reviewId);
        if (review.owner.toString() !== req.user._id) {
            return res.status(403).json({ message: "You are not authorized to edit this review" });
        }
        book.reviews.remove({ _id: req.params.reviewId });
        await book.save();
        res.status(200).json({ message: "review deleted successfully" });
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});
