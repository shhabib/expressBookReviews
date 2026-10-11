const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

/**
 * Centralized Error Response Helper
 * Streamlines standard error responses and reduces redundancy across routes.
 *
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Descriptive error message
 */
const sendError = (res, statusCode, message) => {
    return res.status(statusCode).json({ message });
};

/**
 * Task 6: Register a new user
 * Validates request body, checks user uniqueness, and registers new user.
 */
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return sendError(res, 404, "Unable to register user. Username and password are required.");
    }

    if (!isValid(username)) {
        return sendError(res, 404, "User already exists!");
    }

    users.push({ username, password });
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

/**
 * Task 1 & Task 10: Get the list of all books available in the shop
 * Uses asynchronous Promise resolution to return formatted JSON of books.
 */
public_users.get('/', function (req, res) {
    const getBooks = new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject(new Error("Unable to fetch book list"));
        }
    });

    getBooks
        .then((bookList) => res.status(200).send(JSON.stringify(bookList, null, 4)))
        .catch((err) => sendError(res, 500, err.message));
});

/**
 * Task 2 & Task 11: Get book details based on ISBN
 * Uses asynchronous Promise resolution to find a book by its ISBN.
 */
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    const findBookByISBN = new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject({ status: 404, message: `Book with ISBN ${isbn} not found` });
        }
    });

    findBookByISBN
        .then((book) => res.status(200).send(JSON.stringify(book, null, 4)))
        .catch((err) => sendError(res, err.status || 500, err.message));
});

/**
 * Task 3 & Task 12: Get book details based on Author
 * Uses asynchronous Promise resolution to find books matching the specified author.
 */
public_users.get('/author/:author', function (req, res) {
    const targetAuthor = req.params.author.toLowerCase();

    const findBooksByAuthor = new Promise((resolve, reject) => {
        const bookKeys = Object.keys(books);
        const matchingBooks = bookKeys
            .filter((key) => books[key].author.toLowerCase() === targetAuthor)
            .map((key) => books[key]);

        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject({ status: 404, message: `No books found by author ${req.params.author}` });
        }
    });

    findBooksByAuthor
        .then((results) => res.status(200).send(JSON.stringify(results, null, 4)))
        .catch((err) => sendError(res, err.status || 500, err.message));
});

/**
 * Task 4 & Task 13: Get all books based on Title
 * Uses asynchronous Promise resolution to find books matching the specified title.
 */
public_users.get('/title/:title', function (req, res) {
    const targetTitle = req.params.title.toLowerCase();

    const findBooksByTitle = new Promise((resolve, reject) => {
        const bookKeys = Object.keys(books);
        const matchingBooks = bookKeys
            .filter((key) => books[key].title.toLowerCase() === targetTitle)
            .map((key) => books[key]);

        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject({ status: 404, message: `No books found with title ${req.params.title}` });
        }
    });

    findBooksByTitle
        .then((results) => res.status(200).send(JSON.stringify(results, null, 4)))
        .catch((err) => sendError(res, err.status || 500, err.message));
});

/**
 * Task 5: Get book reviews based on ISBN
 * Retrieves the reviews dictionary for the specified book ISBN.
 */
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        return res.status(200).send(JSON.stringify(book.reviews, null, 4));
    }
    return sendError(res, 404, `Book with ISBN ${isbn} not found`);
});

/* ==========================================================================
   Tasks 10-13: Async/Await & Promise implementations using Axios
   ========================================================================== */

const BASE_URL = "http://localhost:5000";

/**
 * Task 10: Retrieve all books using async/await with Axios
 * @returns {Promise<object>} JSON dictionary of all books
 */
async function getAllBooksAsync() {
    try {
        const response = await axios.get(`${BASE_URL}/`);
        return response.data;
    } catch (error) {
        throw new Error(error.response ? error.response.data.message : error.message);
    }
}

/**
 * Task 11: Retrieve book details by ISBN using async/await with Axios
 * @param {string|number} isbn - Book ISBN
 * @returns {Promise<object>} Book details object
 */
async function getBookByISBNAsync(isbn) {
    try {
        const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response ? error.response.data.message : error.message);
    }
}

/**
 * Task 12: Retrieve book details by Author using async/await with Axios
 * @param {string} author - Author name
 * @returns {Promise<Array>} Array of books matching the author
 */
async function getBooksByAuthorAsync(author) {
    try {
        const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response ? error.response.data.message : error.message);
    }
}

/**
 * Task 13: Retrieve book details by Title using async/await with Axios
 * @param {string} title - Book title
 * @returns {Promise<Array>} Array of books matching the title
 */
async function getBooksByTitleAsync(title) {
    try {
        const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response ? error.response.data.message : error.message);
    }
}

module.exports.general = public_users;
module.exports.getAllBooksAsync = getAllBooksAsync;
module.exports.getBookByISBNAsync = getBookByISBNAsync;
module.exports.getBooksByAuthorAsync = getBooksByAuthorAsync;
module.exports.getBooksByTitleAsync = getBooksByTitleAsync;
