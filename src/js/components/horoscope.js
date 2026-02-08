import { mountCard } from '../utils/ui.js';

/**
 * 1. Obtiene el horóscopo en Inglés
 */
async function fetchEnglishHoroscope(sign) {
    // API pública y gratuita (sin CORS usualmente)
    const url = `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${sign}&day=today`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error en API Horóscopo');
    
    const data = await res.json();
    // La estructura suele ser data.data.horoscope_data
    return data.data.horoscope_data;
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