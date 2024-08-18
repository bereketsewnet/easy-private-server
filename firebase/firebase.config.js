var admin = require("firebase-admin");

var serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://easy-24b5a-default-rtdb.firebaseio.com",
  storageBucket: "gs://easy-24b5a.appspot.com"
});

module.exports = admin;
