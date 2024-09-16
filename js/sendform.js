function sendData() {
    var formData = new FormData(document.getElementById('form_send'));

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