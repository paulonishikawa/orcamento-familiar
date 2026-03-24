// ==============================
// ORÇAMENTO FAMILIAR - SERVIDOR
// ==============================

require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cors = require('cors')

const Mes = require('./models/Mes')
const Usuario = require('./models/Usuario')

const app = express()
const PORTA = process.env.PORT || 3000

// Middleware - permite o servidor ler JSON no corpo das requisições
app.use(express.json())
app.use(cors())

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB conectado!'))
    .catch(err => console.log('Erro ao conectar:', err))

// ==============================
// MIDDLEWARE DE AUTENTICAÇÃO
// ==============================

function verificarToken(req, res, next) {
    const token = req.headers['authorization']

    if (!token) {
        return res.status(401).json({ erro: 'Token não fornecido' })
    }

    try {
        const dados = jwt.verify(token, process.env.JWT_SECRET)
        req.usuario = dados
        next() // passa para a próxima função (a rota)
    } catch (err) {
        return res.status(401).json({ erro: 'Token inválido'})
    }
}

// ==============================
// ROTAS PÚBLICAS (sem login)
// ==============================

// POST /login - recebe login e senha, retorna token
app.post('/login', async function(req, res) {
    try {
        const { login, senha } = req.body

        // Busca o usuário
        const usuario = await Usuario.findOne({ login })
        if (!usuario) {
            return res.status(401).json({ erro: 'Usuário não encontrado' })
        }

        // Verifica a senha
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha)
        if (!senhaCorreta) {
            return res.status(401).json({ erro: 'Senha incorreta' })
        }

        // Gera o token (válido por 30 dias)
        const token = jwt.sign(
            { login: usuario.login },
            process.env.JWT_SECRET,
            { expiresIn: '30d'}
        )

        res.json({ token })
    } catch (err) {
        res.status(500).json({ erro: 'Erro no login' })
    }
})

// ==============================
// ROTAS PROTEGIDAS (exigem token)
// ==============================

// GET /meses - busca todos os meses
app.get('/meses', verificarToken, async function(req, res) {
    try {
        const meses = await Mes.find()
        res.json(meses)
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar meses' })
    }
})

// PUT /meses/:mesId - salva ou atualiza um mês
app.put('/meses/:mesId', verificarToken, async function(req, res) {
    try {
        const { mesId } = req.params        
        const { dados } = req.body

        const mes = await Mes.findOneAndUpdate(
            { mesId },              // procura por este mesId
            { mesId, dados },       // atualiza com estes dados
            { upsert: true, returnDocument: 'after' } // cria se não existir
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