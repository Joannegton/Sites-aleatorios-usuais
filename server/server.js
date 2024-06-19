const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectDb } = require('./dbConfig');
const Aposta = require('./schema');
const User = require('./userSchema'); 

connectDb();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, '../public')));

// Rota para servir o arquivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

// Rota para receber as apostas
app.post('/place-bet', async (req, res) => {
    try {
        const { nome, aposta1, aposta2, aposta3, saldoAtual } = req.body;

        if (!nome || !aposta1 || !aposta2 || !aposta3 || saldoAtual == null) {
            return res.status(400).json({ message: 'Dados insuficientes.' });
        }

        const novaAposta = new Aposta({
            nome,
            aposta1,
            aposta2,
            aposta3,
            saldoAtual
        });

        await novaAposta.save();
        res.json({ message: 'Apostas realizadas com sucesso!' });

    } catch (error) {
        console.error('Erro ao processar as apostas:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});


// Rota para autenticação de login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Dados insuficientes.' });
    }

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ message: 'Usuário não encontrado.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Senha incorreta.' });
        }

        const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });

        res.json({ success: true, token });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
