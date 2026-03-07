import { mountCard } from '../utils/ui.js';
import { ALERTS } from '../constants.js';

/**
 * Realiza una petición HTTP a la URL dada y devuelve el resultado en formato XML.
 * La petición tiene un timeout de 5 segundos y se cancela si no se recibe respuesta
 * en ese plazo de tiempo.
 * Se agrega un parámetro 't' con el timestamp actual para evitar cachés.
 *
 * @param {string} url URL a la que se hará la petición
 * @returns {Promise<string>} Promesa que se resuelve con el resultado de la petición en formato XML
 * @throws {Error} Si la petición falla o se cancela
 */
async function fetchAvisosXml(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${url}?t=${Date.now()}`, {
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' },
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Parsea el XML de avisos meteorológicos y devuelve un array de objetos con los siguientes campos:
 * - fenomeno: String, nombre del fenómeno (meteorología, mar, etc.)
 * - inicioStr: String, fecha de inicio en formato 'HH:MM (DD/MM)'
 * - finStr: String, fecha de fin en formato 'HH:MM (DD/MM)'
 * - fechaInicio: Date, objeto Date con la fecha de inicio
 * - bg: String, código de color CSS para el fondo del aviso
 *
 * @param {string} xmlString String con el contenido XML de los avisos
 * @param {string} zonaBuscada String con el nombre de la zona a buscar (p. ej. 'Litoral norte de Valencia')
 * @returns {array<object>} Array de objetos con los avisos encontrados
 */
function parseAlerts(xmlString, zonaBuscada) {
  if (!xmlString || xmlString.trim().startsWith('<!DOCTYPE')) return [];

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  const items = xmlDoc.querySelectorAll('item');
  const alertas = [];
  const ahora = new Date();
  const styles = ALERTS.STYLES;

  items.forEach((item) => {
    const titleRaw = item.querySelector('title')?.textContent || '';
    const descRaw = item.querySelector('description')?.textContent || '';
    const titleLower = titleRaw.toLowerCase();

    if (
      titleLower.includes(zonaBuscada.toLowerCase()) &&
      !titleLower.includes('costeros')
    ) {
      const dateRegex = /(\d{2}:\d{2})\s(\d{2})-(\d{2})-(\d{4})/g;
      const matches = [...descRaw.matchAll(dateRegex)];

      if (matches.length >= 2) {
        // Parsear Fecha Inicio
        const [hIni, mIni] = matches[0][1].split(':');
        const fechaInicio = new Date(
          matches[0][4],
          matches[0][3] - 1,
          matches[0][2],
          hIni,
          mIni
        );

        // Parsear Fecha Fin
        const [hFin, mFin] = matches[1][1].split(':');
        const fechaFin = new Date(
          matches[1][4],
          matches[1][3] - 1,
          matches[1][2],
          hFin,
          mFin
        );

        // Filtrar si ya caducó
        if (fechaFin < ahora) return;

        let bg = styles.DEFAULT;
        if (titleLower.includes('amarillo')) bg = styles.AMARILLO;
        else if (titleLower.includes('naranja')) bg = styles.NARANJA;
        else if (titleLower.includes('rojo')) bg = styles.ROJO;

        const fenomeno = titleRaw.split('.')[2]?.trim() || 'Meteorología';

        alertas.push({
          fenomeno: fenomeno.toLowerCase(),
          inicioStr: `${matches[0][1]} (${matches[0][2]}/${matches[0][3]})`,
          finStr: `${matches[1][1]} (${matches[1][2]}/${matches[1][3]})`,
          fechaInicio: fechaInicio, // Guardamos el objeto Date para ordenar
          bg: bg,
        });
      }
    }
  });

  // ORDENAR: De más reciente (más cercano al presente) a más antiguo (futuro lejano)
  return alertas.sort((a, b) => a.fechaInicio - b.fechaInicio);
}

/**
 * Inicializa el componente de avisos meteorológicos.
 * Monta una tarjeta en el contenedor con id "targetId" con una lista de
 * avisos meteorológicos actuales y futuras.
 * La tarjeta lista los avisos con su respectiva fecha de inicio y
 * finalización.
 * Si no hay avisos meteorológicos, se muestra un mensaje de "Cielos tranquilos".
 * @param {string} targetId - ID del elemento HTML que se utilizará para montar la tarjeta.
 */
export async function initWeatherAdvice(targetId) {
  const ui = mountCard(targetId, 'Avisos Meteorológicos');
  if (!ui) return;
  ui.setLoading(true);

  const ENDPOINT = ALERTS.ENDPOINT;
  const ZONA = ALERTS.ZONE;

  try {
    const xmlData = await fetchAvisosXml(ENDPOINT);
    const alertas = parseAlerts(xmlData, ZONA);

    if (alertas.length === 0) {
      ui.setContent(`
                <div class="text-center py-1 text-muted">
                    <div class="display-6 mb-2">☀️</div>
                    <div class="small fw-bold">Cielos tranquilos</div>
                </div>
            `);
    } else {
      const html = alertas
        .map(
          (alerta) => `
                <div class="mb-2 border-0 shadow-sm" 
                     style="background: ${alerta.bg}; border-radius: 12px; overflow: hidden; color: white;">
                    <div class="p-2">
                        <h6 class="mb-2" style="letter-spacing: -0.5px; font-weight: 600;">
                           Alerta ${alerta.fenomeno}
                        </h6>
                        <div class="d-flex align-items-center justify-content-between bg-black bg-opacity-10 rounded-3 p-2" style="font-size: 0.75rem;">
                            <div class="text-center flex-fill">
                                <div class="opacity-75" style="font-size: 0.6rem;">INICIO</div>
                                <div class="fw-bold">${alerta.inicioStr}</div>
                            </div>
                            <div class="px-2 opacity-25">|</div>
                            <div class="text-center flex-fill">
                                <div class="opacity-75" style="font-size: 0.6rem;">FINALIZA</div>
                                <div class="fw-bold">${alerta.finStr}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        )
        .join('');

      ui.setContent(`<div class="p-1">${html}</div>`);
    }
    ui.setSuccess();
  } catch (error) {
    console.error(error);
    ui.setError('Error API Avisos meteorológicos');
  }
}
