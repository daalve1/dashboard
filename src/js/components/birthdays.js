import { mountCard } from '../utils/ui.js';
import { BIRTHDAYS } from '../constants.js';
import { lanzarDecoracion } from '../utils/decoration.js';
import { getDaysDiff, getNextEventDate } from '../utils/dates.js';

export async function initBirthdays(targetId) {
    const ui = mountCard(targetId, 'Cumpleaños del Año');
    if (!ui) return;
    ui.setLoading(true);

    try {
        const proximos = BIRTHDAYS.map(bd => {
            const [month, day] = bd.date.split('-').map(Number);
            // Ojo: Date usa meses 0-11, nuestro string es 01-12
            const fechaObj = getNextEventDate(month, day);
            const diasFaltantes = getDaysDiff(fechaObj);

            return { ...bd, fechaObj, diasFaltantes };
        })
        .filter(bd => bd.diasFaltantes < 35) // Filtro: próximos 35 días
        .sort((a, b) => a.diasFaltantes - b.diasFaltantes);

        if (proximos.length === 0) {
            ui.setContent('<div class="text-muted text-center small py-2">No hay cumpleaños cercanos</div>');
            ui.setSuccess();
            return;
        }

        const html = proximos.map(bd => {
            const esHoy = bd.diasFaltantes === 0;
            if (esHoy && bd.date === '12-12') lanzarDecoracion(targetId, 'confeti');

            let badge = esHoy ? '<span class="badge bg-danger">¡Hoy!</span>' 
                      : bd.diasFaltantes === 1 ? '<span class="badge bg-warning text-dark">Mañana</span>'
                      : `<span class="badge bg-purple">${bd.diasFaltantes} días</span>`;

            const fechaStr = bd.fechaObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

            return `
                <div class="list-group-item d-flex justify-content-between align-items-center px-0 py-2 border-bottom-0">
                    <div class="d-flex align-items-center gap-2">
                        <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                             style="width: 32px; height: 32px; font-weight: bold;">
                            ${bd.initials}
                        </div>
                        <div class="small">
                            <strong>${bd.name}</strong>
                            <div class="text-muted small">${fechaStr}</div>
                        </div>
                    </div>
                    ${badge}
                </div>
            `;
        }).join('');

        ui.setContent(`<div class="list-group list-group-flush">${html}</div>`);
        ui.setSuccess();

    } catch (error) {
        ui.setError('Error API cumpleaños');
    }
}