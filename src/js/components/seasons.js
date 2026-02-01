import { mountCard } from '../utils/ui.js';

/**
 * Inicializa la tarjeta de estación del año.
 * 
 * @param {string} targetId - ID del elemento HTML que se utilizará para montar la tarjeta.
 */
export async function initSeason(targetId) {
    const ui = mountCard(targetId, 'Estación del año');
    if (!ui) return;
    ui.setLoading(true);

    const { estacionActual, estacionSiguiente, diasFaltantes, fechas } = infoEstacion();

    ui.setContent(`
        <div class="text-center py-1">
            <h3 class="fw-bold mb-0 text-dark">${estacionActual}</h3>
            <div class="text-primary fw-bold my-2">
                📅 ${fechas}
            </div>
            <span class="badge bg-purple rounded-pill">
                Faltan ${diasFaltantes} días para ${estacionSiguiente.split(' ')[0].toLowerCase()}
            </span>
        </div>
    `);

    ui.setSuccess();
}

/**
 * Devuelve información sobre la estación del año actual
 * @returns {object} con las propiedades:
 *   - actual: string con el nombre de la estación actual
 *   - siguiente: string con el nombre de la estación siguiente
 *   - faltan: número de días que faltan para la siguiente estación
 */
function infoEstacion() {
  const ahora = new Date();
  const anioActual = ahora.getFullYear();

  // Definimos las fechas de inicio (Mes es 0-indexado: 2 = Marzo, 5 = Junio, etc.)
  const estaciones = [
    { nombre: "Primavera 🌼", inicio: new Date(anioActual, 2, 21), fechas: "Desde el 21 de Marzo" },
    { nombre: "Verano 🏖️", inicio: new Date(anioActual, 5, 21), fechas: "Desde el 21 de Junio" },
    { nombre: "Otoño 🍂", inicio: new Date(anioActual, 8, 21), fechas: "Desde el 21 de Septiembre" },
    { nombre: "Invierno 🥶", inicio: new Date(anioActual, 11, 21), fechas: "Desde el 21 de Diciembre" }
  ];

  let estacionActual, proximaEstacion;

  // Encontrar en qué estación estamos
  if (ahora < estaciones[0].inicio) {
    estacionActual = estaciones[3].nombre;
    proximaEstacion = estaciones[0];
  } else if (ahora < estaciones[1].inicio) {
    estacionActual = estaciones[0].nombre;
    proximaEstacion = estaciones[1];
  } else if (ahora < estaciones[2].inicio) {
    estacionActual = estaciones[1].nombre;
    proximaEstacion = estaciones[2];
  } else if (ahora < estaciones[3].inicio) {
    estacionActual = estaciones[2].nombre;
    proximaEstacion = estaciones[3];
  } else {
    estacionActual = estaciones[3].nombre;
    // Si ya pasamos el 21 de Dic, la próxima es la Primavera del año que viene
    proximaEstacion = { 
        nombre: estaciones[0].nombre, 
        inicio: new Date(anioActual + 1, 2, 21) 
    };
  }

  // Calcular diferencia en días
  const msPorDia = 1000 * 60 * 60 * 24;
  const diasFaltantes = Math.ceil((proximaEstacion.inicio - ahora) / msPorDia);

  return {
    estacionActual: estacionActual,
    estacionSiguiente: proximaEstacion.nombre,
    diasFaltantes: diasFaltantes,
    fechas: proximaEstacion.fechas
  };
}