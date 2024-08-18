const User = require("../models/mongoModel/user.model")
const admin = require('../firebase/firebase.config')
const multer = require('multer');




// get all users
const getAllUsers = async (req, res) => {

    try {

        // get all user from mongodb
        const users = await User.find();

        if (users.length === 0) {

            return res.status(500).json({message: 'There is no user in this Database!'});

        }

        res.status(200).send(users);

    } catch (error) {

        res.status(500).json({ message: error.message });

    }
}

// get single user
const getUser = async (req, res) => {

    const uid = req.body.uid;

    try {
        const user = await User.findById(uid);

        if (!user) {
            return res.status(400).send('There is no user by this Id!');
        }

        res.status(200).send(user);


    } catch (error) {

        res.status(500).send(error.message);

    }

}

// register user
const registerUser = async (req, res) => {
    const { fName, lName, email, password, phoneNumber, userType, sex } = req.body;

    try {

        // register user on firebase auth
        const userRecord = await admin.auth().createUser({
            email,
            password,
            emailVerified: false,
            disabled: false
        });


        // register user on mongoDB
        const newUser = new User({
            _id: userRecord.uid,
            fName,
            lName,
            email,
            password,
            phoneNumber,
            userType,
            sex
        });

        const registeredUser = await newUser.save();

        res.status(201).send(registeredUser);

    } catch (error) {
        // Handle different Firebase error codes
        switch (error.code) {
            case 'auth/email-already-exists':
                res.status(400).json({ message: 'Email already exists' });
                break;
            case 'auth/invalid-email':
                res.status(400).json({ message: 'Invalid email format' });
                break;
            case 'auth/operation-not-allowed':
                res.status(403).json({ message: 'Operation not allowed' });
                break;
            case 'auth/weak-password':
                res.status(400).json({ message: 'Password is too weak' });
                break;
            default:
                res.status(500).json({ message: error.message });
                break;
        }
    }

}

// register user
const registerUserWithProfile = async (req, res) => {
    const { fName, lName, email, password, phoneNumber, userType, sex } = req.body;
    const { buffer } = req.file;

    try {

        // register user on firebase auth
        const userRecord = await admin.auth().createUser({
            email,
            password,
            emailVerified: false,
            disabled: false
        });

    // setup firebase storeage
    const userId = userRecord.uid;
    const folder = 'profile_images';
    const filename = `${userId}.jpg`;
    const filePath = `${folder}/${filename}`;

    // Upload the image to Firebase Storage
    const storageRef = admin.storage().bucket();
    await storageRef.file(filePath).save(buffer);

    // Get the download URL
    const downloadUrl = await storageRef.file(filePath).getSignedUrl({
      action: 'read',
      expires: '03-09-2491',
    });

        // register user on mongoDB
        const newUser = new User({
            _id: userRecord.uid,
            fName,
            lName,
            email,
            password,
            phoneNumber,
            userType,
            profileUrl: downloadUrl[0],
            sex
        });

        const registeredUser = await newUser.save();

        res.status(201).send(registeredUser);

    } catch (error) {
        // Handle different Firebase error codes
        switch (error.code) {
            case 'auth/email-already-exists':
                res.status(400).json({ message: 'Email already exists' });
                break;
            case 'auth/invalid-email':
                res.status(400).json({ message: 'Invalid email format' });
                break;
            case 'auth/operation-not-allowed':
                res.status(403).json({ message: 'Operation not allowed' });
                break;
            case 'auth/weak-password':
                res.status(400).json({ message: 'Password is too weak' });
                break;
            default:
                res.status(500).json({ message: error.message });
                break;
        }
    }

}

// login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userRecord = await admin.auth().getUserByEmail(email);

        if (!userRecord) {

            return res.status(400).json({message: 'There is no user by this email'});

        }

        const user = await User.findById(userRecord.uid);

        if (!user) {

            return res.status(400).json({message: 'There is no user by this Id!'});

        }

        if (user.password !== password) {

            return res.status(400).json({message: 'Incorrect password!'});

        }

        res.status(200).send(user);

    } catch (error) {

        res.status(400).json({ message: error.message });
    }
}

// delete user
const deleteUser = async (req, res) => {
    const uid = req.params.uid;

    try {

        const user = await User.findByIdAndDelete(uid);


        if (!user) {
            return res.status(400).send('There is no user by this Id!');
        }

        await admin.auth().deleteUser(uid);



        res.status(200).send(user);

    } catch (error) {

        res.status(500).send(error.message);

    }
}

// logout 
const logOutUser = async (req, res) => {
   
    try {

        admin.logOutUser();

        res.status(200).json({message: 'LogOut Successul!'});
        
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

// update user profile
const updateUserProfile = async (req, res) => {
try {
    
    const { buffer } = req.file;
    const userId = req.params.userId;
    const folder = 'profile_images';
    const filename = `${userId}.jpg`;
    const filePath = `${folder}/${filename}`;

    // Upload the image to Firebase Storage
    const storageRef = admin.storage().bucket();
    await storageRef.file(filePath).save(buffer);
ss
    // Get the download URL
    const downloadUrl = await storageRef.file(filePath).getSignedUrl({
      action: 'read',
      expires: '03-09-2491',
    });

    res.send(downloadUrl);

} catch (error) {
    res.status(500).send(error);
}
  

}

module.exports = {
    getAllUsers,
    getUser,
    registerUser,
    registerUserWithProfile,
    loginUser,
    deleteUser,
    logOutUser,
    updateUserProfile
}