const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer'); // 1. Подключаем Nodemailer

const app = express();
app.use(cors());
app.use(express.json());

// Отдача статических файлов (calendar.html, submitBooking.js)
app.use(express.static(__dirname));

// Подключение к облачной БД из переменных окружения Render
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

// 2. Настройка почтового транспорта (Gmail / Yandex / Ukr.net)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Ваш email
        pass: process.env.EMAIL_PASS  // Пароль приложения
    }
});

// Обработка отправки формы
app.post('/api/appointments', (req, res) => {
    const { client_name, client_email, appointment_date, appointment_time } = req.body;

    const sql = `
        INSERT INTO appointments (client_name, client_email, appointment_date, appointment_time)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [client_name, client_email, appointment_date, appointment_time], (err, result) => {
        if (err) {
            console.error('Ошибка при записи в БД:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        console.log(`Новая запись создана с ID: ${result.insertId}`);

        // 3. Отправка email-уведомления клиенту
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: client_email,
            subject: 'Подтверждение бронирования фотосессии',
            text: `Здравствуйте, ${client_name}!\n\nВы успешно записались на фотосессию.\nДата: ${appointment_date}\nВремя: ${appointment_time}\n\nСпасибо за бронирование!`
        };

        transporter.sendMail(mailOptions, (mailErr, info) => {
            if (mailErr) {
                console.error('Ошибка отправки email:', mailErr);
            } else {
                console.log('Email успешно отправлен:', info.response);
            }
        });

        res.status(201).json({
            message: 'Запись успешно сохранена!',
            appointmentId: result.insertId
        });
    });
});

// Открытие календаря по умолчанию на главной странице /
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'calendar.html'));
});

// Динамический порт от Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
