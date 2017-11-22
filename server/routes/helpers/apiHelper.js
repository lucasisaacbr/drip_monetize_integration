(function () {
  "use strict";

  const api = require("../../helpers/dripFactory");

  module.exports = function (app) {

    app.post("/webhook", function(req, res){

      let data = req.body;
      let statusVenda = data["venda[status]"] || "";
      let formaPag = data["venda[formaPagamento]"] || "";
      let codigoProduto = data["produto[codigo]"] || 0;
      let nome = data["comprador[nome]"].split(" ")[0] || " ";

      if (api.validateKeys(data.chave_unica, data["produto[chave]"])) {

        if(statusVenda !== 'Aguardando pagamento' && statusVenda !== 'Cancelada' && statusVenda !== 'Finalizada'){
          api.carrinhoAbandonado(data).then(function (response) {
            res.status(200).send(response);
          }).catch(function (err) {
            console.log(err);
            res.status(300).send(err);
          });
        }

        if (statusVenda === 'Aguardando pagamento' && formaPag === 'Boleto' && codigoProduto === '39806') {
          api.aguardandoPagamentoBoleto(data).then(function (response) {
            res.status(200).send(response);
          }).catch(function (err) {
            console.log(err);
            res.status(300).send(err);
          });
        }

        else if (statusVenda === 'Cancelada' && codigoProduto === '39806') {
          api.vendaCancelada(data).then(function (response) {
            res.status(200).send(response);
          }).catch(function (err) {
            console.log(err);
            res.status(300).send(err);
          });
        }

        else if (statusVenda === 'Finalizada' && codigoProduto === '39806') {
          api.removerWorkflow(data).then(function (response) {
            api.vendaFinalizada(data).then(function (finalRes) {
              res.status(200).send(finalRes);
            }).catch(function (err) {
              res.status(500).send(err);
            })
          }).catch(function (err) {
            res.status(500).send(err);
          })
        } else {
          res.status(404).send("Algo errado verique as validações");
        }

      } else {
        res.status(403).send("Chave Invalida");
      }
    });
  }

}());