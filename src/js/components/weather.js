import { mountCard } from '../utils/ui.js';
import { lanzarDecoracion } from '../utils/decoration.js';
import { UV_RANGES, CONFIG } from '../constants.js';
import { fetchJson } from '../utils/api.js';

function getAemetEmoji(descripcion) {
    const desc = descripcion.toLowerCase();
    if (desc.includes('lluvia') || desc.includes('llovizna')) {
        lanzarDecoracion('weather-mount', 'lluvia'); // Ojo: asegúrate que este ID coincide con tu HTML
        return '🌧️';
    }
    if (desc.includes('despejado')) return '☀️';
    if (desc.includes('poco nuboso') || desc.includes('intervalos')) return '🌤️';
    if (desc.includes('nuboso') || desc.includes('cubierto')) return '☁️';
    if (desc.includes('tormenta')) return '⛈️';
    if (desc.includes('nieve')) return '❄️';
    if (desc.includes('niebla') || desc.includes('bruma')) return '🌫️';
    return '🌤️';
}

function getUVRisk(indice) {
    const valor = Math.round(indice);
    const nivel = UV_RANGES.find(r => valor >= r.min && valor <= r.max) || UV_RANGES[0];
    return { ...nivel, indice: valor };
}

/**
 * Extrae el valor correcto del array de periodos de AEMET según la hora actual.
 * AEMET divide el día en periodos de 6h.
 */
function getPeriodValue(hora, datos, esDatoExtendido = false) {
    // Índices AEMET: 0-6h, 6-12h, 12-18h, 18-24h
    // Nota: Los arrays de AEMET a veces tienen longitud 4 (periodos) o 24 (horas) o 1 (dato único).
    // Asumimos estructura estándar de predicción diaria.
    
    if (!Array.isArray(datos) || datos.length === 0) return 0;
    
    // Si hay un solo dato para todo el día
    if (datos.length === 1) return datos[0].value || datos[0].velocidad || 0;

    let periodoIndex;
    if (hora < 6) periodoIndex = 0;
    else if (hora < 12) periodoIndex = 1;
    else if (hora < 18) periodoIndex = 2;
    else periodoIndex = 3;

    // A veces AEMET devuelve arrays de 7 elementos para viento/precipitacion extendida
    // Ajuste defensivo: buscamos el periodo que coincida o el último disponible
    const dato = datos[Math.min(periodoIndex, datos.length - 1)];
    
    return dato.value !== undefined ? dato.value : (dato.velocidad || 0);
}

export async function initWeather(targetId) {
    const ui = mountCard(targetId, 'Meteorología');
    if (!ui) return;
    ui.setLoading(true);

    const apiKey = import.meta.env.VITE_AEMET_API_KEY;
    const urlMunicipio = `https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/${CONFIG.LOCATION.AEMET_ID}?api_key=${apiKey}`;

    try {
        // 1. Obtener URL de datos
        const resMeta = await fetchJson(urlMunicipio);
        if (resMeta.estado !== 200) throw new Error(resMeta.descripcion);

        // 2. Obtener datos reales
        const dataRaw = await fetchJson(resMeta.datos);
        const prediccionHoy = dataRaw[0].prediccion.dia[0];
        
        // Procesar datos
        const hora = new Date().getHours();
        const estado = prediccionHoy.estadoCielo[0].descripcion || "";
        const riesgoUV = getUVRisk(prediccionHoy.uvMax);
        
        // Usamos la nueva función helper más segura
        const tempActual = getPeriodValue(hora, prediccionHoy.temperatura.dato);
        const lluviaProb = getPeriodValue(hora, prediccionHoy.probPrecipitacion);
        const humedad = getPeriodValue(hora, prediccionHoy.humedadRelativa.dato);
        const viento = getPeriodValue(hora, prediccionHoy.viento);

        ui.setContent(`
            <div class="row p-2">
                <div class="col-6 text-center">
                    <div class="fs-1 fw-bold">${getAemetEmoji(estado)}</div>
                    <div class="fs-1 fw-bold">${tempActual}°C</div>
                    <span class="text-primary fw-bold">↓ ${prediccionHoy.temperatura.minima}°</span>
                    <span class="text-danger fw-bold">↑ ${prediccionHoy.temperatura.maxima}°</span>
                </div>
                <div class="col-6 p-3">
                    <div class="text-muted small">
                        <span>🌧️ ${lluviaProb}%</span><br/>
                        <span>💧 ${humedad}%</span><br/>
                        <span style="color: ${riesgoUV.color}">🌞 ${riesgoUV.indice} ${riesgoUV.riesgo}</span><br/>
                        <span>🌬️ ${viento}km/h</span>
                    </div>
                </div>
            </div>
        `);
        ui.setSuccess();

    } catch (error) {
        ui.setError('Error API Tiempo');
    }
}