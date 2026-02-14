import { fetchJson } from '../utils/api.js';
import { mountCard } from '../utils/ui.js';

export async function initMotivation(targetId) {
    const ui = mountCard(targetId, 'Frase del Día');
    if (!ui) return;

    ui.setLoading(true);

    try {
        const randomCategory = Math.random() < 0.5 ? 1 : 2; 
        const data = await fetchJson(`https://www.positive-api.online/phrases/esp?category_id=${randomCategory}`);
        const phraseData = data[Math.floor(Math.random() * data.length)];

        ui.setContent(`
            <div class="d-flex flex-column h-100 p-1 text-white justify-content-center">
                <div class="lh-1" style="font-size: 3rem; font-family: serif; margin-bottom: -1.5rem;">
                    “
                </div>
                
                <div class="px-3">
                    <blockquote class="blockquote mb-0 text-center">
                        <p class="fs-5" style="line-height: 1.5; font-style: italic;">
                            ${phraseData.text}
                        </p>
                        <figcaption class="blockquote-footer mt-1 mb-0 fs-6" style="text-align: right; margin-right: 2rem;">
                            ${phraseData.author || 'Anónimo'}
                        </figcaption>
                    </blockquote>
                </div>

                <div class="lh-1 text-end" style="font-size: 3rem; font-family: serif; margin-top: -1.5rem;">
                    ”
                </div>
            </div>
        `);
        
        ui.setSuccess();

    } catch (error) {
        ui.setError('Error API Frases motivacionales');
    }
}