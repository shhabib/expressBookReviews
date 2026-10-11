const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (isValid(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(404).json({ message: "Unable to register user. Username and password required." });
});

// Task 1 & Task 10: Get the book list available in the shop using Promises / async-await
public_users.get('/', function (req, res) {
    const getBooks = new Promise((resolve, reject) => {
        resolve(books);
    });

    getBooks.then((bks) => {
        return res.status(200).send(JSON.stringify(bks, null, 4));
    }).catch((err) => {
        return res.status(500).json({ message: "Error fetching book list" });
    });
});

// Task 2 & Task 11: Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const getBookByISBN = new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject({ status: 404, message: `Book with ISBN ${isbn} not found` });
        }
    });

    getBookByISBN.then((book) => {
        return res.status(200).send(JSON.stringify(book, null, 4));
    }).catch((err) => {
        return res.status(err.status || 500).json({ message: err.message });
    });
});

// Task 3 & Task 12: Get book details based on author using Promises
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const getBooksByAuthor = new Promise((resolve, reject) => {
        let bookKeys = Object.keys(books);
        let matchingBooks = [];
        bookKeys.forEach((key) => {
            if (books[key].author.toLowerCase() === author.toLowerCase()) {
                matchingBooks.push(books[key]);
            }
        });

        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject({ status: 404, message: `No books found by author ${author}` });
        }
    });

    getBooksByAuthor.then((result) => {
        return res.status(200).send(JSON.stringify(result, null, 4));
    }).catch((err) => {
        return res.status(err.status || 500).json({ message: err.message });
    });
});

// Task 4 & Task 13: Get all books based on title using Promises
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const getBooksByTitle = new Promise((resolve, reject) => {
        let bookKeys = Object.keys(books);
        let matchingBooks = [];
        bookKeys.forEach((key) => {
            if (books[key].title.toLowerCase() === title.toLowerCase()) {
                matchingBooks.push(books[key]);
            }
        });

        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject({ status: 404, message: `No books found with title ${title}` });
        }
    });

    getBooksByTitle.then((result) => {
        return res.status(200).send(JSON.stringify(result, null, 4));
    }).catch((err) => {
        return res.status(err.status || 500).json({ message: err.message });
    });
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
});

/* ==========================================================================
   Tasks 10-13: Async/Await & Promise implementations with Axios
   ========================================================================== */

const BASE_URL = "http://localhost:5000";

// Task 10: Get all books using async/await with Axios
async function getAllBooksAsync() {
    try {
        const response = await axios.get(`${BASE_URL}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching all books:", error.message);
        throw error;
    }
}

// Task 11: Get book details by ISBN using async/await or Promises with Axios
async function getBookByISBNAsync(isbn) {
    try {
        const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching book with ISBN ${isbn}:`, error.message);
        throw error;
    }
}

// Task 12: Get book details by Author using async/await or Promises with Axios
async function getBooksByAuthorAsync(author) {
    try {
        const response = await axios.get(`${BASE_URL}/author/${author}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching books by author ${author}:`, error.message);
        throw error;
    }
}

// Task 13: Get book details by Title using async/await or Promises with Axios
async function getBooksByTitleAsync(title) {
    try {
        const response = await axios.get(`${BASE_URL}/title/${title}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching books by title ${title}:`, error.message);
        throw error;
    }
}

module.exports.general = public_users;
module.exports.getAllBooksAsync = getAllBooksAsync;
module.exports.getBookByISBNAsync = getBookByISBNAsync;
module.exports.getBooksByAuthorAsync = getBooksByAuthorAsync;
module.exports.getBooksByTitleAsync = getBooksByTitleAsync;
