import { mountCard } from '../utils/ui.js';
import { lanzarDecoracion } from '../utils/decoration.js';
import { UV_RANGES, CONFIG } from '../constants.js';
import { fetchJson } from '../utils/api.js';

/**
 * Convierte una descripción de AEMET en un emoji representativo.
 * Devuelve '🌧️' si la descripción contiene 'lluvia' o 'llovizna',
 * '☀️' si contiene 'despejado',
 * '🌤️' si contiene 'poco nuboso' o 'intervalos',
 * '☁️' si contiene 'nuboso' o 'cubierto',
 * '⛈️' si contiene 'tormenta',
 * '❄️' si contiene 'nieve',
 * '🌫️' si contiene 'niebla' o 'bruma',
 * y '🌤️' en caso de no cumplir ninguna de las condiciones anteriores.
 * @param {string} descripcion - Descripción de AEMET.
 * @returns {string} - Emoji representativo de la descripción.
 */
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

/**
 * Devuelve un objeto con la información del riesgo de exposición
 * al sol correspondiente al índice UV pasado como parámetro.
 * El objeto contiene las propiedades:
 * - riesgo {string}: Descripción del riesgo.
 * - color {string}: Color en formato hex (#rrggbb) para representar el riesgo.
 * - icono {string}: Icono en formato string para representar el riesgo.
 * - indice {number}: Valor numérico del índice UV.
 * Si el índice no se encuentra en el rango de valores de UV_RANGES,
 * devuelve el primer objeto de la lista.
 * @param {number} indice - Índice UV a evaluar.
 * @returns {object} - Objeto con la información del riesgo de exposición al sol.
 */
function getUVRisk(indice) {
    const valor = Math.round(indice);
    const nivel = UV_RANGES.find(r => valor >= r.min && valor <= r.max) || UV_RANGES[0];
    return { ...nivel, indice: valor };
}


/**
 * Devuelve el valor correspondiente al período horario actual.
 * Si la información de AEMET contiene un solo dato para todo el día,
 * devuelve ese valor. En caso de tener varios datos, devuelve el valor
 * correspondiente al período horario actual.
 * @param {number} hora - Hora actual en formato de 24 horas (0-23).
 * @param {array} datos - Array de objetos con la información de AEMET.
 * @returns {number|string} - Valor correspondiente al período horario actual.
 */
function getPeriodValue(hora, datos) {
    // Índices AEMET: 0-6h, 6-12h, 12-18h, 18-24h
    // Nota: Los arrays de AEMET a veces tienen longitud 4 (periodos) o 24 (horas) o 1 (dato único).
    // Asumimos estructura estándar de predicción diaria.
    
    if (!Array.isArray(datos) || datos.length === 0) return 0;
    
    // Si hay un solo dato para todo el día
    if (datos.length === 1) return datos[0].value !== undefined ? datos[0].value : (datos[0].velocidad || 0);

    let dato;

    // AEMET mezcla arrays que usan "periodo" (lluvia, viento) con arrays que usan "hora" (temperaturas)
    if (datos[0].periodo !== undefined) {
        let periodoBuscado;
        if (hora < 6) periodoBuscado = "00-06";
        else if (hora < 12) periodoBuscado = "06-12";
        else if (hora < 18) periodoBuscado = "12-18";
        else periodoBuscado = "18-24";
        
        // Busca el periodo exacto. Si no lo encuentra, usa el dato general del día (índice 0)
        dato = datos.find(d => d.periodo === periodoBuscado) || datos[0];
    } 
    else if (datos[0].hora !== undefined) {
        let horaBuscada;
        if (hora < 6) horaBuscada = 6;
        else if (hora < 12) horaBuscada = 12;
        else if (hora < 18) horaBuscada = 18;
        else horaBuscada = 24;
        
        dato = datos.find(d => d.hora === horaBuscada) || datos[0];
    }

    if (!dato) return 0;
    return dato.value !== undefined ? dato.value : (dato.velocidad || 0);
}

export async function initWeather(targetId) {
    const ui = mountCard(targetId, 'Meteorología');
    if (!ui) return;
    ui.setLoading(true);

    const apiKey = import.meta.env.VITE_AEMET_API_KEY;
    const url = `https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/${CONFIG.LOCATION.AEMET_ID}?api_key=${apiKey}`;
    console.log('url', url);
    try {
        // 1. Obtener URL de datos
        const resMeta = await fetchJson(url);
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