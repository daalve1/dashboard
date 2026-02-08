import { mountCard } from '../utils/ui.js';
import { lanzarDecoracion } from '../utils/decoration.js';
import { UV_RANGES } from '../constants.js';


/**
 * Devuelve un emoji según la descripción del tiempo de AEMET
 * @param {string} descripcion - Descripción del tiempo de AEMET
 * @returns {string} Un emoji representativo del tiempo
 * @example getAemetEmoji('despejado') // '☀️'
 * @example getAemetEmoji('poco nuboso') // '🌤️'
 * @example getAemetEmoji('lluvia') // '🌧️' y lanza una decoración tipo lluvia en el elemento con id 'weather-mount'
 */
function getAemetEmoji(descripcion) {
    const desc = descripcion.toLowerCase();
    if (desc.includes('despejado')) return '☀️';
    if (desc.includes('poco nuboso')) return '🌤️';
    if (desc.includes('nuboso')) return '☁️';
    if (desc.includes('cubierto')) return '☁️';
    if (desc.includes('lluvia') || desc.includes('llovizna')) {
        lanzarDecoracion('weather-mount', 'lluvia');
        return '🌧️';
    }
    if (desc.includes('tormenta')) return '⛈️';
    if (desc.includes('nieve')) return '❄️';
    if (desc.includes('niebla')) return '🌫️';
    return '🌤️';
}

/**
 * Devuelve un string con la recomendación para un riesgo UV según el índice pasado como parámetro.
 * 
 * @param {string} riesgo - Índice UV ("Bajo", "Moderado", "Alto", "Muy alto", "Extremo")
 * @returns {string} - Recomendación para el riesgo UV
 */
function obtenerRecomendacion(riesgo) {
  const tips = {
    "Bajo": "Puedes permanecer al aire libre sin riesgo.",
    "Moderado": "Usa protector solar y busca sombra al mediodía.",
    "Alto": "Usa sombrero, gafas de sol y protector cada 2 horas.",
    "Muy Alto": "Evita salir en horas centrales. Protección extra.",
    "Extremo": "¡Peligro! Evita salir. La piel se quema en minutos."
  };
  return tips[riesgo];
}

/**
 * Devuelve un objeto con la descripción del riesgo UV, el color asociado y una recomendación
 * según el índice UV pasado como parámetro.
 * 
 * @param {number} index - Índice UV
 * @returns {Object} - Información del riesgo UV, con los siguientes campos:
 *   - mensaje: string con la descripción del riesgo
 *   - color: string con el color asociado al riesgo
 *   - emoji: string con el emoji asociado al riesgo
 *   - recomendacion: string con la recomendación para el usuario
 */
function getUVRisk(indice) {
  // Redondeamos por si llega un valor decimal
  const valor = Math.round(indice);

  // Buscamos el objeto que contiene el rango
  const nivel = UV_RANGES.find(rango => valor >= rango.min && valor <= rango.max);

  if (!nivel) return "Índice no válido";

  return {
    riesgo: nivel.riesgo,
    color: nivel.color,
    icono: nivel.icono,
    recomendacion: obtenerRecomendacion(nivel.riesgo)
  };
}

// Constante de reintentos
const FETCH_MAX_RETRIES = 5;


/**
 * Realiza una petición a una URL con un máximo de reintentos en caso de fallo.
 * 
 * @param {string} url - URL a la que se realizará la petición
 * @param {object} [options] - Opciones de la petición (ver documentación de fetch)
 * @returns {Promise<Response>} - Promesa que se resuelve con la respuesta de la petición
 * @throws {Error} - Error si falla tras el máximo de reintentos
 */
