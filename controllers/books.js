const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Book = require("../models/Book.js");
const router = express.Router();

router.post('/', async (req, res) => {
    try{
        req.body.author = req.user._id
        const hoot = await Book.create(req.body)
        hoot._doc.author = req.user
        res.status(201).json(book)
    } catch (err) {
        res.status(500).json({err: err.message})
    }
})
module.exports = router;
