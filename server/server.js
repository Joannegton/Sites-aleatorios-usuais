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
// Rota para servir a página HTML de administrador
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'admin.html'));
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
        const { nome, aposta1, aposta2, aposta3, saldoAtual, userId } = req.body;

        if (!nome || !aposta1 || !aposta2 || !aposta3 || saldoAtual == null) {
            return res.status(400).json({ message: 'Dados insuficientes.' });
        }

        const novaAposta = new Aposta({
            nome,
            aposta1,
            aposta2,
            aposta3,
            saldoAtual,
            userId
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

app.post('/distribute-winnings', async (req, res) => {
    try {
        const { fightId, winner } = req.body;

        const apostas = await Aposta.find({ [`aposta${fightId}.competidor`]: winner });

        let totalApostas = 0;
        apostas.forEach(aposta => {
            totalApostas += aposta[`aposta${fightId}`].valor;
        });

        apostas.forEach(async aposta => {
            const user = await User.findById(aposta.userId);
            const ganho = (aposta[`aposta${fightId}`].valor / totalApostas) * totalApostas;
            user.saldo += ganho;
            await user.save();
        });

        res.json({ message: 'Ganhos distribuídos com sucesso!' });

    } catch (error) {
        console.error('Erro ao distribuir ganhos:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});


app.post('/update-winner', async (req, res) => {
    try {
        const { fightId, winner } = req.body;

        // Distribuir os ganhos para os apostadores que apostaram no vencedor
        const apostas = await Aposta.find({ [`aposta${fightId}.competidor`]: winner });

        let totalApostas = 0;
        apostas.forEach(aposta => {
            totalApostas += aposta[`aposta${fightId}`].valor;
        });

        const distribuicoes = [];

        apostas.forEach(async aposta => {
            const user = await User.findById(aposta.userId);
            const ganho = (aposta[`aposta${fightId}`].valor / totalApostas) * totalApostas;
            user.saldo += ganho;
            await user.save();
            distribuicoes.push({ userId: user._id, ganho });
        });

        res.json({ message: 'Vencedor atualizado e ganhos distribuídos com sucesso!', distribuicoes });
    } catch (error) {
        console.error('Erro ao atualizar vencedor:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
