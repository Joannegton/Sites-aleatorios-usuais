const { Schema, model } = require('mongoose');

const apostaSchema = new Schema({
    nome: {
        type: String,
        required: true
    },
    aposta1: {
        competidor: {
            type: String,
            required: true
        },
        valor: {
            type: Number,
            required: true
        }
    },
    aposta2: {
        competidor: {
            type: String,
            required: true
        },
        valor: {
            type: Number,
            required: true
        }
    },
    aposta3: {
        competidor: {
            type: String,
            required: true
        },
        valor: {
            type: Number,
            required: true
        }
    },
    saldoAtual: {
        type: Number,
        required: true
    }
});

module.exports = model('Aposta', apostaSchema);
