document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('winner-form');

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const fightId = formData.get('fightId');
        const winner = formData.get('winner');

        const winnerData = {
            fightId,
            winner
        };

        fetch('https://71f5-201-55-46-78.ngrok-free.app/update-winner', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(winnerData)
        })
        .then(response => response.json())
        .then(data => {
            const resultDiv = document.getElementById('result');
            if (data.message) {
                resultDiv.textContent = data.message;
                if (data.distribuicoes) {
                    resultDiv.innerHTML += '<br>Distribuições:<br>';
                    data.distribuicoes.forEach(distribuicao => {
                        resultDiv.innerHTML += `User ID: ${distribuicao.userId}, Ganho: ${distribuicao.ganho}<br>`;
                    });
                }
            } else {
                resultDiv.textContent = 'Erro ao atualizar vencedor.';
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Ocorreu um erro ao atualizar o vencedor. Tente novamente.');
        });
    });
});
