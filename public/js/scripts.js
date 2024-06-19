document.getElementById('bet-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const username = 'well'; // Substitua pelo nome do usuário atual
    const bets = [];

    if (formData.get('fight1')) {
        bets.push({
            fight: 'Richard vs Victor',
            competitor: formData.get('fight1'),
            amount: formData.get('amount1'),
            
        });
    }
    if (formData.get('fight2')) {
        bets.push({
            fight: 'Ana Livia vs Adrianna',
            competitor: formData.get('fight2'),
            amount: formData.get('amount2'),
            user: username
        });
    }
    if (formData.get('fight3')) {
        bets.push({
            fight: 'Christopher vs Erik',
            competitor: formData.get('fight3'),
            amount: formData.get('amount3'),
            user: username
        });
    }

    if (bets.length === 0) {
        alert('Você deve apostar em pelo menos uma luta.');
        return;
    }

    const isValidAmount = (amount) => amount >= 33 && amount <= 100;
    if (!bets.every(bet => isValidAmount(bet.amount))) {
        alert('Valor de aposta inválido.');
        return;
    }

    fetch('/place-bet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bets)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Ocorreu um erro ao enviar a aposta. Tente novamente.');
    });
});
