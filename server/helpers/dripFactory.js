(function () {
  "use strict";

  const monetizeConfig = require("../config/monetizeConfig");
  const dripConfig = require("../config/dripConfig");
  const getDrip = require("getdrip-api")(process.env.DRIPAPITOKEN, process.env.DRIPACCOUNTID);

  module.exports = {
    "getNomeComprador": function (comprador) {
      return new Promise(function (resolve, reject) {
        if(comprador) {
          let result = comprador.split(" ")[0];
          return resolve(result);
        } else {
          return reject("No name passed in");
        }
      });
    },
    "validateKeys": function (chaveUnica, chaveProduto) {

      if(chaveUnica !== monetizeConfig.monetizeKey) {
        return false;
      }

      return chaveProduto === monetizeConfig.productKey;
    },

    "startWorkflow": function (email, workflowId, opts) {

      const host = 'https://api.getdrip.com/v2';
      const header = [
        {
          name: 'content-type',
          value: 'application/x-www-form-urlencoded'
        }
      ];

      return new Promise(function (resolve, reject) {
        let reqBody = {email: email};
        let optionals = ['user_id', 'time_zone', 'custom_fields', 'tags', 'prospect'];

        optionals.map(function (o) {
          if (opts.hasOwnProperty(o))
            reqBody[o] = opts[o];
        });

        console.log(reqBody);
        request.post({
          url: host + '/' + accountId + '/workflows/' + workflowId + '/subscribers',
          auth: {'user': this.apiToken},
          json: true,
          header: this.header,
          body: {subscribers: [reqBody]}
        }, function (err, res, body) {
          if (err) {
            return reject(err);
          } else {}
        })
      })
    },

    "aguardandoPagamentoBoleto": function (data) {
      return new Promise(function (resolve, reject) {

        if(!data) {
          return reject("Data object is empty");
        }

        let statusVenda = data["venda[status]"];
        let usrEmail = data["comprador[email]"];
        let formaPag = data["venda[formaPagamento]"];
        let codigoProduto = data["produto[codigo]"];
        let flwUp_id = dripConfig.dripFollowUpID;
        let urlBoleto = data["venda[linkBoleto]"] || "google";
        let nome = data["comprador[nome]"] || " ";

        console.log("A", statusVenda);
        console.log("B", usrEmail);
        console.log("C", formaPag);
        console.log("D", codigoProduto);
        console.log("E", flwUp_id);
        console.log("F", urlBoleto);
        console.log("G", nome);

        if (! (statusVenda === 'Aguardando pagamento' && formaPag === 'Boleto' && codigoProduto === '39806')) {
          console.log("AQ")
          getDrip.startOnAWorkflow(usrEmail, flwUp_id, {
            'custom_fields': {
              'linkBoleto': urlBoleto,
              "firstName": nome
            }
          }, function (err, res, cb) {
            if(err){
              reject(err);
            }
            resolve(cb);
          })
        } else {
          console.log("WAT ")
        }

      });
    }
  }

}());