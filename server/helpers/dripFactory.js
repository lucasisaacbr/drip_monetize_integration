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

      return (chaveProduto === monetizeConfig.productKey || chaveProduto === monetizeConfig.sosKey);
    },
    "aguardandoPagamentoBoleto": function (data) {
      return new Promise(function (resolve, reject) {

        if(!data) {
          return reject("Data object is empty");
        }

        let usrEmail = data["comprador[email]"] || "";
        let urlBoleto = data["venda[linkBoleto]"] || 0;
        let nome = data["comprador[nome]"].split(" ")[0] || " ";
        let flwUp_id = "";

        if(data["produto[chave]"] === monetizeConfig.productKey){
          flwUp_id = dripConfig.dripFollowUpID;
        } else {
          flwUp_id = dripConfig.boletoSOS;
        }


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

      let abandoned_id = "";

      if(data["produto[chave]"] === monetizeConfig.productKey){
        abandoned_id = dripConfig.dripAbandonedID;
      } else {
        abandoned_id = dripConfig.abandonoSOS;
      }

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

        let abandoned_id = "";

        if(data["produto[chave]"] === monetizeConfig.productKey){
          abandoned_id = dripConfig.dripAbandonedID;
        } else {
          abandoned_id = dripConfig.abandonoSOS;
        }

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

        let vsc_id = "";

        if(data["produto[chave]"] === monetizeConfig.productKey){
          vsc_id = dripConfig.dripVscID;
        } else {
          vsc_id = dripConfig.compraSOS;
        }

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
    },
    
    "searchQuery": function (res) {
      
    }

  }

}());