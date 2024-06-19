document.getElementById('bet-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const username = 'well'; // Substitua pelo nome do usuário atual
    const bets = {
        nome: username,
        aposta1: {
            competidor: formData.get('fight1'),
            valor: formData.get('amount1')
        },
        aposta2: {
            competidor: formData.get('fight2'),
            valor: formData.get('amount2')
        },
        aposta3: {
            competidor: formData.get('fight3'),
            valor: formData.get('amount3')
        },
        saldoAtual: 100 - (parseInt(formData.get('amount1') || 0) + parseInt(formData.get('amount2') || 0) + parseInt(formData.get('amount3') || 0))
    };

    fetch('https://0e80-45-6-29-77.ngrok-free.app/place-bet', {
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
