// server.js

// 1. Require packages
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const methodOverride = require("method-override");

// 2. Configure dotenv
dotenv.config();

// 3. Import Book model
const Book = require("./models/book"); // make sure models/book.js exists

// 4. Initialize Express app
const app = express();

// 5. Middleware
app.use(express.urlencoded({ extended: false })); // form data
app.use(methodOverride("_method")); // PUT & DELETE via POST forms
app.set("view engine", "ejs"); // use EJS templates

// 6. Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log(`Connected to MongoDB ${mongoose.connection.name}`))
  .catch(err => console.log("MongoDB connection error:", err));

// 7. ROUTES

// --- Landing page ---
app.get("/", (req, res) => {
  res.send("Welcome to the Books CRUD App!");
});

// --- INDEX: Show all books ---
app.get("/books", async (req, res) => {
  const books = await Book.find({});
  res.render("books/index", { books });
});

// --- NEW: Form to create a book ---
app.get("/books/new", (req, res) => {
  res.render("books/new");
});

// --- CREATE: Add book to DB ---
app.post("/books", async (req, res) => {
  req.body.isPublished = req.body.isPublished === "on"; // checkbox to boolean
  await Book.create(req.body);
  res.redirect("/books");
});


// --- EDIT: Form to edit a book ---
app.get("/books/:id/edit", async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid Book ID");
  }

  const book = await Book.findById(id);
  if (!book) return res.status(404).send("Book not found");

  res.render("books/edit", { book });
});

// --- SHOW: Display a single book ---
app.get("/books/:id", async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid Book ID");
  }
const book = await Book.findById(id);
  if (!book) return res.status(404).send("Book not found");

  res.render("books/show", { book });
});


// --- UPDATE: Update book in DB ---
app.put("/books/:id", async (req, res) => {
  req.body.isPublished = req.body.isPublished === "on";
  await Book.findByIdAndUpdate(req.params.id, req.body);
  res.redirect(`/books/${req.params.id}`);
});

// --- DELETE: Remove book from DB ---
app.delete("/books/:id", async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.redirect("/books");
});

// 8. Start server
app.listen(3000, () => {
  console.log("Listening on port 3000");
});
