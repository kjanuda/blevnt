// app.js
const express = require('express');
const pool = require('./db');
require('dotenv').config();
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4000;

/* GET all */
app.get('/events', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM events ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

/* GET by id */
app.get('/events/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

/* CREATE */
app.post('/events', async (req, res) => {
  try {
    const { title, eventName, type, location, date, category, description, imageUrl, moreInfoLink } = req.body;
    const [result] = await pool.query(
      `INSERT INTO events (title, eventName, type, location, date, category, description, imageUrl, moreInfoLink)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, eventName, type, location, date, category, description, imageUrl, moreInfoLink]
    );
    const insertedId = result.insertId;
    const [newRow] = await pool.query('SELECT * FROM events WHERE id = ?', [insertedId]);
    res.status(201).json(newRow[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

/* UPDATE */
app.put('/events/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { title, eventName, type, location, date, category, description, imageUrl, moreInfoLink } = req.body;
    await pool.query(
      `UPDATE events SET title=?, eventName=?, type=?, location=?, date=?, category=?, description=?, imageUrl=?, moreInfoLink=? WHERE id=?`,
      [title, eventName, type, location, date, category, description, imageUrl, moreInfoLink, id]
    );
    const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

/* DELETE */
app.delete('/events/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
