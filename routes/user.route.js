const express = require('express');
const { getAllUsers, registerUser, loginUser, deleteUser, getUser, logOutUser, updateUserProfile, registerUserWithProfile } = require('../controllers/user.controller');
const routes = express.Router();
const multer = require('multer');

// middle ware for recive file to front end
const storage = multer.memoryStorage();
const upload = multer({ storage });


// get all users
routes.get('/', getAllUsers);

// get single user by using firebase uid
routes.get('/', getUser);

// register user
routes.post('/registerwithprofile', upload.single('image'), registerUserWithProfile);

// register user
routes.post('/register', registerUser);


// login user
routes.post('/login', loginUser);

// delete user
routes.delete('/delete/:uid', deleteUser);

// logOut user
routes.post('/logout', logOutUser);

// update user profile
routes.post('/updateprofile', upload.single('image'), updateUserProfile);

module.exports = routes;