import { mountCard } from '../utils/ui.js';

/**
 * Fetch data with timeout logic
 */
async function fetchAndProcessAvisos(url, timeoutMs = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
        // Añadimos timestamp para evitar caché
        const res = await fetch(`${url}?t=${Date.now()}`, {
            signal: controller.signal
        });
        clearTimeout(id);

        if (!res.ok) throw new Error(`Backend error: ${res.status}`);
        const text = await res.text();
        return extractAvisos(text);
    } catch (e) {
        clearTimeout(id);
        console.error("Fallo al obtener avisos:", e);
        // Devolvemos el HTML de error directamente
        return `<div class="d-flex align-items-center text-danger justify-content-center p-2">
                    <div class="fw-bold small">⚠️ Error cargando avisos</div>
                </div>`;
    }
}

export async function initWeatherAdvice(targetId) {
    const ui = mountCard(targetId, 'Avisos meteorología');
    if (!ui) {
        console.error(`No se encontró el elemento destino: ${targetId}`);
        return;
    }

    // 1. Mostrar estado de carga inicial
    ui.setLoading(true);

    // Endpoint (Asegúrate de que tienes un proxy configurado para esto)
    const urlAvisos = '/api/avisos';

    try {
        // 2. Obtener los datos PRIMERO (esperamos a la promesa)
        // Pasamos el timeout de 2000ms que querías usar
        const avisosHTML = await fetchAndProcessAvisos(urlAvisos, 2000);

        // 3. Una vez tenemos el HTML, actualizamos el contenido DE GOLPE
        // Esto evita tener que buscar IDs por el documento y es más seguro.
        ui.setContent(`
            <div class="row" id="weather-avisos-container">
                <div class="col-12">
                    ${avisosHTML}
                </div>
            </div>
        `);
        
        // 4. Marcamos como éxito (quita spinners del ui kit si los tiene)
        ui.setSuccess();

    } catch (error) {
        console.error("Error crítico en Weather:", error);
        ui.setError('Error de conexión');
    }
}

function extractAvisos(data) {
    // Verificación básica de respuesta HTML de error (común en proxies corporativos o AEMET)
    if (data.trim().startsWith("<!DOCTYPE") || data.includes("rejected")) {
         return `<div class="text-muted small text-center">Datos no disponibles temporalmente</div>`;
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "text/xml");
    
    // Verificar si el XML es válido (si no hay etiquetas <rss> o <channel> o <item>)
    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        return `<div class="text-danger small text-center">Error interpretando datos AEMET</div>`;
    }

    const items = xmlDoc.querySelectorAll("item");
    let html = "";
    let encontrados = 0;
    
    const zonaBuscada = "Litoral norte de Valencia";
    // Convertimos a minúsculas para comparaciones más robustas
    const zonaBuscadaLower = zonaBuscada.toLowerCase(); 

    items.forEach(item => {
        const title = item.querySelector("title")?.textContent || "";
        const desc = item.querySelector("description")?.textContent || "";
        const titleLower = title.toLowerCase();

        // Filtro mejorado
        if (titleLower.includes(zonaBuscadaLower) && !titleLower.includes("costeros")) {
            encontrados++;

            let color = "bg-info"; 
            if (titleLower.includes("amarillo")) color = "bg-warning";
            else if (titleLower.includes("naranja")) color = "bg-danger";
            else if (titleLower.includes("rojo")) color = "bg-dark";

            html += `
                <div class="alert ${color} text-white mb-0 p-2 shadow-sm">
                    <div class="fw-bold small">⚠️ ${title}</div>
                    <div class="small mt-1" style="font-size: 0.8rem; opacity: 0.9;">
                        ${desc}
                    </div>
                </div>
            `;
        }
    });

    if (encontrados === 0) {
        html = `
            <div class="text-center mb-2 p-2">
                <div class="fw-bold text-muted small">🟢 Sin alertas para ${zonaBuscada}</div>
            </div>
        `;
    }

    return html;
}