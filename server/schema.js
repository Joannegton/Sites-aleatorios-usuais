const { Schema, model } = require('mongoose');

const apostaSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lutas: [{
        lutaId: {
            type: String,
            required: true
        },
        aposta: {
            competidor: {
                type: String,
                required: true
            },
            valor: {
                type: Number,
                required: true
            }
        }
    }],
    saldoAtual: {
        type: Number,
        required: true
    }
});

module.exports = model('Aposta', apostaSchema);
