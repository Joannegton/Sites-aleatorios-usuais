const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectDb } = require('./dbConfig');
const Aposta = require('./schema');
const User = require('./userSchema');

connectDb();
const app = express();
const PORT = process.env.PORT || 3001;

// Configurar CORS para permitir o domínio específico
const corsOptions = {
    origin: ' https://71f5-201-55-46-78.ngrok-free.app',
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, '../public')));

// Rota para servir o arquivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});


// Rota para pegar usuário pelo ID
app.get('/get-user/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.json(user);
    } catch (error) {
        console.error('Erro ao pegar usuário:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
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

        const isMatch = password === user.password;

        if (!isMatch) {
            return res.status(400).json({ message: 'Senha incorreta.' });
        }

        res.json({ success: true, message: 'Login efetuado com sucesso!', userId: user._id });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// Rota para cadastro de usuário
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Dados insuficientes.' });
    }

    try {
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ message: 'Usuário já existe.' });
        }

        const newUser = new User({
            username,
            password
        });

        await newUser.save();
        res.json({ success: true, message: 'Usuário cadastrado com sucesso!' });
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
