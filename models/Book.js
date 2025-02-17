const mongoose = require('mongoose');


const reviewSchema = new mongoose.Schema(
    {
      text: {
        type: String,
        required: true
      },
      reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    { timestamps: true }
);

const bookSchema = new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      category: {
        type: String,
        required: true,
        enum: ['Fantasy', 'Horror', 'Science fiction', 'Thriller', 'Mystery', 'Biography','Graphic novel'],
      },
      owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      review: [reviewSchema],
    },
    { timestamps: true }
);
  

const Book = mongoose.model('Book', bookSchema);
module.exports = Book