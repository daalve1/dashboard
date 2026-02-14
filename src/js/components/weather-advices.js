import { mountCard } from '../utils/ui.js';
import { ALERTS } from '../constants.js';

/**
 * Fetches XML from AEMET's weather warnings API endpoint.
 * Adds a random timestamp to the URL to avoid caching.
 * Uses AbortController to cancel the request after 5 seconds.
 * Returns the response text if successful, otherwise throws an error.
 * @param {string} url - URL of the AEMET endpoint to use.
 * @returns {Promise<string>} - Promise resolving to the response text if successful.
 */
async function fetchAvisosXml(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const res = await fetch(`${url}?t=${Date.now()}`, { 
            signal: controller.signal,
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
 * Parsea el XML de avisos para obtener una lista de alertas
 * para una zona determinada.
 * 
 * @param {string} xmlString - El contenido XML de los avisos
 * @param {string} zonaBuscada - La zona para la que se desean obtener los avisos
 * 
 * @returns {Array} - Una lista de objetos con la siguiente estructura:
 * {
 *   fenomeno: string,
 *   inicio: string,
 *   fin: string,
 *   bg: string
 * }
 */
function parseAlerts(xmlString, zonaBuscada) {
    if (!xmlString || xmlString.trim().startsWith("<!DOCTYPE")) return [];
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const items = xmlDoc.querySelectorAll("item");
    const alertas = [];
    const ahora = new Date();
    const styles = ALERTS.STYLES;

    items.forEach(item => {
        const titleRaw = item.querySelector("title")?.textContent || "";
        const descRaw = item.querySelector("description")?.textContent || "";
        const titleLower = titleRaw.toLowerCase();
        
        if (titleLower.includes(zonaBuscada.toLowerCase()) && !titleLower.includes("costeros")) {
            const dateRegex = /(\d{2}:\d{2})\s(\d{2})-(\d{2})-(\d{4})/g;
            const matches = [...descRaw.matchAll(dateRegex)];

            if (matches.length >= 2) {
                const [hFin, mFin] = matches[1][1].split(':');
                const fechaFin = new Date(matches[1][4], matches[1][3] - 1, matches[1][2], hFin, mFin);
                if (fechaFin < ahora) return;

                // Selección de estilo desde constantes
                let bg = styles.DEFAULT;
                if (titleLower.includes("amarillo")) bg = styles.AMARILLO;
                else if (titleLower.includes("naranja")) bg = styles.NARANJA;
                else if (titleLower.includes("rojo")) bg = styles.ROJO;

                const fenomeno = titleRaw.split('.')[2]?.trim() || "Meteorología";
                
                alertas.push({
                    fenomeno: fenomeno.toLowerCase(),
                    inicio: `${matches[0][1]} (${matches[0][2]}/${matches[0][3]})`,
                    fin: `${matches[1][1]} (${matches[1][2]}/${matches[1][3]})`,
                    bg: bg
                });
            }
        }
    });
    return alertas;
}

export async function initWeatherAdvice(targetId) {
    const ui = mountCard(targetId, 'Avisos Meteorológicos');
    if (!ui) return;
    ui.setLoading(true);

    const ENDPOINT = ALERTS.ENDPOINT;
    const ZONA = ALERTS.ZONE;

    try {
        const xmlData = await fetchAvisosXml(ENDPOINT);
        const alertas = parseAlerts(xmlData, ZONA);

        if (alertas.length === 0) {
            ui.setContent(`
                <div class="text-center py-4 text-muted">
                    <div class="display-6 mb-2">☀️</div>
                    <div class="small fw-bold">Cielos tranquilos</div>
                    <div style="font-size: 0.65rem; opacity: 0.6;">Sin alertas para ${ZONA}</div>
                </div>
            `);
        } else {
            const html = alertas.map(alerta => `
                <div class="mb-2 border-0 shadow-sm" 
                     style="background: ${alerta.bg}; border-radius: 12px; overflow: hidden; color: white;">
                    <div class="p-2">
                        <h6 class="mb-2" style="letter-spacing: -0.5px; font-weight: 600;">
                           Alerta ${alerta.fenomeno}
                        </h6>
                        <div class="d-flex align-items-center justify-content-between bg-black bg-opacity-10 rounded-3 p-2" style="font-size: 0.75rem;">
                            <div class="text-center flex-fill">
                                <div class="opacity-75" style="font-size: 0.6rem;">INICIO</div>
                                <div class="fw-bold">${alerta.inicio}</div>
                            </div>
                            <div class="px-2 opacity-25">|</div>
                            <div class="text-center flex-fill">
                                <div class="opacity-75" style="font-size: 0.6rem;">FINALIZA</div>
                                <div class="fw-bold">${alerta.fin}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            ui.setContent(`<div class="p-2">${html}</div>`);
        }
        ui.setSuccess();
    } catch (error) {
        console.error(error);
        ui.setError('Error API Avisos');
    }
}