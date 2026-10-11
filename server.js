const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const { Resend } = require('resend');

const app = express();
app.use(cors());
app.use(express.json());

// Инициализация почтового клиента Resend
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(express.static(__dirname));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect(err => {
    if (err) {
        console.error('Ошибка подключения к MySQL:', err);
    } else {
        console.log('Успешное подключение к облачной MySQL!');
    }
});

app.post('/api/appointments', async (req, res) => {
    const { client_name, client_email, appointment_date, appointment_time } = req.body;

    const sql = `
        INSERT INTO appointments (client_name, client_email, appointment_date, appointment_time)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [client_name, client_email, appointment_date, appointment_time], async (err, result) => {
        if (err) {
            console.error('Ошибка при записи в БД:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        console.log(`Новая запись создана с ID: ${result.insertId}`);

        try {
            const data = await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: client_email,
                subject: 'Подтверждение бронирования фотосессии',
                html: `<p>Здравствуйте, <strong>${client_name}</strong>!</p>
                       <p>Вы успешно записались на фотосессию.</p>
                       <p><strong>Дата:</strong> ${appointment_date}<br>
                       <strong>Время:</strong> ${appointment_time}</p>
                       <p>Спасибо за бронирование!</p>`
            });
            console.log('Email успешно отправлен через Resend:', data);
        } catch (mailError) {
            console.error('Ошибка отправки email:', mailError);
        }

        res.status(201).json({
            message: 'Запись успешно сохранена!',
            appointmentId: result.insertId
        });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'calendar.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
