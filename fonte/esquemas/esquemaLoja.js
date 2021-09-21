mongoose = require('mongoose')

const EsquemaLoja = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectID,
    idProprietario: String,
    idPessoa: String,
    ativo: Boolean,
    lojaDisponivel: Boolean,
    franquia: String,
    chaveIdentificacao: [String],
    chaveFormatada: [String],
    telefones: [String],
    pedidoValorMinimo: Number,
    entregaBairro: [
      {
        bairro: String,
        cidade: String,
        valor: Number,
        areaRecusada: Boolean
      }
    ],
    entregaArea: [
      {
        distancia: Number,
        valor: Number
      }
    ],
    links: [
      {
        nome: String,
        url: String
      }
    ]
});

module.exports = mongoose.model('Loja', EsquemaLoja);
