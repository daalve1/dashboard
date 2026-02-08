import { mountCard } from '../utils/ui.js';
import { fetchJson } from '../utils/api.js';
import { CONFIG, MOON_PHASES } from '../constants.js';

/**
 * Obtiene la traducción e icono de la fase lunar.
 * Si la API devuelve una fase rara, usa un valor por defecto.
 */
function getPhaseInfo(phaseName) {
    return MOON_PHASES[phaseName] || { text: phaseName, icon: "🌝" };
}

export async function initMoon(targetId) {
    const ui = mountCard(targetId, 'Fase Lunar');
    if (!ui) return;
    ui.setLoading(true);

    // Usamos la configuración centralizada para la ubicación
    const location = CONFIG.LOCATION.NAME; 
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    const today = new Date().toISOString().split('T')[0];
    
    // URL de WeatherAPI
    const url = `https://api.weatherapi.com/v1/astronomy.json?key=${apiKey}&q=${location}&dt=${today}`;

    try {
        // 1. Usamos fetchJson (maneja timeouts y errores de red automáticamente)
        const data = await fetchJson(url);

        // 2. Validación específica de estructura de datos
        if (!data?.astronomy?.astro) {
            throw new Error("Datos de astronomía incompletos");
        }

        const astro = data.astronomy.astro;
        const phaseData = MOON_PHASES[astro.moon_phase] || { text: 'Fase desconocida', icon: '' };
        const illumination = astro.moon_illumination;
        const moonRise = astro.moonrise;
        const moonSet = astro.moonset;

        // 3. Renderizado
        ui.setContent(`
            <div class="text-center py-1">
                <h3 class="fw-bold mb-0 text-dark">${phaseData.text}</h3>
            </div>
            <div class="row">
                <div class="col-6 d-flex justify-content-center align-items-center">
                    <div style="font-size: 3rem; line-height: 1;">${phaseData.icon}</div>
                </div>
                <div class="col-6">
                    <div class="text-muted small">
                        <span>💡 ${illumination}%</span><br/>
                        <span>⬆️ ${moonRise}</span><br/>
                        <span>⬇️ ${moonSet}</span>
                    </div>
                </div>
            </div>
        `);

        ui.setSuccess();

    } catch (error) {    
        console.error(error);
        ui.setError('Error API Luna');
    }
}