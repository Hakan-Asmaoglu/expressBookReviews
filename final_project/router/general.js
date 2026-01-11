const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const getBaseUrl = (req) => `${req.protocol}://${req.get('host')}`;

const sendAxiosError = (res, err) => {
  if (err.response) {
    return res.status(err.response.status).send(err.response.data);
  }
  return res.status(500).json({message: "Error retrieving books"});
};

public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(409).json({message: "User already exists"});
  }
  users.push({ username, password });
  return res.status(200).json({message: "User registered successfully"});
});

// Internal data routes used by axios-based handlers.
public_users.get('/books', function (req, res) {
  return res.status(200).json(books);
});

public_users.get('/books/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book);
  }
  return res.status(404).json({message: "Book not found"});
});

public_users.get('/books/author/:author', function (req, res) {
  const author = req.params.author;
  const result = {};
  Object.keys(books).forEach((isbn) => {
    if (books[isbn].author === author) {
      result[isbn] = books[isbn];
    }
  });
  if (Object.keys(result).length > 0) {
    return res.status(200).json(result);
  }
  return res.status(404).json({message: "Author not found"});
});

public_users.get('/books/title/:title', function (req, res) {
  const title = req.params.title;
  const result = {};
  Object.keys(books).forEach((isbn) => {
    if (books[isbn].title === title) {
      result[isbn] = books[isbn];
    }
  });
  if (Object.keys(result).length > 0) {
    return res.status(200).json(result);
  }
  return res.status(404).json({message: "Title not found"});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get(`${getBaseUrl(req)}/books`);
    return res.status(200).send(JSON.stringify(response.data, null, 2));
  } catch (err) {
    return sendAxiosError(res, err);
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = encodeURIComponent(req.params.isbn);
  try {
    const response = await axios.get(`${getBaseUrl(req)}/books/isbn/${isbn}`);
    return res.status(200).send(JSON.stringify(response.data, null, 2));
  } catch (err) {
    return sendAxiosError(res, err);
  }
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = encodeURIComponent(req.params.author);
  try {
    const response = await axios.get(`${getBaseUrl(req)}/books/author/${author}`);
    return res.status(200).send(JSON.stringify(response.data, null, 2));
  } catch (err) {
    return sendAxiosError(res, err);
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = encodeURIComponent(req.params.title);
  try {
    const response = await axios.get(`${getBaseUrl(req)}/books/title/${title}`);
    return res.status(200).send(JSON.stringify(response.data, null, 2));
  } catch (err) {
    return sendAxiosError(res, err);
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 2));
  }
  return res.status(404).json({message: "Book not found"});
});

module.exports.general = public_users;
