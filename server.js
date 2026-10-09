const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Настройка подключения к базе MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'photo_studio'
});

db.connect(err => {
    if (err) {
        console.error('Ошибка подключения к MySQL:', err);
    } else {
        console.log('Успешное подключение к MySQL Workbench!');
    }
});

// 2. Эндпоинт для обработки бронирования
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
        res.status(201).json({
            message: 'Запись успешно сохранена!',
            appointmentId: result.insertId
        });
    });
});

// 3. Запуск сервера на порту 3000
app.listen(3000, () => {
    console.log('Бэкенд запущен на http://localhost:3000');
});