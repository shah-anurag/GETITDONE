var admin = require('firebase-admin');

var serviceAccount = require("./config/googServiceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "urlhere"
});

let db = admin.firestore();
db.settings({ timestampsInSnapshots: true });

module.exports = db;