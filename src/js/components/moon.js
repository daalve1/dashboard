import { mountCard } from '../utils/ui.js';
import { fetchJson } from '../utils/api.js';
import { CONFIG, MOON_PHASES } from '../constants.js';

/**
 * Converts a 12-hour time string to a 24-hour time string.
 * If the time string is invalid or contains 'No rise' or 'No set',
 * returns the original string.
 * @param {string} timeStr - The time string to convert.
 * @returns {string} The converted time string in 24-hour format.
 */
function convertTo24h(timeStr) {
  if (!timeStr || timeStr.includes('No rise') || timeStr.includes('No set'))
    return timeStr;

  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');

  if (hours === '12') hours = '00';
  if (modifier === 'PM') hours = parseInt(hours, 10) + 12;

  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

/**
 * Inicializa la tarjeta de fase lunar.
 *
 * @param {string} targetId - ID del elemento HTML que se utilizará para montar la tarjeta.
 *
 * Esta función utiliza la API de WeatherAPI para obtener los datos de astronomía
 * correspondientes a la ubicación actual. Luego, utiliza los datos para mostrar
 * la fase lunar actual, la iluminación de la luna y los momentos de salida y puesta
 * del sol en la tarjeta.
 */
export async function initMoon(targetId) {
  const ui = mountCard(targetId, 'Fase Lunar');
  if (!ui) return;
  ui.setLoading(true);

  const location = CONFIG.LOCATION.NAME;
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
  const today = new Date().toISOString().split('T')[0];

  const url = `https://api.weatherapi.com/v1/astronomy.json?key=${apiKey}&q=${location}&dt=${today}`;

  try {
    const data = await fetchJson(url);

    if (!data?.astronomy?.astro) {
      throw new Error('Datos de astronomía incompletos');
    }

    const astro = data.astronomy.astro;
    const phaseData = MOON_PHASES[astro.moon_phase] || {
      text: 'Fase desconocida',
      icon: '',
    };
    const illumination = astro.moon_illumination;

    // Aplicamos la conversión a 24h
    const moonRise = convertTo24h(astro.moonrise);
    const moonSet = convertTo24h(astro.moonset);

    ui.setContent(`
            <div class="text-center py-1">
                <h3 class="fw-bold mb-0 text-dark">${phaseData.text}</h3>
            </div>
            <div class="row p-2">
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
