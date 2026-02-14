import { translateText } from '../utils/translate.js';
import { mountCard } from '../utils/ui.js';
import { HOROSCOPE } from '../constants.js';

async function fetchHoroscopo(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    try {
        const res = await fetch(`${url}`, { 
            signal: controller.signal,
            // Header opcional para evitar cachés agresivas
            headers: { 'Cache-Control': 'no-cache' } 
        });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

export async function initHoroscope(targetId) {
    const { SPANISH, ICON } = HOROSCOPE.ZODIAC_SIGN;
    const ui = mountCard(targetId, `Horóscopo ${SPANISH}`);
    if (!ui) return;

    ui.setLoading(true);

    try {
        const ENDPOINT = HOROSCOPE.ENDPOINT;
        
        let horoscopeText = "";
        
        const data = await fetchHoroscopo(ENDPOINT);
        horoscopeText = data.data.horoscope_data;
        
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
        ui.setError('Error API horóscopo', error);
    }
}