import { initWeather } from './components/weather.js';
import { initHolidays } from './components/holidays.js';
import { initBirthdays } from './components/birthdays.js';
import { initChristmas } from './components/christmas.js';
import { initSeason } from './components/seasons.js';

// Inicializar componentes
initWeather('weather-mount');
initHolidays('holidays-mount');
initBirthdays('birthdays-mount');
initChristmas('christmas-mount');
initSeason('season-mount');