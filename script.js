const urlParams = new URLSearchParams(window.location.search);
const MI_ID = urlParams.get('id') || "1";

const nameDisplay = document.getElementById('name-display');
const spinBtn = document.getElementById('spin-btn');
let todasLasOpciones = [];
let miParejaAsignada = null;

async function cargarDatos() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=read&t=${new Date().getTime()}`);
        const data = await response.json();
        todasLasOpciones = data;

        const miRegistro = data.find(d => d.ID.toString() === MI_ID);
        if (!miRegistro) {
            document.body.innerHTML = "<h1>ID de usuario no encontrado</h1>";
            return;
        }

        document.getElementById('display-id').innerText = miRegistro.Nombre;

        // Si el Master ya asignó a alguien, lo buscamos
        const idPareja = miRegistro.Pareja;
        miParejaAsignada = data.find(d => d.ID.toString() === idPareja.toString());

        if (miRegistro.Estado.toString() === "1") {
            document.getElementById('msg-container').innerHTML = `
                <div class="info-box">
                    <p>Ya descubriste a tu amigo secreto:</p>
                    <h1 style="color: #f1c40f;">${miParejaAsignada.Nombre}</h1>
                </div>`;
            nameDisplay.innerText = miParejaAsignada.Nombre;
            spinBtn.style.display = 'none';
        }
    } catch (e) { console.error(e); }
}

spinBtn.addEventListener('click', () => {
    if (!miParejaAsignada) return alert("El sorteo aún no ha sido generado por el Master.");
    
    spinBtn.disabled = true;
    let vueltas = 0;
    const maxVueltas = 40;

    const intervalo = setInterval(() => {
        const azar = todasLasOpciones[Math.floor(Math.random() * todasLasOpciones.length)].Nombre;
        nameDisplay.innerText = azar;
        
        vueltas++;
        if (vueltas > maxVueltas) {
            clearInterval(intervalo);
            nameDisplay.innerText = miParejaAsignada.Nombre;
            nameDisplay.style.color = "#2ecc71";
            marcarComoVisto();
        }
    }, 70);
});

async function marcarComoVisto() {
    await fetch(`${CONFIG.API_URL}?action=marcarVisto&idJugador=${MI_ID}`);
    setTimeout(() => {
        document.getElementById('winner-text').innerText = miParejaAsignada.Nombre;
        document.getElementById('overlay').classList.remove('hidden');
    }, 1000);
}

cargarDatos();