var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
var admin = require('firebase-admin');
let db = require('./firebase')
var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

function checkAuth(req, res, next) {
  if (req.headers.authtoken) {
    admin.auth().verifyIdToken(req.headers.authtoken)
      .then((decodedToken) => {
        let uid = decodedToken.uid;
        req.uid = uid;
        req.db = db;
        req.admin = admin;
        console.log(req.uid);
        next();
      }).catch(() => {
        res.status(403).send('Unauthorized')
      });
  } else if (req.url === 'user' && req.method === 'POST') {
    req.db = db;
    req.admin = admin;
    next();
  }
  else if (req.url === 'user' || req.user === 'tasks') {
    res.status(403).send('Unauthorized');
  }
  else {
    next();
  }
}

app.use('/', checkAuth)

let tasks = require('./api/tasks');
app.use('/tasks', tasks);

let user = require('./api/user');
app.use('/user', user);

if (process.env.NODE_ENV === 'production') {

  console.log('prod server');

  // Static folder
  app.use(express.static(__dirname + '/public/'));

  // Handle SPA
  app.get(/.*/, (req, res) => res.sendFile(__dirname + '/public/index.html'));
}

module.exports = app;
