let alumnoId = null;
let puntaje = 0;
let nivelActual = 1;
let preguntaActual = 0;

const niveles = {
    1: [
        {
            question: "¿Cuál es el triángulo?",
            img: "assets/img/triangulo.png",
            options: ["Círculo", "Triángulo", "Cuadrado"],
            correct: 1
        },
        {
            question: "¿Cuál tiene 4 lados?",
            img: "assets/img/cuadrado.png",
            options: ["Pentágono", "Triángulo", "Cuadrado"],
            correct: 2
        }
    ],
    2: [
        {
            question: "Un pentágono tiene...",
            img: "assets/img/pentagono.png",
            options: ["5 lados", "4 lados", "6 lados"],
            correct: 0
        }
    ]
};

// Función para manejar clicks y touch
function addTouchClick(element, handler) {
    element.addEventListener("click", handler);
    element.addEventListener("touchstart", handler);
}

async function registrarAlumno() {
    const nombre = document.getElementById("nombre").value;
    const curso = document.getElementById("curso").value;

    const r = await fetch("https://geometriagame.onrender.com/api/alumnos", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ nombre, curso })
    });

    const data = await r.json();
    alumnoId = data.id;

    document.getElementById("menu").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");

    cargarPregunta();
}

function cargarPregunta() {
    const preguntas = niveles[nivelActual];

    if (preguntaActual >= preguntas.length) {
        guardarNivel();
        return pasarNivel();
    }

    const p = preguntas[preguntaActual];

    document.getElementById("nivel").innerText = "Nivel " + nivelActual;
    document.getElementById("question").innerText = p.question;

    // Limpiar pantalla
    document.getElementById("options").innerHTML = "";
    document.getElementById("figure-img").src = p.img;

    // Pregunta tradicional
    if (!p.type || p.type === "multiple") {
        cargarMultipleChoice(p);
    }

    // Pregunta de arrastrar texto
    if (p.type === "drag-text") {
        cargarDragTexto(p);
    }
}


function verificar(element, index) {
    const correct = niveles[nivelActual][preguntaActual].correct;

    if (index === correct) {
        element.classList.add("correct");
        puntaje += 10;
        document.getElementById("score").innerText = puntaje;
    } else {
        element.classList.add("wrong");
    }

    document.getElementById("next-btn").classList.remove("hidden");
}

function pasarNivel() {
    nivelActual++;
    preguntaActual = 0;

    if (!niveles[nivelActual]) {
        finalDelJuego();
    } else {
        cargarPregunta();
    }
}

function finalDelJuego() {
    document.getElementById("question").innerText = "¡Fin del juego!";
    document.getElementById("options").innerHTML = "";
    document.getElementById("figure-img").src = "";
}

addTouchClick(document.getElementById("next-btn"), () => {
    preguntaActual++;
    document.getElementById("next-btn").classList.add("hidden");
    cargarPregunta();
});

async function guardarNivel() {
    await fetch("https://geometriagame.onrender.com/api/alumnos", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            alumno_id: alumnoId,
            nivel: nivelActual,
            puntaje
        })
    });
}

// Necesario para iPhone
document.addEventListener('touchstart', function(){}, true);

