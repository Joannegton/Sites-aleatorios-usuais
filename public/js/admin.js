document.addEventListener('DOMContentLoaded', () => {
    const apostasContainer = document.getElementById('apostas-container');
    const winnerForm = document.getElementById('winner-form');

    // Fetch and display bets
    fetch('https://71f5-201-55-46-78.ngrok-free.app/admin/apostas')
        .then(response => response.json())
        .then(apostas => {
            apostasContainer.innerHTML = '';
            apostas.forEach(aposta => {
                const apostaElement = document.createElement('div');
                apostaElement.innerHTML = `
                    <h3>Usuário: ${aposta.userId.username} (ID: ${aposta.userId._id})</h3>
                    <p>Saldo Atual: R$${aposta.saldoAtual}</p>
                    <ul>
                        ${aposta.lutas.map(luta => `<li>${luta.competidor}: R$${luta.valor}</li>`).join('')}
                    </ul>
                `;
                apostasContainer.appendChild(apostaElement);
            });
        })
        .catch(error => {
            console.error('Erro ao obter apostas:', error);
            alert('Ocorreu um erro ao obter as apostas. Tente novamente.');
        });

    // Handle winner form submission
    winnerForm.addEventListener('submit', event => {
        event.preventDefault();
        
        const formData = new FormData(winnerForm);
        const lutaId = formData.get('lutaId');
        const competidorVencedor = formData.get('competidorVencedor');

        fetch('https://71f5-201-55-46-78.ngrok-free.app/admin/definir-vencedor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ lutaId, competidorVencedor })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        })
        .catch(error => {
            console.error('Erro ao definir vencedor:', error);
            alert('Ocorreu um erro ao definir o vencedor. Tente novamente.');
        });
    });
});
