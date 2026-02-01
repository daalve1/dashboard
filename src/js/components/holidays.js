import { mountCard } from '../utils/ui.js';

export async function initHolidays(targetId) {
    const ui = mountCard(targetId, 'Próximos festivos');
    if (!ui) return;
    ui.setLoading(true);

    const year = new Date().getFullYear();
    // Endpoint de Nager.Date para España (ES)
    const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/ES`;

    try {
        const res = await fetch(url);
        const festivosApi = await res.json();
        
        // 1. Definir tus festivos LOCALES manuales (Torrent 2025/2026 aprox)
        // El formato debe ser "YYYY-MM-DD"
        const festivosLocales = [
            { date: `${year}-02-03`, localName: "San Blas (Local)", counties: null }, 
            { date: `${year}-03-18`, localName: "Fallas (Local)", counties: null } 
        ];

        // 2. Filtrar y Unificar
        // Nos quedamos con los Nacionales (global: true) 
        // y los de Comunidad Valenciana (counties contiene "ES-VC")
        const festivosValidos = festivosApi.filter(f => {
            return f.global === true || (f.counties && f.counties.includes("ES-VC"));
        });

        // Unimos los de la API con los locales manuales
        const todosLosFestivos = [...festivosValidos, ...festivosLocales];

        // 3. Buscar el siguiente
        const hoy = new Date();
        // Ponemos la hora a 0 para comparar bien fechas
        hoy.setHours(0,0,0,0); 

        // Ordenamos por fecha
        todosLosFestivos.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Buscamos el primero que sea mayor o igual a hoy
        const proximo = todosLosFestivos.find(f => new Date(f.date) >= hoy);

        let html = "";

        if (proximo) {
            // Formatear fecha bonita (ej: 9 de octubre)
            const fechaObj = new Date(proximo.date);
            const opciones = { day: 'numeric', month: 'long', weekday: 'long' };
            const fechaTexto = fechaObj.toLocaleDateString('es-ES', opciones);

            // Calcular días restantes
            const diffTime = Math.abs(fechaObj - hoy);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

            html = `
                <div class="text-center py-1">
                    <h3 class="fw-bold mb-0 text-dark">${proximo.localName}</h3>
                    <div class="text-primary fw-bold my-2 text-capitalize">
                        📅 ${fechaTexto}
                    </div>
                    <span class="badge bg-purple rounded-pill">
                        Faltan ${diffDays} días
                    </span>
                </div>
            `;
        } else {
            html = `<div class="text-muted">No quedan festivos este año 😢</div>`;
        }

        ui.setContent(`<ul class="list-group list-group-flush text-start">${html}</ul>`);
        ui.setSuccess();

    } catch (error) {
        ui.setError('Error API Festivos');
    }
}