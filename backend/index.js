
var express = require('express');
var app = express();
var cors = require('cors');

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "http://localhost:3000");
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

var user = require('./api/user/user');
app.use("/user", user);

app.listen(3300, () => console.log(`Listening on port 3300!`));