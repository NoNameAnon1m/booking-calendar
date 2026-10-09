let chosenDate = '';
let chosenTime = '';

function selectDate(element, dateStr) {
    document.querySelectorAll('.day-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');

    chosenDate = dateStr;
    document.getElementById('selectedDateText').innerText = dateStr;

    document.getElementById('slotsBlock').style.display = 'block';
    document.getElementById('formBlock').style.display = 'none';
    document.getElementById('successBlock').style.display = 'none';
}

function selectTime(timeStr) {
    chosenTime = timeStr;
    document.getElementById('summaryText').innerText = `${chosenDate} в ${chosenTime}`;

    document.getElementById('formBlock').style.display = 'block';
    document.getElementById('successBlock').style.display = 'none';
}

async function submitBooking(event) {
    event.preventDefault();

    const bookingData = {
        client_name: document.getElementById('clientName').value,
        client_email: document.getElementById('clientEmail').value,
        appointment_date: chosenDate,
        appointment_time: chosenTime
    };

    try {
        // Относительный путь для корректной работы как локально, так и на хостинге
        const response = await fetch('/api/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });

        if (response.ok) {
            document.getElementById('formBlock').style.display = 'none';
            document.getElementById('successBlock').style.display = 'block';
        } else {
            alert('Ошибка сервера при записи.');
        }
    } catch (error) {
        console.error('Ошибка сети:', error);
        alert('Сервер недоступен. Проверьте запуск сервера.');
    }
}