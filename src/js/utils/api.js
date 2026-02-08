import { CONFIG } from '../constants.js';

/**
 * Cliente HTTP robusto con reintentos y timeout
 */
export async function fetchJson(url, options = {}, retries = CONFIG.API.RETRIES) {
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
            await new Promise(r => setTimeout(r, 1000));
            return fetchJson(url, options, retries - 1);
        }
        throw error;
    }
}