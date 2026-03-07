/**
 * Calcula la diferencia en días entre la fecha actual y una fecha objetivo.
 * La fecha actual se establece con la hora 00:00:00 para evitar
 * influir en la cuenta de la diferencia.
 * La fecha objetivo se establece con la hora 00:00:00 para que la
 * diferencia en días sea precisa.
 * @param {Date|string} targetDate - Fecha objetivo para calcular la diferencia.
 * @returns {number} - Diferencia en días entre la fecha actual y la fecha objetivo.
 */
export function getDaysDiff(targetDate) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const diffTime = target - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Convierte un objeto Date al formato: "DíaSemana, DD de Mes"
 * @param {Date} dateInput - Objeto Date a formatear
 * @returns {string} - Fecha formateada (Ej: "Viernes, 21 de marzo")
 */
export function formatDateBeautiful(dateInput) {
  const date = new Date(dateInput);
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  const text = date.toLocaleDateString('es-ES', options);
  // Capitalizar primera letra
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Calcula la fecha de un evento que se produce en un mes y d a
 * determinados, en el a o actual o en el pr ximo.
 * Si la fecha del evento en el a o actual es anterior a la fecha actual,
 * se devuelve la fecha del evento en el pr ximo a o.
 * @param {number} month - N mero del mes en que se produce el evento (1-12).
 * @param {number} day - D a del mes en que se produce el evento (1-31).
 * @returns {Date} - Fecha del evento en el a o actual o en el pr ximo.
 */
export function getNextEventDate(month, day) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let eventDate = new Date(now.getFullYear(), month - 1, day);

  if (eventDate < now) {
    eventDate.setFullYear(now.getFullYear() + 1);
  }
  return eventDate;
}
