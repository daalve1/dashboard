import { mountCard } from '../utils/ui.js';
import { lanzarDecoracion } from '../utils/decoration.js';

/**
 * Inicializa la tarjeta de Navidad del año.
 *
 * @param {string} targetId - ID del elemento HTML que se utilizará para montar la tarjeta.
 * @returns {undefined}
 */
export async function initChristmas(targetId) {
  const ui = mountCard(targetId, 'Días para Navidad');
  if (!ui) return;
  ui.setLoading(true);

  try {
    // 1. Definir Navidad del año actual
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const añoActual = hoy.getFullYear();
    const navidad = new Date(`${añoActual}-12-25`);
    navidad.setHours(0, 0, 0, 0);

    // 2. Si ya pasó, usar Navidad del próximo año
    if (hoy > navidad) {
      navidad.setFullYear(añoActual + 1);
    }

    // 3. Calcular días restantes
    const diffTime = Math.abs(navidad - hoy);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let html = '';

    if (diffDays > 0) {
      // Formatear fecha bonita (ej: 9 de octubre)
      const fechaObj = new Date(navidad);
      const opciones = { day: 'numeric', month: 'long', weekday: 'long' };
      const fechaTexto = fechaObj.toLocaleDateString('es-ES', opciones);

      // Calcular días restantes
      const diffTime = Math.abs(fechaObj - hoy);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      html = `
                <div class="text-center py-1">
                    <h3 class="fw-bold mb-0 text-dark">Navidad 🎅🏻🎄</h3>
                    <div class="text-primary fw-bold my-2 text-capitalize">
                        📅 ${fechaTexto}
                    </div>
                    <span class="badge bg-purple rounded-pill">
                        ${diffDays} días
                    </span>
                </div>
            `;
    } else {
      lanzarDecoracion('christmas-mount', 'navidad');
      html = `<div class="text-muted">¡Ya es Navidad! 🎄🎅</div>`;
    }

    ui.setContent(
      `<ul class="list-group list-group-flush text-start">${html}</ul>`
    );
    ui.setSuccess();
  } catch (error) {
    console.error(error);
    ui.setError('Error API Navidad');
  }
}
