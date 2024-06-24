document.addEventListener('DOMContentLoaded', () => {
    const saldoInicial = 100;
    const saldoElemento = document.getElementById('saldo-valor');
    const form = document.getElementById('bet-form');
    const inputs = form.querySelectorAll('input[type="number"]');
    const submitButton = document.getElementById('submit-button');

    const userId = localStorage.getItem('userId');

    if (!userId) {
        alert('Usuário não logado!');
        window.location.href = 'login.html';
        return;
    }

    fetch(`https://71f5-201-55-46-78.ngrok-free.app/get-user/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(user => {
        const nomeUsuario = user.username;

        function atualizarSaldo() {
            let totalAposta = 0;
            inputs.forEach(input => {
                const valor = parseInt(input.value) || 0;
                totalAposta += valor;
            });

            if (totalAposta > saldoInicial) {
                alert('Valor total das apostas excede o saldo disponível!');
                submitButton.disabled = true;
                return;
            }

            const saldoAtual = saldoInicial - totalAposta;
            saldoElemento.textContent = saldoAtual;

            if (saldoAtual < 0) {
                submitButton.disabled = true;
            } else {
                submitButton.disabled = false;
            }
        }

        inputs.forEach(input => {
            input.addEventListener('input', atualizarSaldo);
        });

        form.addEventListener('submit', function(event) {
            event.preventDefault();

            const formData = new FormData(event.target);

            const aposta1 = {
                competidor: formData.get('fight1'),
                valor: parseInt(formData.get('amount1')) || 0
            };

            const aposta2 = {
                competidor: formData.get('fight2'),
                valor: parseInt(formData.get('amount2')) || 0
            };

            const aposta3 = {
                competidor: formData.get('fight3'),
                valor: parseInt(formData.get('amount3')) || 0
            };

            const saldoAtual = parseInt(saldoElemento.textContent);

            if (aposta1.valor < 1 || aposta2.valor < 1 || aposta3.valor < 1) {
                alert('Você deve apostar pelo menos R$1 em cada luta.');
                return;
            }

            if (saldoAtual < 0) {
                alert('Saldo insuficiente para realizar as apostas.');
                return;
            }

            const betData = {
                nome: nomeUsuario,
                aposta1,
                aposta2,
                aposta3,
                saldoAtual,
                userId
            };

            fetch('https://71f5-201-55-46-78.ngrok-free.app/place-bet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(betData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                alert(data.message);
                form.reset();
                saldoElemento.textContent = saldoInicial;
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Ocorreu um erro ao enviar a aposta. Tente novamente.');
            });
        });
    })
    .catch(error => {
        console.error('Erro ao obter informações do usuário:', error);
        alert('Ocorreu um erro ao obter as informações do usuário. Tente novamente.');
    });
});
