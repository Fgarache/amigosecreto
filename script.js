let nombres = [];
let sorteoActivo = false;
let amigoSecretoYaAsignado = "";
let nombreDelUsuario = "";

// 1. CARGAR DATOS AL INICIO
async function cargarDatosIniciales() {
    console.log("🔍 Identificando usuario...");
    const userId = obtenerIdActual();
    if (!userId || userId === "index") return;

    try {
        const resNombres = await fetch(`${CONFIG.API_URL}?action=read`);
        const dataNombres = await resNombres.json();
        nombres = dataNombres.map(u => u.Nombre);

        const resUser = await fetch(`${CONFIG.API_URL}?action=getAssignment&id=${userId}`);
        const dataUser = await resUser.json();

        if (dataUser.result === "success") {
            nombreDelUsuario = dataUser.nombreUsuario;
            amigoSecretoYaAsignado = dataUser.amigoSecreto;

            // Mostrar saludo
            const badge = document.querySelector('.player-badge');
            if (badge) badge.innerText = `HOLA ${nombreDelUsuario.toUpperCase()}`;
            console.log("✅ Usuario identificado:", nombreDelUsuario);
        } else {
            // BLOQUEO: Si Google devuelve error (porque el estado es 1)
            document.getElementById('name-display').innerText = "YA PARTICIPASTE";
            const btn = document.getElementById('spin-btn');
            if (btn) btn.style.display = "none"; 
            console.warn("🚫 Acceso denegado: " + dataUser.msg);
        }
    } catch (error) {
        console.error("❌ Error en carga inicial:", error);
    }
}

// 2. INICIAR SORTEO
async function iniciarSorteo() {
    if (sorteoActivo || !amigoSecretoYaAsignado) return;

    const audio = document.getElementById('bg-music');
    if (audio) { audio.currentTime = 0; audio.play(); }

    const btn = document.getElementById('spin-btn');
    const display = document.getElementById('name-display');
    
    btn.disabled = true;
    sorteoActivo = true;

    let vueltas = 0;
    const intervalo = setInterval(() => {
        const nombreAzar = nombres[Math.floor(Math.random() * nombres.length)];
        display.innerText = nombreAzar || "SORTEANDO...";
        vueltas++;

        if (vueltas >= 50) { // 5 segundos
            clearInterval(intervalo);
            mostrarResultadoFinal();
        }
    }, 100);
}

// 3. MOSTRAR RESULTADO Y BLOQUEAR
function mostrarResultadoFinal() {
    document.getElementById('name-display').innerText = amigoSecretoYaAsignado;
    const btn = document.getElementById('spin-btn');
    if (btn) btn.style.display = "none"; // Desaparece al instante

    setTimeout(() => {
        document.getElementById('winner-text').innerText = amigoSecretoYaAsignado;
        document.getElementById('result-overlay').classList.remove('hidden');
        
        const userId = obtenerIdActual();
        // Llamada para poner el 1 en la Columna D
        fetch(`${CONFIG.API_URL}?action=marcarVisto&idJugador=${userId}`);
    }, 800);

    sorteoActivo = false;
}

function obtenerIdActual() {
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    if (!id) {
        const urlParts = window.location.pathname.split('/');
        id = urlParts[urlParts.length - 1].replace('.html', '');
    }
    return id;
}

function detenerMusica() {
    const audio = document.getElementById('bg-music');
    if (audio) { audio.pause(); audio.currentTime = 0; }
    document.getElementById('result-overlay').classList.add('hidden');
    location.reload(); // Recargar para confirmar bloqueo
}

cargarDatosIniciales();