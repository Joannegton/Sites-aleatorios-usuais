document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const username = formData.get('username');
        const password = formData.get('password');

        const registerData = {
            username,
            password
        };

        fetch(' https://71f5-201-55-46-78.ngrok-free.app/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = 'index.html'; 
                console.log(registerData)
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Ocorreu um erro ao registrar. Tente novamente.');
        });
    });
});
