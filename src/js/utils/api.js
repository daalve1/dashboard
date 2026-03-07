import { CONFIG } from '../constants.js';

/**
 * Realiza una petición HTTP a la URL dada y devuelve el resultado en formato JSON.
 * Si la petición falla, se reintentará hasta que se alcance el número de reintentos especificado.
 * Se puede cancelar la petición con un AbortController.
 *
 * @param {string} url URL a la que se hará la petición
 * @param {object} [options] Opciones adicionales para la petición
 * @param {number} [retries=CONFIG.API.RETRIES] Número de reintentos en caso de fallo
 * @returns {Promise<object>} Promesa que se resuelve con el resultado de la petición en formato JSON
 */
export async function fetchJson(
  url,
  options = {},
  retries = CONFIG.API.RETRIES
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.API.TIMEOUT);

  // Mezclar opciones con signal del controller
  const fetchOptions = { ...options, signal: controller.signal };

  try {
    const res = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (retries > 0 && error.name !== 'AbortError') {
      // Esperar un poco antes de reintentar (backoff exponencial simple)
      await new Promise((r) => setTimeout(r, 1000));
      return fetchJson(url, options, retries - 1);
    }
    throw error;
  }
}
