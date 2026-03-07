import { mountCard } from '../utils/ui.js';
import { getDaysDiff, formatDateBeautiful } from '../utils/dates.js';
import { fetchJson } from '../utils/api.js';

export async function initHolidays(targetId) {
  const ui = mountCard(targetId, 'Próximos festivos');
  if (!ui) return;
  ui.setLoading(true);

  const year = new Date().getFullYear();
  const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/ES`;

  try {
    const festivosApi = await fetchJson(url);

    // Festivos locales manuales (Deberían estar en constants si crecen)
    const festivosLocales = [
      { date: `${year}-02-03`, localName: 'San Blas (Local)', counties: null },
      { date: `${year}-03-18`, localName: 'Fallas (Local)', counties: null },
    ];

    // Unificar y filtrar próximos
    const hoyStr = new Date().toISOString().split('T')[0];

    const proximo = [...festivosApi, ...festivosLocales]
      .filter(
        (f) =>
          f.global ||
          (f.counties && f.counties.includes('ES-VC')) ||
          !f.counties
      ) // Filtro región
      .filter((f) => f.date >= hoyStr) // Solo futuros
      .sort((a, b) => a.date.localeCompare(b.date))[0]; // Ordenar y coger primero

    if (proximo) {
      const dias = getDaysDiff(proximo.date);
      // Ajuste visual: si es mañana (1 día) o hoy (0 días)
      const badge = dias === 0 ? '¡Hoy!' : `${dias} días`;

      ui.setContent(`
                <div class="text-center py-1">
                    <h3 class="fw-bold mb-0 text-dark">${proximo.localName} 🎉</h3>
                    <div class="text-primary fw-bold my-2 text-capitalize">
                        📅 ${formatDateBeautiful(proximo.date)}
                    </div>
                    <span class="badge bg-purple rounded-pill">${badge}</span>
                </div>
            `);
    } else {
      ui.setContent(
        `<div class="text-muted text-center">No quedan festivos este año 😢</div>`
      );
    }
    ui.setSuccess();
  } catch (error) {
    console.error(error);
    ui.setError('Error API Festivos');
  }
}
