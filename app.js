(function () {
  "use strict";

  require("dotenv").config({
    "silent": true
  });

  const express = require("express");
  const bodyParser = require("body-parser");
  const favicon = require("serve-favicon");
  const path = require("path");
  const port = process.env.PORT || 3000;

  const app = express();


  app.use(express.static('public'));
  app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  require("./server/routes/index")(app);

  app.listen(port, '0.0.0.0', function() {
    console.log("server starting on port " + port);
  });
  
}());