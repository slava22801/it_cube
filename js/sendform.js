function sendData() {
    var formData = new FormData(document.getElementById('form_send'));
    
    // const phoneRegex = /^\+7\s\\d{3}\\s\d{3}\d{2}\d{2}$/;

    // if (!phoneRegex.test(phone)) {
    //     alert('Пожалуйста, введите номер телефона в формате: +7 (999) 999-99-99');
    //     return false; // Остановка отправки формы
    // }

    fetch('url', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        console.log(data); // Обработка ответа сервера
    })
    .catch(error => console.error('Ошибка:', error));
}

