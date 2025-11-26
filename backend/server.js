const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Servir carpeta public
app.use(express.static(path.join(__dirname, "../public")));

// Conectar base de datos
const db = new sqlite3.Database(path.join(__dirname, "database.sqlite"), (err) => {
    if (err) console.error(err.message);
    console.log("Base de datos conectada.");
});

// Crear tablas
db.run(`
CREATE TABLE IF NOT EXISTS alumnos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    curso TEXT
)`);

db.run(`
CREATE TABLE IF NOT EXISTS progreso (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alumno_id INTEGER,
    nivel INTEGER,
    puntaje INTEGER,
    fecha TEXT,
    FOREIGN KEY(alumno_id) REFERENCES alumnos(id)
)`);

// ENDPOINTS ------------------------------------------------------

// Registrar alumno
app.post("/api/alumnos", (req, res) => {
    const { nombre, curso } = req.body;
    db.run(
        `INSERT INTO alumnos (nombre, curso) VALUES (?, ?)`,
        [nombre, curso],
        function () { res.json({ id: this.lastID }); }
    );
});

// Guardar progreso
app.post("/api/progreso", (req, res) => {
    const { alumno_id, nivel, puntaje } = req.body;
    db.run(
        `INSERT INTO progreso (alumno_id, nivel, puntaje, fecha)
         VALUES (?, ?, ?, datetime('now'))`,
        [alumno_id, nivel, puntaje],
        function () { res.json({ status: "ok" }); }
    );
});

// Obtener progreso
app.get("/api/progreso/:id", (req, res) => {
    db.all(
        `SELECT * FROM progreso WHERE alumno_id = ?`,
        [req.params.id],
        (err, rows) => res.json(rows)
    );
});

// INICIAR SERVIDOR ----------------------------------------------
app.listen(3000, () => {
    console.log("Servidor funcionando en http://localhost:3000");
});

