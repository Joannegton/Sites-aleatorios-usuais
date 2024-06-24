const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    saldo: {
        type: Number,
        default: 100 // Defina o saldo inicial como 100
    }
});

module.exports = model('User', userSchema);
