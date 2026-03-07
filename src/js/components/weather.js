import { mountCard } from '../utils/ui.js';
import { lanzarDecoracion } from '../utils/decoration.js';
import { UV_RANGES, CONFIG } from '../constants.js';
import { fetchJson } from '../utils/api.js';

/**
 * Devuelve un emoji correspondiente a una descripción del tiempo.
 * Se lanza una decoración en el contenedor con id "weather-mount" si
 * la descripción incluye "lluvia" o "llovizna".
 * @param {string} descripcion - La descripción del tiempo.
 * @returns {string} El emoji correspondiente.
 */
function getAemetEmoji(descripcion) {
  const desc = (descripcion || '').toLowerCase();
  if (desc.includes('lluvia') || desc.includes('llovizna')) {
    lanzarDecoracion('weather-mount', 'lluvia');
    return '🌧️';
  }
  if (desc.includes('despejado')) return '☀️';
  if (desc.includes('poco nuboso') || desc.includes('intervalos')) return '🌤️';
  if (desc.includes('tormenta')) return '⛈️';
  if (desc.includes('nuboso') || desc.includes('cubierto')) return '☁️';
  if (desc.includes('nieve')) return '❄️';
  if (desc.includes('niebla') || desc.includes('bruma')) return '🌫️';
  return '🌤️';
}

/**
 * Devuelve un objeto con la descripción del riesgo de la radiación ultravioleta
 * correspondiente al índice pasado como parámetro.
 * @param {number} indice - El índice de la radiación ultravioleta.
 * @returns {object} Un objeto con la descripción del riesgo y el índice.
 * @example
 * getUVRisk(3) // { riesgo: "(bajo)", color: "#28a745", icono: " " }, indice: 3 }
 */
function getUVRisk(indice) {
  const valor = Math.round(indice);
  const nivel =
    UV_RANGES.find((r) => valor >= r.min && valor <= r.max) || UV_RANGES[0];
  return { ...nivel, indice: valor };
}

/**
 * Devuelve un objeto correspondiente a un período del día
 * según la hora pasada como parámetro.
 * Si el objeto tiene una propiedad "periodo", se busca por este
 * valor. Si no lo tiene, se busca por la propiedad "hora".
 * Si no se encuentra en el array de objetos, se devuelve el primer objeto
 * del array.
 * @param {number} hora - La hora del día.
 * @param {object[]} datos - Un array de objetos con las propiedades "periodo" o "hora".
 * @returns {object} Un objeto correspondiente a un período del día.
 */
function getPeriodObject(hora, datos) {
  if (!Array.isArray(datos) || datos.length === 0) return null;
  if (datos.length === 1) return datos[0];

  if (datos[0].periodo !== undefined) {
    let periodoBuscado;
    if (hora < 6) periodoBuscado = '00-06';
    else if (hora < 12) periodoBuscado = '06-12';
    else if (hora < 18) periodoBuscado = '12-18';
    else periodoBuscado = '18-24';

    return datos.find((d) => d.periodo === periodoBuscado) || datos[0];
  } else if (datos[0].hora !== undefined) {
    let horaBuscada;
    if (hora < 6) horaBuscada = 6;
    else if (hora < 12) horaBuscada = 12;
    else if (hora < 18) horaBuscada = 18;
    else horaBuscada = 24;

    return datos.find((d) => d.hora === horaBuscada) || datos[0];
  }

  return datos[0];
}

/**
 * Devuelve el valor correspondiente a un período del día
 * según la hora pasada como parámetro.
 * Si el objeto devuelto por getPeriodObject tiene una propiedad "value",
 * se devuelve esta propiedad. Si no la tiene, se busca por la propiedad
 * "velocidad". Si no se encuentra en el objeto, se devuelve 0.
 * @param {number} hora - La hora del día.
 * @param {object[]} datos - Un array de objetos con las propiedades "periodo" o "hora".
 * @returns {number} El valor correspondiente a un período del día.
 */
function getPeriodValue(hora, datos) {
  const dato = getPeriodObject(hora, datos);
  if (!dato) return 0;
  return dato.value !== undefined ? dato.value : dato.velocidad || 0;
}

/**
 * Inicializa el componente de la meteorología.
 * Se lanza una decoración en el contenedor con id "weather-mount" si
 * la descripción incluye "lluvia" o "llovizna".
 * @param {string} targetId - El id del contenedor donde se montará
 * el componente.
 */
export async function initWeather(targetId) {
  const ui = mountCard(targetId, 'Meteorología');
  if (!ui) return;
  ui.setLoading(true);

  const apiKey = import.meta.env.VITE_AEMET_API_KEY;
  const url = `https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/${CONFIG.LOCATION.AEMET_ID}?api_key=${apiKey}`;

  try {
    const resMeta = await fetchJson(url);
    if (resMeta.estado !== 200) throw new Error(resMeta.descripcion);

    const dataRaw = await fetchJson(resMeta.datos);
    const prediccionHoy = dataRaw[0].prediccion.dia[0];

    const hora = new Date().getHours();

    // AQUÍ ESTÁ LA MAGIA: Ahora buscamos el estado del cielo por horas
    const estadoObj = getPeriodObject(hora, prediccionHoy.estadoCielo);
    // Si la descripción de esta hora está vacía, usamos la general del día [0] como plan B
    const estado =
      estadoObj?.descripcion || prediccionHoy.estadoCielo[0]?.descripcion || '';

    const riesgoUV = getUVRisk(prediccionHoy.uvMax);
    const tempActual = getPeriodValue(hora, prediccionHoy.temperatura.dato);
    const lluviaProb = getPeriodValue(hora, prediccionHoy.probPrecipitacion);
    const humedad = getPeriodValue(hora, prediccionHoy.humedadRelativa.dato);
    const viento = getPeriodValue(hora, prediccionHoy.viento);

    ui.setContent(`
            <div class="row p-2">
                <div class="col-6 text-center">
                    <div class="fs-1 fw-bold" title="${estado}">${getAemetEmoji(estado)}</div>
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
    console.error('Fallo en AEMET:', error);
    ui.setError('Error API Tiempo');
  }
}
