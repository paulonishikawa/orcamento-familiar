const mongoose = require('mongoose')

const MesSchema = new mongoose.Schema({
    mesId: { type: String, required: true, unique: true },
    // ex: "2026-03"
    dados: { type: Object, required: true }
    // guarda o objeto inteiro do mês (salários, contas, mercado, etc)
})

module.exports = mongoose.model('Mes', MesSchema)