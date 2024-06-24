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
        const { userId, apostas, saldoAtual } = req.body;
        console.log('Dados recebidos:', { userId, apostas, saldoAtual });
        const novaAposta = new Aposta({
            userId,
            lutas: apostas,
            saldoAtual
        });

        await novaAposta.save();

        // Atualizar o saldo do usuário no banco de dados
        await User.findByIdAndUpdate(userId, { saldo: saldoAtual });

        res.status(201).json({ message: 'Apostas registradas com sucesso!' });
    } catch (error) {
        console.error('Erro ao registrar apostas:', error);
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
        const { lutaId, winner } = req.body;

        // Coletar todas as apostas para a luta especificada
        const apostas = await Aposta.find({ 'lutas.lutaId': lutaId, 'lutas.competidor': winner });

        let totalApostas = 0;
        apostas.forEach(aposta => {
            const luta = aposta.lutas.find(l => l.lutaId === lutaId && l.competidor === winner);
            totalApostas += luta.valor;
        });

        const distribuicoes = [];

        // Distribuir ganhos proporcionalmente
        for (const aposta of apostas) {
            const user = await User.findById(aposta.userId);
            const luta = aposta.lutas.find(l => l.lutaId === lutaId && l.competidor === winner);
            const ganho = (luta.valor / totalApostas) * totalApostas;
            user.saldo += ganho;
            await user.save();
            distribuicoes.push({ userId: user._id, ganho });
        }

        res.json({ message: 'Vencedor atualizado e ganhos distribuídos com sucesso!', distribuicoes });
    } catch (error) {
        console.error('Erro ao atualizar vencedor:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

app.get('/admin/apostas', async (req, res) => {
    try {
        const apostas = await Aposta.find().populate('userId', 'username saldo');
        res.json(apostas);
    } catch (error) {
        console.error('Erro ao obter apostas:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

app.post('/admin/definir-vencedor', async (req, res) => {
    try {
        const { lutaId, competidorVencedor } = req.body;

        const apostas = await Aposta.find({ "lutas.competidor": competidorVencedor });

        // Calcula os ganhos e atualiza o saldo dos usuários
        let totalValorApostado = 0;
        apostas.forEach(aposta => {
            const luta = aposta.lutas.find(l => l.competidor === competidorVencedor);
            totalValorApostado += luta.valor;
        });

        apostas.forEach(async (aposta) => {
            const luta = aposta.lutas.find(l => l.competidor === competidorVencedor);
            const ganho = (luta.valor / totalValorApostado) * totalValorApostado; // Ajustar se houver uma porcentagem de lucro
            const usuario = await User.findById(aposta.userId);
            usuario.saldo += ganho;
            await usuario.save();
        });

        res.json({ message: 'Vencedores definidos e ganhos distribuídos!' });
    } catch (error) {
        console.error('Erro ao definir vencedor:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});




app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
