const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { placeBet, getUser } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, '../public')));

// Rota para servir o arquivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Rota para receber as apostas
app.post('/place-bet', async (req, res) => {
   /* const { competitors, amount } = req.body;

    if (competitors.length === 0) {
        return res.json({ message: 'Você pode apostar apenas em até 2 concorrentes.' });
    }

    const user = await getUser(1); // Pega o usuário com id 1 (simulado)
    if (user.balance < amount) {
        return res.json({ message: 'Saldo insuficiente!' });
    }

    await placeBet(user.id, competitors, amount);
    res.json({ message: 'Aposta realizada com sucesso!' }); */

    const bets = req.body;
    console.log('Apostas recebidas:', bets);

    if (!Array.isArray(bets) || bets.length === 0) {
        return res.status(400).json({ message: 'Nenhuma aposta enviada.' });
    }

    // Adicione aqui a lógica para processar as apostas
    // Por exemplo, salvar as apostas em um banco de dados

    res.json({ message: 'Apostas recebidas com sucesso!' });
   
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
