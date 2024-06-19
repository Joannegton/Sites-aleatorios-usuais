document.addEventListener('DOMContentLoaded', () => {
    const saldoInicial = 100;
    const saldoElemento = document.getElementById('saldo-valor');
    const form = document.getElementById('bet-form');
    const inputs = form.querySelectorAll('input[type="number"]');
    const submitButton = document.getElementById('submit-button');

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

        // Desabilitar o botão de envio se o saldo for 0 ou menor
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
        const nome = 'well'; // Substitua pelo nome do usuário atual

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

        if (aposta1.amount < 1 || aposta2.amount < 1 || aposta3.amount < 1) {
            alert('Você deve apostar pelo menos R$1 em cada luta.');
            return;
        }

        if (saldoAtual < 0) {
            alert('Saldo insuficiente para realizar as apostas.');
            return;
        }

        const betData = {
            nome,
            aposta1,
            aposta2,
            aposta3,
            saldoAtual
        };


        fetch('https://c7e6-2804-214-8608-345c-9978-8766-460c-a67a.ngrok-free.app/place-bet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(betData)
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
});
