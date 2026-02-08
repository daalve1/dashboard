/**
 * Traduce texto usando la API interna de Google (GTX) a través de un proxy.
 * Es la opción más rápida y fiable gratuita que existe hoy en día.
 * * @param {string} text - Texto a traducir
 * @param {string} targetLang - Idioma destino (ej: 'es', 'en')
 * @returns {Promise<string>} Texto traducido
 */
export async function translateText(text, targetLang = 'es') {
    if (!text) return "";
    
    // Limpiamos espacios extra
    const cleanText = text.trim();

    // ------------------------------------------------------------------
    // OPCIÓN 1: Google Translate (API GTX) + Proxy CORS
    // ------------------------------------------------------------------
    try {
        // Construimos la URL de Google (endpoint usado por extensiones)
        const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(cleanText)}`;
        
        // Usamos un proxy rápido para evitar el bloqueo CORS del navegador
        // 'corsproxy.io' es muy rápido y fiable para esto.
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(googleUrl)}`;
        
        const res = await fetch(proxyUrl);
        
        if (res.ok) {
            const data = await res.json();
            
            // Google devuelve un array de arrays un poco complejo:
            // [[["Hola mundo","Hello World",...], ["Otra frase",...]]]
            // Mapeamos para unir todas las frases traducidas
            if (data && data[0]) {
                return data[0].map(item => item[0]).join('');
            }
        }
    } catch (e) {
        // Si falla el proxy o Google, pasamos silenciosamente al plan B
        console.warn("Google GTX falló, cambiando a MyMemory...", e);
    }

    // ------------------------------------------------------------------
    // OPCIÓN 2: MyMemory API (Respaldo sólido)
    // ------------------------------------------------------------------
    try {
        const email = 'demo@gmail.com'; // Necesario para evitar bloqueos
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=en|${targetLang}&de=${email}`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.responseStatus === 200 && !data.responseData.translatedText.includes("MYMEMORY WARNING")) {
            return data.responseData.translatedText;
        }
    } catch (e) {
        console.error("Fallo total traducción:", e);
    }

    // Si todo falla, devuelve el original (mejor que un error)
    return cleanText;
}