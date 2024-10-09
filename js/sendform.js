// function sendData() {
//     var formData = new FormData(document.getElementById('form_send'));
    
//     // const phoneRegex = /^\+7\s\\d{3}\\s\d{3}\d{2}\d{2}$/;

//     // if (!phoneRegex.test(phone)) {
//     //     alert('Пожалуйста, введите номер телефона в формате: +7 (999) 999-99-99');
//     //     return false; // Остановка отправки формы
//     // }

//     fetch('localhost:12345', {
//         method: 'POST', 
//         body: formData
//     })
//     .then(response => response.text())
//     .then(data => {
//         console.log(data); // Обработка ответа сервера
//     })
//     .catch(error => console.error('Ошибка:', error));
// }

form_send.onsubmit = async (e) => {
    e.preventDefault();

    let response = await fetch('127.0.0.1:8080', {
      method: 'POST',
      body: new FormData(form_send)
    });

    let result = await response.json();

    alert(result.message);
  };