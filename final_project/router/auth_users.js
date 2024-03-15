const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
      });
      if(validusers.length > 0){
        return true;
      } else {
        return false;
      }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
      });
      if(validusers.length > 0){
        return true;
      } else {
        return false;
      }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
   if (authenticatedUser(username,password)) {
      let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60 * 60 });
      req.session.authorization = {
        accessToken,username
    }
    console.log("A: " + JSON.stringify(req.session));
    
    return res.status(200).send("User successfully logged in");
    } else {
      return res.status(208).json({message: "Invalid Login. Check username and password"});
}});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const bookId = req.params.isbn;
    const review = req.body.review;
    const loggedInUser = req.session.authorization;
    if (!loggedInUser || !loggedInUser.username) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }

    const author = loggedInUser.username; // Set author to the currently logged-in user
    console.log("Review: " + review + " by " + author);


    const book = books[bookId]
    if (!book) {
    return res.status(404).json({ error: 'Book not found' });
    }
    // Check if the author already has a review for this book

    console.log("C: " + JSON.stringify(book));

    if (book.reviews[author]) {
      // If the author already has a review, update it
      book.reviews[author] = review;
      console.log("D: " + JSON.stringify(book));

    } else {
      // If not, add a new review
      console.log("was: " + JSON.stringify(book.reviews));
      book.reviews[author] = review;
      console.log("E: " + JSON.stringify(book));
      console.log("now: " + JSON.stringify(book.reviews));
    }
  
    res.json(book);
});

//Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const bookId = req.params.isbn;

  // Check if user is logged in
  const loggedInUser = req.session.authorization;
  if (!loggedInUser || !loggedInUser.username) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  const author = loggedInUser.username; // Get the currently logged-in user's username

  if (!books[bookId]) {
    return res.status(404).json({ error: 'Book not found' });
  }

  // Check if the author has a review for this book
  if (!books[bookId].reviews[author]) {
    return res.status(404).json({ error: 'Review not found for this book by the logged-in user' });
  }

  // Check if the author of the review matches the currently logged-in user
  if (books[bookId].reviews[author] === req.body.review) {
    // If the author matches, delete the review
    delete books[bookId].reviews[author];
    return res.json({ message: 'Review deleted successfully' });
  } else {
    // If the author does not match, return an error
    return res.status(403).json({ error: 'You are not authorized to delete this review' });
  }
});
    
    


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
