const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const Loja = require('../esquemas/esquemaLoja');

// get para /lojas
router.get('/', (req, res) => {
    res.status(300).json({
        message: "It works!"
    });
});

// get lojas por chave
router.get('/carregar/:chave', (req, res) => {
    const chave = req.params.chave;
    const chaveId = chave.split('-').join('').toLowerCase();
    // {chaveIdentificacao: {$elemMatch: {chave: chave}}}
    Loja.findOne({chaveIdentificacao: chaveId})
        .exec()
        .then(doc => {
            if(doc != null){
                let resposta = doc;
                let pos = 0;
                let chaveResposta = [ ];

                for(i = 0; i < doc.chaveIdentificacao.length; i++){
                    if(doc.chaveIdentificacao[i] == chaveId){
                        pos = i;
                        break;
                    }
                }

                chaveResposta.push(doc.chaveFormatada[pos]);

                resposta.chaveFormatada = chaveResposta;
                
                console.log("Do banco de dados:", resposta);
                res.status(200).json(resposta);
            }
            else{
                console.log("Do banco de dados:", doc);
                res.status(200).json(doc);
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});

// Listar lojas
router.get('/listar/:idProprietario', (req, res) => {
    const idProprietario = req.params.idProprietario;
    Loja.find({idProprietario: idProprietario})
        .exec()
        .then(doc => {
            console.log("Do banco de dados:", doc);
            res.status(200).json(doc);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});

// Listar todas lojas
router.get('/listarLojas', (req, res) => {
    Loja.find()
        .exec()
        .then(doc => {
            console.log("Do banco de dados:", doc);
            res.status(200).json(doc);
        })
        .catch(err => {
            console.log(err);   
            res.status(500).json({error: err});
        });
});

// post para lojas/adicionar
router.post('/adicionar', async (req, res) => {

    let lojaExiste = false;
    let loja = null;
    let chave;
    const chaves = req.body.chaveIdentificacao;

    for(i = 0; i < chaves.length; i++){
        chave = chaves[i].split(' ').join('-');
        chave.toLowerCase();
        loja = await Loja.findOne({chaveIdentificacao: chave})
        .exec()
        .then()
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });

        if(loja != null){
            lojaExiste = true;
            break;
        }
    }

    if(!lojaExiste){

        let chavesArray = req.body.chaveIdentificacao;
        let chavesFormatadasArray = [];
        const idProprietario = uuidv4();

        for(i = 0; i < chavesArray.length; i++){
            //chavesFormatadas.push(chaves[i].split(' ').join('-'));
            chavesFormatadasArray[i] = chavesArray[i].split(' ').join('-');
            chavesArray[i] = chavesArray[i].split(' ').join('').toLowerCase();
        }

        const loja = new Loja({
            _id: mongoose.Types.ObjectId(),
            idProprietario: idProprietario,
            idPessoa: req.body.idPessoa,
            ativo: true,
            lojaDisponivel: false,
            franquia: req.body.franquia,
            pedidoValorMinimo: req.body.pedidoValorMinimo,
            chaveIdentificacao: chavesArray,
            chaveFormatada: chavesFormatadasArray,
            idEndereco: req.body.idEndereco,
            telefones: req.body.telefones,
            entregaBairro: req.body.entregaBairro,
            entregaArea: req.body.entregaArea,
            links: req.body.links
        });

        loja
            .save()
            .then(result => {
                console.log(result);
                res.status(201).json(result);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                })
            });
    }
    else{
        res.status(500).json({
            erro: "Erro: Pelo menos uma das chaves de identificação já foi cadastrada previamente."
        })
    }
});


router.post('/abrirLoja/:idProprietario/:id', (req, res) => {
    const idProprietario = req.params.idProprietario;
    const id = req.params.id;

    Loja.findOne({idProprietario: idProprietario, _id: id})
    .exec()
        .then(doc => {

            doc.lojaDisponivel = true;

            doc
                .save()
                .then(result => {
                    res.status(200).json(result);
                })
                .catch(err => {
                    res.status(500).json({error: err});
                });                        
            })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
})

router.post('/fecharLoja/:idProprietario/:id', (req, res) => {
    const idProprietario = req.params.idProprietario;
    const id = req.params.id;

    Loja.findOne({idProprietario: idProprietario, _id: id})
    .exec()
        .then(doc => {

            doc.lojaDisponivel = false;

            doc
                .save()
                .then(result => {
                    res.status(200).json(result);
                })
                .catch(err => {
                    res.status(500).json({error: err});
                });                        
            })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
})

router.put('/alterar/:idProprietario/:id', (req, res) => {
    const id = req.params.id;
    const idProprietario = req.params.idProprietario; 
    const alteracoes = {};

    for(const [ch, val] of Object.entries(req.body)){
        alteracoes[ch] = val;
    }

    Loja.update(
        {_id: id}, 
        { $set: alteracoes},
        {arrayFilters: [{idProprietario: idProprietario, _id: id}]}
    )
    .exec()
        .then(doc => {
            console.log("Do banco de dados:", doc);
            res.status(200).json(doc);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});

/*router.patch('/alterar/:id/:chave', (req, res) => {
    const id = req.params.id;
    const chave = req.params.chave; 
    const alteracoes = {};

    for(const [ch, val] of Object.entries(req.body)){
        alteracoes[ch] = val;
    }

    Loja.update(
        {_id: id}, 
        { $set: alteracoes},
        {arrayFilters: [{chaveIdentificacao.chave: chave }]}
    )
    .exec()
        .then(doc => {
            console.log("Do banco de dados:", doc);
            res.status(200).json(doc);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
})

// alterar loja
/*
router.patch('/alterar/:id/:chave', (req, res) => {
    const id = req.params.id;
    const chave = req.params.chave; 
    const alteracoes = {};

    for(const [ch, val] of Object.entries(req.body)){
        alteracoes[ch] = val;
    }

    Loja.update(
        {_id: id}, 
        { $set: alteracoes},
        {arrayFilters: [{chave: chave }]}
    )
    .exec()
        .then(doc => {
            console.log("Do banco de dados:", doc);
            res.status(200).json(doc);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
})
*/

module.exports = router;