async function fetchWithRetry(url, options = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= FETCH_MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            if (attempt > 1) {
                console.log(`[Fetch] ✓ Éxito en intento ${attempt}/${FETCH_MAX_RETRIES}`);
            }
            return response;
        } catch (error) {
            lastError = error;
            console.warn(`[Fetch] ✗ Intento ${attempt}/${FETCH_MAX_RETRIES} falló: ${error.message}`);
            if (attempt < FETCH_MAX_RETRIES) {
                // Esperar 1 segundo antes de reintentar (APIs públicas)
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
    
    console.error(`[Fetch] ✗ Falló tras ${FETCH_MAX_RETRIES} intentos`);
    throw lastError;
}

/**
 * Obtiene el valor actual según la hora del día.
 * 
 * @param {number} horaActual - Hora actual en formato de 24 horas (0-23)
 * @param {array} dataArray - Array con los valores a obtener según la hora del día
 * @returns {any} Valor actual según la hora del día
 */
function getValueByHour(horaActual, dataArray) {
    const indiceMap = {
        early: 0,    // 0-5h
        morning: 1,  // 6-11h
        afternoon: 2, // 12-17h
        evening: 3   // 18-23h
    };
    
    let periodo;
    if (horaActual < 6) periodo = 'early';
    else if (horaActual < 12) periodo = 'morning';
    else if (horaActual < 18) periodo = 'afternoon';
    else periodo = 'evening';
    
    return dataArray[indiceMap[periodo]];
}


/**
 * Obtiene el valor actual según la hora del día extendida.
 * @param {number} horaActual - Hora actual en formato de 24 horas (0-23)
 * @param {array} dataArray - Array con los valores a obtener según la hora del día
 * @returns {any} Valor actual según la hora del día
 */
function getValueByHourExtended(horaActual, dataArray) {
    const indiceMap = {
        early: 3,    // 0-5h
        morning: 4,  // 6-11h
        afternoon: 5, // 12-17h
        evening: 6   // 18-23h
    };
    
    let periodo;
    if (horaActual < 6) periodo = 'early';
    else if (horaActual < 12) periodo = 'morning';
    else if (horaActual < 18) periodo = 'afternoon';
    else periodo = 'evening';
    
    return dataArray[indiceMap[periodo]];
}

/**
 * Inicializa la tarjeta del tiempo.
 * 
 * @param {string} targetId - ID del elemento HTML que se utilizará para montar la tarjeta.
 */
export async function initWeather(targetId) {
    const ui = mountCard(targetId, 'Meteorología');
    if (!ui) return;
    ui.setLoading(true);

    // Endpoint de predicción diaria Torrent
    const urlPrediccion = `https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/46244?api_key=${import.meta.env.VITE_AEMET_API_KEY}`;

    try {
        // PASO 1: Obtener la URL temporal de los datos (con reintentos)
        const resPrediccion = await fetchWithRetry(urlPrediccion, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        const infoPrediccion = await resPrediccion.json();

        // Verificamos si la API de AEMET nos ha dado el OK
        if (infoPrediccion.estado !== 200) {
            throw new Error(infoPrediccion.descripcion || 'Error en la API Predicción');
        }

        // PASO 2: Obtener los datos reales desde la URL que nos devuelve AEMET
        const resPrediccionData = await fetchWithRetry(infoPrediccion.datos, {});
        const dataRawPrediccion = await resPrediccionData.json();
        
        // AEMET devuelve un array, el primer elemento [0] es el municipio solicitado
        // y dentro de prediccion.dia[0] tenemos los datos de hoy
        const prediccion = dataRawPrediccion[0].prediccion.dia[0];

        // Obtener hora actual
        const horaActual = new Date().getHours();

        const estado = prediccion.estadoCielo[0].descripcion;
        const emoji = getAemetEmoji(estado);
        const tempMax = prediccion.temperatura.maxima;
        const tempMin = prediccion.temperatura.minima;
        const uvIndice = prediccion.uvMax;
        const riesgoUV = getUVRisk(uvIndice);

        // Obtener valores actuales según la hora
        const temperaturaActual = getValueByHour(horaActual, prediccion.temperatura.dato).value;
        const humedadActual = getValueByHour(horaActual, prediccion.humedadRelativa.dato).value;
        const precipitacionActual = getValueByHourExtended(horaActual, prediccion.probPrecipitacion).value;
        const vientoActual = getValueByHourExtended(horaActual, prediccion.viento).velocidad;

        // Renderizado del contenido del tiempo (sin esperar a avisos)
        ui.setContent(`
            <div class="row">
                <div class="col-6 text-center">
                    <div class="fs-1 fw-bold">${emoji}</div>
                    <div class="fs-1 fw-bold">${temperaturaActual}°C</div>
                    
                    <span class="text-primary fw-bold">↓ ${tempMin}°</span>
                    <span class="text-danger fw-bold">↑ ${tempMax}°</span>
                </div>
                <div class="col-6 pt-3">
                    <div class="text-muted small">
                        <span>🌧️ ${precipitacionActual}%</span><br/>
                        <span>💧 ${humedadActual}%</span><br/>
                        <span style="color: ${riesgoUV.color}">🌞 ${uvIndice} ${riesgoUV.riesgo}</span><br/>
                        <span>🌬️ ${vientoActual}km/h</span>
                    </div>
                </div>
            </div>
        `);
        
        ui.setSuccess();
    } catch (error) {
        ui.setError('Error API Tiempo');
        console.error("Error en Weather:", error);
    }
}