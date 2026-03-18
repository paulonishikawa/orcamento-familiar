// ==============================
// ORÇAMENTO FAMILIAR - SERVIDOR
// ==============================

require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')

const app = express()
const PORTA = process.env.PORT || 3000

// Middleware - permite o servidor ler JSON no corpo das requisições
app.use(express.json())

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB conectado!'))
    .catch(err => console.log('Erro ao conectar:', err))

// Rota de teste - GET /
app.get('/', function(req, res) {
    res.json({ mensagem: 'Servidor funcionando!'})
})

// Inicia o servidor
app.listen(PORTA, function() {
    console.log(`Servidor rodando em http://localhost:${PORTA}`)
})