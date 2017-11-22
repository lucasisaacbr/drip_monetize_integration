(function () {
  "use strict";

  module.exports = function (app) {

    require("./helpers/apiHelper")(app);

    app.get("/", function(req, res){
      return res.sendStatus(200).end('Server is running...');
    });

  }

}());