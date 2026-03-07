import { translateText } from '../utils/translate.js';
import { mountCard } from '../utils/ui.js';
import { HOROSCOPE } from '../constants.js';

/**
 * Realiza una petición HTTP a la URL dada y devuelve el resultado en formato JSON.
 * La petición tiene un timeout de 5 segundos y se cancela si no se recibe respuesta
 * en ese plazo de tiempo.
 * Se agrega un parámetro 't' con el timestamp actual para evitar cachés.
 *
 * @param {string} url URL a la que se hará la petición
 * @returns {Promise<object>} Promesa que se resuelve con el resultado de la petición en formato JSON
 * @throws {Error} Si la petición falla o se cancela
 */
async function fetchHoroscopo(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

  try {
    const res = await fetch(`${url}`, {
      signal: controller.signal,
      // Header opcional para evitar cachés agresivas
      headers: { 'Cache-Control': 'no-cache' },
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    return await res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Inicializa la sección de horóscopos en un contenedor.
 *
 * @param {string} targetId - El id del elemento HTML que se
 *      utilizará como contenedor para montar la sección de
 *      horóscopos.
 *
 * @returns {undefined}
 */
export async function initHoroscope(targetId) {
  const { SPANISH, ICON } = HOROSCOPE.ZODIAC_SIGN;
  const ui = mountCard(targetId, `Horóscopo ${SPANISH}`);
  if (!ui) return;

  ui.setLoading(true);

  try {
    const ENDPOINT = HOROSCOPE.ENDPOINT;

    const data = await fetchHoroscopo(ENDPOINT);
    const horoscopeText = data.data.horoscope;
    const translated = await translateText(horoscopeText);

    ui.setContent(`
            <div class="p-2">
                <h3 class="fw-bold mb-0 text-center text-dark">${SPANISH} ${ICON}</h3>
                <div class="text-secondary text-justify mt-2" style="font-size: 0.95rem;">
                    ${translated}
                </div>
            </div>
        `);
    ui.setSuccess();
  } catch (error) {
    console.error(error);
    ui.setError('Error API horóscopo', error);
  }
}
