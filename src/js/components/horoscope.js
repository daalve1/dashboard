import { translateText } from '../utils/translate.js';
import { mountCard } from '../utils/ui.js';
import { CONFIG } from '../constants.js';
import { fetchJson } from '../utils/api.js';

export async function initHoroscope(targetId) {
    const { SPANISH, ENGLISH, ICON } = CONFIG.ZODIAC_SIGN;
    const ui = mountCard(targetId, `Horóscopo ${SPANISH}`);
    if (!ui) return;

    ui.setLoading(true);

    try {
        // Usamos el cliente HTTP robusto (allorigins proxy por si acaso)
        const targetUrl = `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${ENGLISH}&day=today`;
        
        let horoscopeText = "";
        
        try {
            const data = await fetchJson(targetUrl);
            horoscopeText = data.data.horoscope_data;
        } catch (e) {
            // Fallback a proxy si falla directo (para móviles/CORS)
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
            const proxyData = await fetchJson(proxyUrl);
            const parsed = JSON.parse(proxyData.contents);
            horoscopeText = parsed.data.horoscope_data;
        }

        const translated = await translateText(horoscopeText);

        ui.setContent(`
            <div class="text-center py-1">
                <h3 class="fw-bold mb-0 text-dark">${SPANISH} ${ICON}</h3>
                <p class="card-text text-secondary mt-2" style="font-size: 0.95rem; line-height: 1.5;">
                    ${translated}
                </p>
            </div>
        `);
        ui.setSuccess();

    } catch (error) {
        ui.setError('Error API horóscopo');
    }
}