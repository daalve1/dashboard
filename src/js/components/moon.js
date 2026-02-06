import { mountCard } from '../utils/ui.js';

/**
 * Mapea la fase lunar de WeatherAPI (inglés) a Español + Emoji
 */
function getMoonData(phaseName) {
    const map = {
        "New Moon": { text: "Luna Nueva", icon: "🌑" },
        "Waxing Crescent": { text: "Luna Creciente", icon: "🌒" },
        "First Quarter": { text: "Cuarto Creciente", icon: "🌓" },
        "Waxing Gibbous": { text: "Gibosa Creciente", icon: "🌔" },
        "Full Moon": { text: "Luna Llena", icon: "🌕" },
        "Waning Gibbous": { text: "Gibosa Menguante", icon: "🌖" },
        "Last Quarter": { text: "Cuarto Menguante", icon: "🌗" },
        "Waning Crescent": { text: "Luna Menguante", icon: "🌘" }
    };

    return map[phaseName] || { text: phaseName, icon: "🌝" };
}

/**
 * Inicializa el componente de Fase Lunar.
 * 
 * @param {string} targetId - ID del elemento HTML que va a contener el componente.
 * @returns {undefined}
 */
export async function initMoon(targetId) {
    const ui = mountCard(targetId, 'Fase Lunar');
    if (!ui) return;
    ui.setLoading(true);

    // Usamos las coordenadas de Torrent (igual que en tu AEMET 46244) o el nombre de ciudad
    // WeatherAPI acepta "lat,lon" o nombre ciudad.
    const location = "Torrent,Spain"; 
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    
    // Endpoint de Astronomía
    const url = `https://api.weatherapi.com/v1/astronomy.json?key=${apiKey}&q=${location}&dt=${new Date().toISOString().split('T')[0]}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Comprobar si la respuesta es correcta
        if (!data || !data.astronomy || !data.astronomy.astro) {
            throw new Error("Respuesta API no contiene datos de astronomía");
        }

        // Extraemos datos de astronomía
        const astro = data.astronomy.astro;
        const phaseData = getMoonData(astro.moon_phase);
        const illumination = astro.moon_illumination;
        const moonRise = astro.moonrise;
        const moonSet = astro.moonset;

        // Renderizado
        ui.setContent(`
            <div class="row align-items-center h-100">
                <div class="col-5 text-center">
                    <div style="font-size: 4rem; line-height: 1;">${phaseData.icon}</div>
                </div>
                <div class="col-7">
                    <div class="fw-bold fs-5 mb-1">${phaseData.text}</div>
                    <div class="text-muted small">
                        <span>💡 Iluminación: <strong>${illumination}%</strong></span><br/>
                        <span>⬆️ Sale: ${moonRise}</span><br/>
                        <span>⬇️ Pone: ${moonSet}</span>
                    </div>
                </div>
            </div>
        `);

        ui.setSuccess();

    } catch (error) {
        console.error("Error en Moon:", error);
        ui.setError('Error API Luna');
    }
}