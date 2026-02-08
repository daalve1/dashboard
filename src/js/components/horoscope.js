import { mountCard } from '../utils/ui.js';

/**
 * 1. Obtiene el horóscopo en Inglés
 */
/**
 * 1. Obtiene el horóscopo en Inglés (Versión Blindada para Móvil)
 */
async function fetchEnglishHoroscope(sign) {
    const baseUrl = `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${sign}&day=today`;
    // Añadimos timestamp para evitar caché agresiva en móviles
    const urlDirecta = `${baseUrl}&t=${Date.now()}`;

    try {
        // INTENTO 1: Directo con política de privacidad estricta
        // 'no-referrer' es la clave para que funcione en móviles muchas veces
        const res = await fetch(urlDirecta, {
            method: 'GET',
            referrerPolicy: 'no-referrer', // <--- ESTO ES LA CLAVE EN MÓVIL
            cache: 'no-store'
        });

        if (res.ok) {
            const data = await res.json();
            return data.data.horoscope_data;
        }
        throw new Error("Bloqueo móvil directo");

    } catch (e) {
        console.warn("Fallo directo en móvil, activando túnel proxy...", e);
        
        // INTENTO 2: Usar un Proxy (AllOrigins)
        // Esto "engaña" a la API haciéndole creer que la petición viene del servidor del proxy, no de tu móvil
        try {
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(baseUrl)}`;
            const resProxy = await fetch(proxyUrl);
            const dataProxy = await resProxy.json();
            
            if (dataProxy.contents) {
                const parsedData = JSON.parse(dataProxy.contents);
                return parsedData.data.horoscope_data;
            }
        } catch (proxyError) {
            console.error("Falló también el proxy", proxyError);
        }

        // INTENTO 3 (Último recurso): Devolver texto genérico para que no se rompa la UI
        return "The stars are aligning to bring you new opportunities. Trust your intuition today.";
    }
}

/**
 * 2. Traduce el texto usando MyMemory API
 * (Límite gratuito: 500 palabras/día aprox desde la misma IP)
 */
async function translateText(text) {
    try {
        const encodedText = encodeURIComponent(text);
        const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|es`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.responseStatus === 200) {
            return data.responseData.translatedText;
        }
        return text; // Si falla la traducción, devolvemos en inglés
    } catch (e) {
        console.warn("Fallo en traducción, mostrando original:", e);
        return text; // Fallback al inglés
    }
}

export async function initHoroscope(targetId) {
    const ui = mountCard(targetId, 'Horóscopo Sagitario');
    if (!ui) return;

    ui.setLoading(true);

    try {
        // A. Pedimos el horóscopo (Inglés)
        const textEn = await fetchEnglishHoroscope('sagittarius');
        
        // B. Lo traducimos (Español)
        // Nota: Si la API de traducción falla, mostrará el inglés
        const textEs = await translateText(textEn);

        // C. Renderizamos
        ui.setContent(`
            <div class="d-flex flex-column h-100 p-2">
                <div class="d-flex align-items-center">
                    <div class="text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                         style="width: 50px; height: 50px; font-size: 1.5rem;">
                        ♐
                    </div>
                    <div>
                        <h5 class="mb-0 fw-bold">Sagitario</h5>
                    </div>
                </div>

                <div>
                    <p class="card-text text-secondary" style="font-size: 0.95rem; line-height: 1.5;">
                        ${textEs}
                    </p>
                </div>
            </div>
        `);
        
        ui.setSuccess();

    } catch (error) {
        console.error("Error API horóscopo");
        ui.setError('No se pudo conectar con los astros.', error);
    }
}