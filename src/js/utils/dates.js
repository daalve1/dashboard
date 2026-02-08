/**
 * Calcula los días de diferencia entre hoy y una fecha destino.
 * Devuelve 0 si es hoy.
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
 * Formatea una fecha a "Lunes, 24 de Enero"
 */
export function formatDateBeautiful(dateInput) {
    const date = new Date(dateInput);
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const text = date.toLocaleDateString('es-ES', options);
    // Capitalizar primera letra
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Ajusta una fecha al año actual o siguiente si ya ha pasado.
 * Útil para cumpleaños o eventos anuales.
 */
export function getNextEventDate(month, day) {
    const now = new Date();
    now.setHours(0,0,0,0);
    
    let eventDate = new Date(now.getFullYear(), month - 1, day);
    
    if (eventDate < now) {
        eventDate.setFullYear(now.getFullYear() + 1);
    }
    return eventDate;
}