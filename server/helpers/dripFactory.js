(function () {
  "use strict";

  const monetizeConfig = require("../config/monetizeConfig");
  const dripConfig = require("../config/dripConfig");
  const getDrip = require("getdrip-api")(process.env.DRIPAPITOKEN, process.env.DRIPACCOUNTID);

  module.exports = {
    "validateKeys": function (chaveUnica, chaveProduto) {

      if(chaveUnica !== monetizeConfig.monetizeKey) {
        return false;
      }

      return chaveProduto === monetizeConfig.productKey;
    },
    "aguardandoPagamentoBoleto": function (data) {
      return new Promise(function (resolve, reject) {

        if(!data) {
          return reject("Data object is empty");
        }

        let flwUp_id = dripConfig.dripFollowUpID;
        let usrEmail = data["comprador[email]"] || "";
        let urlBoleto = data["venda[linkBoleto]"] || 0;
        let nome = data["comprador[nome]"].split(" ")[0] || " ";


          getDrip.startOnAWorkflow(usrEmail, flwUp_id, {
            'custom_fields': {
              'linkBoleto': urlBoleto,
              "firstName": nome
            }
          }, function (err, res, cb) {
            if(err){
              console.log(err);
              reject(err);
            }
            resolve(cb);
          })
      });
    },
    "carrinhoAbandonado": function(data) {

      let abandoned_id = process.env.DRIPABANDONEDID;
      let usrEmail = data["comprador[email]"] || "";
      let nome = data["comprador[nome]"].split(" ")[0] || " ";

      return new Promise(function (resolve, reject) {
        getDrip.startOnAWorkflow(usrEmail, abandoned_id, {
          'custom_fields': {
            "firstName": nome
          }
        }, function (err, res, body) {
          if (err) {
            return reject(err);
          }
          return resolve(body);
        });
      })
    },

    "vendaCancelada": function (data) {
      return new Promise(function (resolve, reject) {

        let abandoned_id = process.env.DRIPABANDONEDID;
        let usrEmail = data["comprador[email]"] || "";

        getDrip.startOnAWorkflow(usrEmail, abandoned_id, {}, function (err, res, body) {
          if (err) {
            return reject(err);
          }
          return resolve(body);
        });
      })
    },
    "vendaFinalizada": function (data) {
      return new Promise(function (resolve, reject) {

        let vsc_id = process.env.DRIPVSCID;
        let usrEmail = data["comprador[email]"] || "";

        getDrip.startOnAWorkflow(usrEmail, vsc_id, {}, function (err, res, body) {
          if (err) {
            return reject(err);
          }
          return resolve(body);
        });

      })
    },

    "removerWorkflow": function (data) {

      let usrEmail = data["comprador[email]"] || "";

      return new Promise(function (resolve, reject) {
        getDrip.unsubscribeFromCampaigns(usrEmail, function (err, res, body) {
          if (err) {
           return reject(err)
          }
          return resolve(body);
        });
      }) 
    }

  }

}());