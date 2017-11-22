(function () {
  "use strict";

  const api = require("../../helpers/dripFactory");

  module.exports = function (app) {

    app.post("/webhook", function(req, res){
      let data = require("../../../public/monetizze.json");
      if (!api.validateKeys(data.chave_unica, data["produto[chave]"])) {

        api.aguardandoPagamentoBoleto(data).then(function (response) {
          res.status(200).send(response);
        }).catch(function (err) {
          res.status(500).send(err);
        });
      }


    });
  }

}());