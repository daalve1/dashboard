import { mountCard } from '../utils/ui.js';

// Base de datos local (fallback infalible en español)
const CITAS = [
    { text: "El éxito es la suma de pequeños esfuerzos repetidos cada día.", author: "Robert Collier" },
    { text: "No cuentes los días, haz que los días cuenten.", author: "Muhammad Ali" },
    { text: "La mejor forma de predecir el futuro es crearlo.", author: "Abraham Lincoln" },
    { text: "No te detengas cuando estés cansado. Detente cuando hayas terminado.", author: "Marilyn Monroe" },
    { text: "El único modo de hacer un gran trabajo es amar lo que haces.", author: "Steve Jobs" },
    { text: "Si puedes soñarlo, puedes hacerlo.", author: "Walt Disney" },
    { text: "Cae siete veces y levántate ocho.", author: "Proverbio Japonés" },
    { text: "Lo que no te mata te hace más fuerte.", author: "Friedrich Nietzsche" },
    { text: "La disciplina es el puente entre metas y logros.", author: "Jim Rohn" },
    { text: "El fracaso es el condimento que da sabor al éxito.", author: "Truman Capote" }
];

/**
 * Simula una llamada a API que devuelve una frase única basada en el día del año.
 * Esto asegura que todos los usuarios vean la misma frase hoy.
 */
async function fetchDailyQuote() {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 1. Obtenemos el día del año (0-365)
            const now = new Date();
            const start = new Date(now.getFullYear(), 0, 0);
            const diff = now - start;
            const oneDay = 1000 * 60 * 60 * 24;
            const dayOfYear = Math.floor(diff / oneDay);

            // 2. Usamos el módulo para ciclar sobre el array de citas
            // Si se acaban, vuelve a empezar la lista automáticamente.
            const index = dayOfYear % CITAS.length;
            
            resolve(CITAS[index]);
        }, 500); // Simulamos un pequeño retardo de red para realismo
    });
}

export async function initMotivation(targetId) {
    const ui = mountCard(targetId, 'Frase del Día');
    if (!ui) return;

    ui.setLoading(true);

    try {
        const quote = await fetchDailyQuote();

        // Renderizamos con un estilo elegante (blockquote)
        ui.setContent(`
            <div class="d-flex flex-column h-100 justify-content-center p-2 text-center">
                <figure class="mb-0">
                    <blockquote class="blockquote">
                        <p class="mb-3 fst-italic text-dark">"${quote.text}"</p>
                    </blockquote>
                    <figcaption class="blockquote-footer mt-1 text-muted mb-0">
                        <cite title="Source Title">${quote.author}</cite>
                    </figcaption>
                </figure>
            </div>
        `);
        
        ui.setSuccess();

    } catch (error) {
        console.error("Error en motivación:", error);
        ui.setError("No se pudo cargar la frase");
    }
}