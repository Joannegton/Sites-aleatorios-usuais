const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectDb } = require('./dbConfig');
const Aposta = require('./schema'); // Importando o modelo

connectDb();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, '../public')));

// Rota para servir o arquivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Rota para receber as apostas
app.post('/place-bet', async (req, res) => {
    try {
        const { nome, aposta1, aposta2, aposta3, aposta4, saldoAtual } = req.body;

        if (!nome || !aposta1 || !aposta2 || !aposta3 || !aposta4 || saldoAtual == null) {
            return res.status(400).json({ message: 'Dados insuficientes.' });
        }

        const novaAposta = new Aposta({
            nome,
            aposta1,
            aposta2,
            aposta3,
            aposta4,
            saldoAtual
        });

        await novaAposta.save();
        res.json({ message: 'Apostas realizadas com sucesso!' });

    } catch (error) {
        console.error('Erro ao processar as apostas:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
