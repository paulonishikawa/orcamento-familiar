require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Usuario = require('./models/Usuario')

async function criarUsuario() {
    await mongoose.connect(process.env.MONGODB_URI)

    // Verifica se já existe
    const existe = await Usuario.findOne({ login: 'familia'})
    if (existe) {
        console.log('Usuário já existe!')
        process.exit()
    }

    // Cria o hash da senha
    const hash = await bcrypt.hash('170312', 10)

    // Salva no banco
    await Usuario.create({ login: 'familia', senha: hash })
    console.log('Usuário criado com sucesso!')
    process.exit()
}

criarUsuario()