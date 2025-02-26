# InkSpire

## Description
This project is an Express API for managing books, including features for user authentication, book management, and image uploads.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/amyrbakhsh/inkspire_backend
   ```
2. Navigate to the project directory:
   ```bash
   cd <inkspire_backend>
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

## Usage
To start the server, run:
```bash
npm start
```
The server listens on the specified port (default is 3000).

## Middleware
- **CORS**: Allows cross-origin requests.
- **Morgan**: HTTP request logger middleware for Node.js.
- **Verify Token**: Custom middleware to verify JWT tokens for protected routes.
- **Upload**: Middleware for handling file uploads.

## API Endpoints
- **POST /books**: Add a new book (requires authentication).
- **PUT /books/:bookId**: Update an existing book (requires authentication).
- **DELETE /books/:bookId**: Delete a book (requires authentication).
- **GET /books**: Retrieve all books (requires authentication).
- **GET /books/:id**: Retrieve details of a specific book (requires authentication).
- **GET /books/:id/reviews**: Retrieve all reviews for a specific book (requires authentication).
- **POST /books/:bookId/reviews**: Add a review for a book (requires authentication).
- **PUT /books/:bookId/reviews/:reviewId**: Update a review (requires authentication).
- **DELETE /books/:bookId/reviews/:reviewId**: Delete a review (requires authentication).

## Routing
The application uses Express routers to handle different routes:
- **Auth Routes**: Handled by `controllers/auth.js`.
- **User Routes**: Handled by `controllers/users.js`.
- **Book Routes**: Handled by `controllers/books.js`.

## Data Models
### Book
- **title**: String, required
- **description**: String, required
- **category**: String, required, enum: ['Fantasy', 'Horror', 'Science fiction', 'Thriller', 'Mystery', 'Biography', 'Graphic novel']
- **owner**: ObjectId, reference to User
- **image**: String, default: null
- **reviews**: Array of review objects

## Contributors   
- Mohd thamer
- Zainab Hammad
- Abdulla Bakhsh

## License
This project is licensed under the MIT License.
