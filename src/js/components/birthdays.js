import { mountCard } from '../utils/ui.js';
import { BIRTHDAYS } from '../constants.js';
import { lanzarDecoracion } from '../utils/decoration.js';

/**
 * Inicializa el componente de cumpleaños del año
 * @param {string} targetId - ID del elemento HTML que va a contener el componente
 * @returns {undefined}
 */
export async function initBirthdays(targetId) {
    const ui = mountCard(targetId, 'Cumpleaños del Año');
    if (!ui) return;
    ui.setLoading(true);

    try {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const añoActual = hoy.getFullYear();

        // Convertir cumpleaños a fechas completas y calcular días faltantes
        const cumpleañosPróximos = BIRTHDAYS
            .map(bd => {
                // Crear fecha con el año actual
                let fecha = new Date(`${añoActual}-${bd.date}`);
                fecha.setHours(0, 0, 0, 0);
                
                // Si la fecha ya pasó este año, usar el próximo año
                if (fecha < hoy) {
                    fecha = new Date(`${añoActual + 1}-${bd.date}`);
                    fecha.setHours(0, 0, 0, 0);
                }
                
                // Calcular días faltantes
                const diffTime = fecha - hoy;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                return {
                    ...bd,
                    fechaObj: fecha,
                    diasFaltantes: diffDays,
                    esHoy: diffDays === 0
                };
            })
            .filter(bd => bd.diasFaltantes < 35) // Solo cumpleaños en menos de 30 días
            .sort((a, b) => a.diasFaltantes - b.diasFaltantes);

        if (cumpleañosPróximos.length === 0) {
            ui.setContent('<div class="text-muted text-center small">No hay cumpleaños en los próximos 30 días</div>');
            ui.setSuccess();
            return;
        }

        let html = '<div class="list-group list-group-flush"><h3 class="fw-bold mb-0 text-dark text-center">Cumpleaños 🎂</h3>';

        cumpleañosPróximos.forEach(bd => {
            const fecha = bd.fechaObj.toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'short' 
            });

            let badge = '';

            // Comparar si es 12-12
            if (bd.esHoy) {
                badge = '<span class="badge bg-danger">¡Hoy!</span>';

                if(bd.date === '12-12') {
                    lanzarDecoracion('birthdays-mount', 'confeti');
                }
            } else if (bd.diasFaltantes === 1) {
                badge = '<span class="badge bg-warning text-dark">Mañana</span>';
            } else {
                badge = `<span class="badge bg-purple">${bd.diasFaltantes} días</span>`;
            }

            html += `
                <div class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                    <div class="d-flex align-items-center gap-2">
                        <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                             style="width: 32px; height: 32px; font-weight: bold;">
                            ${bd.initials}
                        </div>
                        <div class="small">
                            <strong>${bd.name}</strong>
                            <div class="text-muted small">${fecha}</div>
                        </div>
                    </div>
                    ${badge}
                </div>
            `;
        });

        html += '</div>';
        ui.setContent(html);
        ui.setSuccess();

    } catch (error) {
        ui.setError('Error al cargar cumpleaños');
        console.error("Error:", error);
    }
}