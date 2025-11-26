// server.js - Backend listo para Render
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();

// ---------------------------
// CORS
// ---------------------------
// Permite que tu frontend haga fetch al backend.
// Reemplaza la URL con la de tu frontend si la separas.
// Si frontend y backend juntos, puedes usar '*'
app.use(cors({
    origin: "https://geometria-frontend.onrender.com" // <- cambiar si es necesario
}));

// ---------------------------
// Body parser
// ---------------------------
app.use(bodyParser.json());

// ---------------------------
// Servir carpeta public (opcional)
// ---------------------------
// Solo si tu frontend está dentro del mismo repositorio
app.use(express.static(path.join(__dirname, "../public")));

// ---------------------------
// Base de datos SQLite
// ---------------------------
// Asegúrate de usar un Persistent Disk en Render si quieres que los datos persistan
const db = new sqlite3.Database(path.join(__dirname, "database.sqlite"), (err) => {
    if (err) console.error(err.message);
    console.log("Base de datos conectada.");
});

// Crear tablas si no existen
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

// ---------------------------
// ENDPOINTS
// ---------------------------

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

// Obtener progreso por alumno
app.get("/api/progreso/:id", (req, res) => {
    db.all(
        `SELECT * FROM progreso WHERE alumno_id = ?`,
        [req.params.id],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// ---------------------------
// INICIAR SERVIDOR
// ---------------------------
// Render asigna el puerto dinámicamente en la variable de entorno PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor funcionando en el puerto ${PORT}`);
});

