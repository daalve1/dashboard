import { initWeather } from './components/weather.js';
import { initHolidays } from './components/holidays.js';
import { initBirthdays } from './components/birthdays.js';
import { initChristmas } from './components/christmas.js';
import { initSeason } from './components/seasons.js';
import { initMoon } from './components/moon.js';
import { initWeatherAdvice } from './components/weather-advices.js';
import { initMotivation } from './components/motivation.js';

// Inicializar componentes
initWeather('weather-mount');
initHolidays('holidays-mount');
initBirthdays('birthdays-mount');
initChristmas('christmas-mount');
initSeason('season-mount');
initMoon('moon-mount');
initWeatherAdvice('weather-advices-mount');
initMotivation('motivation-mount');