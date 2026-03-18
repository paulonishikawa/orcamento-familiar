// ==============================
// ORÇAMENTO FAMILIAR - SERVIDOR
// ==============================

const express = require('express')
const app = express()
const PORTA = 3000

// Middleware - permite o servidor ler JSON no corpo das requisições
app.use(express.json())

// Rota de teste - GET /
app.get('/', function(req, res) {
    res.json({ mensagem: 'Servidor funcionando!'})
})

// Inicia o servidor
app.listen(PORTA, function() {
    console.log(`Servidor rodando em http://localhost:${PORTA}`)
})