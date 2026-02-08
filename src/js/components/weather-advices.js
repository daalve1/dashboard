import { mountCard } from '../utils/ui.js';
import { CONFIG } from '../constants.js';

/**
 * Obtiene el XML de avisos de forma robusta (con timeout y anti-caché)
 */
async function fetchAvisosXml(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    try {
        const res = await fetch(`${url}?t=${Date.now()}`, { 
            signal: controller.signal,
            // Header opcional para evitar cachés agresivas
            headers: { 'Cache-Control': 'no-cache' } 
        });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.text();
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/**
 * Parsea el XML y extrae las alertas relevantes
 */
function parseAlerts(xmlString, zonaBuscada) {
    if (!xmlString || xmlString.trim().startsWith("<!DOCTYPE") || xmlString.includes("rejected")) {
        throw new Error("Respuesta inválida (Proxy/HTML)");
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        throw new Error("XML corrupto o mal formado");
    }

    const items = xmlDoc.querySelectorAll("item");
    const alertas = [];
    const zonaLower = zonaBuscada.toLowerCase();

    items.forEach(item => {
        const title = item.querySelector("title")?.textContent || "";
        const desc = item.querySelector("description")?.textContent || "";
        const titleLower = title.toLowerCase();

        // Lógica de filtrado: Zona coincide y NO es costero (si quieres excluir costeros)
        if (titleLower.includes(zonaLower) && !titleLower.includes("costeros")) {
            
            // Determinar severidad basado en el texto
            let tipo = "info"; // Default
            let icono = "⚠️";
            
            if (titleLower.includes("amarillo")) { tipo = "warning"; icono = "🟡"; }
            else if (titleLower.includes("naranja")) { tipo = "danger"; icono = "🟠"; }
            else if (titleLower.includes("rojo")) { tipo = "dark"; icono = "🔴"; }

            alertas.push({ title, desc, tipo, icono });
        }
    });

    return alertas;
}

export async function initWeatherAdvice(targetId) {
    const ui = mountCard(targetId, 'Avisos Meteorológicos');
    if (!ui) return;
    ui.setLoading(true);

    // Configuración (con fallbacks por si no has actualizado constants.js aún)
    const ENDPOINT = CONFIG?.ALERTS?.ENDPOINT || '/api/avisos';
    const ZONA = CONFIG?.ALERTS?.ZONE || "Litoral norte de Valencia";

    try {
        const xmlData = await fetchAvisosXml(ENDPOINT);
        const alertas = parseAlerts(xmlData, ZONA);

        if (alertas.length === 0) {
            ui.setContent(`
                <div class="d-flex flex-column align-items-center justify-content-center py-3 text-muted">
                    <span class="fs-1">🟢</span>
                    <small class="fw-bold mt-2">Sin alertas activas</small>
                    <small style="font-size: 0.7rem">Zona: ${ZONA}</small>
                </div>
            `);
        } else {
            const html = alertas.map(alerta => `
                <div class="alert bg-${alerta.tipo} text-white mb-2 p-2 shadow-sm border-0">
                    <div class="d-flex align-items-center mb-1">
                        <span class="me-2">${alerta.icono}</span>
                        <div class="fw-bold small" style="line-height: 1.2;">${alerta.title}</div>
                    </div>
                    <div class="small opacity-75 ps-4" style="font-size: 0.8rem;">
                        ${alerta.desc}
                    </div>
                </div>
            `).join('');

            ui.setContent(`<div class="p-1">${html}</div>`);
        }
        
        ui.setSuccess();

    } catch (error) {
        console.warn("Avisos Error:", error);
        // Fallback visual elegante en lugar de error rojo estridente
        ui.setContent(`
            <div class="text-center py-3 text-secondary opacity-50">
                <i class="bi bi-cloud-slash fs-4"></i>
                <div class="small mt-1">No hay datos de avisos</div>
            </div>
        `);
        ui.setSuccess(); // Marcamos éxito para no romper la estética del dashboard
    }
}