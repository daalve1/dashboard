import { mountCard } from '../utils/ui.js';

/**
 * 1. Obtiene una frase aleatoria en Inglés desde una API estable
 */
async function fetchEnglishQuote() {
    // DummyJSON es muy rápida y tiene CORS habilitado
    const res = await fetch('https://dummyjson.com/quotes/random');
    
    if (!res.ok) throw new Error('Error al obtener la cita');
    
    const data = await res.json();
    // Devuelve objeto: { id: 1, quote: "...", author: "..." }
    return {
        text: data.quote,
        author: data.author
    };
}

/**
 * 2. Traduce el texto usando MyMemory API
 * (Reutilizamos la lógica del horóscopo)
 */
async function translateText(text) {
    try {
        const encodedText = encodeURIComponent(text);
        // Pedimos traducción de Inglés (en) a Español (es)
        const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|es`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.responseStatus === 200 && data.responseData.translatedText) {
            return data.responseData.translatedText;
        }
        return text; // Si falla, devolvemos original
    } catch (e) {
        console.warn("Fallo traducción:", e);
        return text; // Fallback
    }
}

export async function initMotivation(targetId) {
    const ui = mountCard(targetId, 'Frase del Día');
    if (!ui) return;

    ui.setLoading(true);

    try {
        // A. Obtener frase (Inglés)
        const quoteData = await fetchEnglishQuote();
        
        // B. Traducir SOLO el texto (los nombres propios mejor no tocarlos)
        const translatedText = await translateText(quoteData.text);

        // C. Renderizar
        ui.setContent(`
            <div class="d-flex flex-column h-100 justify-content-center p-1 text-center">
                <figure class="mb-0">
                    <blockquote class="blockquote">
                        <p class="mb-3 fst-italic fs-5 text-dark">
                            "${translatedText}"
                        </p>
                    </blockquote>
                    
                    <figcaption class="blockquote-footer mt-2 text-muted mb-0">
                        <cite title="Autor">${quoteData.author}</cite>
                    </figcaption>
                </figure>
            </div>
        `);
        
        ui.setSuccess();

    } catch (error) {
        console.error("Error motivación:", error);
        // Fallback en caso de error total
        ui.setError("El éxito consiste en ir de fracaso en fracaso sin perder el entusiasmo.");
    }
}