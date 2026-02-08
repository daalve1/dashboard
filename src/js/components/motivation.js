import { fetchJson } from '../utils/api.js';
import { translateText } from '../utils/translate.js';
import { mountCard } from '../utils/ui.js';

export async function initMotivation(targetId) {
    const ui = mountCard(targetId, 'Frase del Día');
    if (!ui) return;

    ui.setLoading(true);

    try {
        // A. Obtener frase (Inglés)
        const data = await fetchJson('https://dummyjson.com/quotes/random');
        
        // B. Traducir SOLO el texto (los nombres propios mejor no tocarlos)
        const translatedText = await translateText(data.quote, 'es');

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
                        <cite title="Autor">${data.author}</cite>
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