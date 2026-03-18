// ==============================
// ORÇAMENTO FAMILIAR - SERVIDOR
// ==============================

require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const Mes = require('./models/Mes')

const app = express()
const PORTA = process.env.PORT || 3000

// Middleware - permite o servidor ler JSON no corpo das requisições
app.use(express.json())

const cors = require('cors')
app.use(cors())

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB conectado!'))
    .catch(err => console.log('Erro ao conectar:', err))

// ==============================
// ROTAS
// ==============================

// GET /meses - busca todos os meses
app.get('/meses', async function(req, res) {
    try {
        const meses = await Mes.find()
        res.json(meses)
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar meses' })
    }
})

// PUT /meses/:mesId - salva ou atualiza um mês
app.put('/meses/:mesId', async function(req, res) {
    try {
        const { mesId } = req.params
        const { dados } = req.body

        const mes = await Mes.findOneAndUpdate(
            { mesId },              // procura por este mesId
            { mesId, dados },       // atualiza com estes dados
            { upsert: true, new: true } // cria se não existir
        )

        res.json(mes)
    } catch (err) {
        console.log('ERRO DETALHADO', err.message)
        res.status(500).json({ erro: 'Erro ao salvar mês' })
    }
})

// Inicia o servidor
app.listen(PORTA, function() {
    console.log(`Servidor rodando em http://localhost:${PORTA}`)
})