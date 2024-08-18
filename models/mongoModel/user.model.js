const mongoose = require('mongoose');

const userShema = new mongoose.Schema({

    _id: {
        type: String,
        require: true
    },

    fName: {
        type: String,
        require: true
    },

    lName: {
        type: String,
        require: true
    },

    email: {
        type: String,
        require: true,
        unique: true
    },

    password: {
        type: String,
        require: true,
    },

    phoneNumber: {
        type: String,
        require: true,
    },

    userType: {
        type: String,
        require: true,
    },

    profileUrl: {
        type: String,
        require: false,
    },

    sex: {
        type: String,
        require: false,
    },

    privateId: {
        type: [String],
        require: false,
    },

    groupId: {
        type: [String],
        require: false,
    },

    channelId: {
        type: [String],
        require: false,
    },

});

const User = mongoose.model('User', userShema);
module.exports = User;