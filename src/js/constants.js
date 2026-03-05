export const CONFIG = {
  LOCATION: {
    NAME: "Torrente,Valencia,Spain",
    AEMET_ID: "46244",
    LAT_LON: "39.43, -0.47"
  },
  API: {
    TIMEOUT: 5000,
    RETRIES: 3
  }
};

export const BIRTHDAYS = [
  { date: '03-07', name: 'MAMÁ AMPARO', initials: 'A' },
  { date: '03-08', name: 'TTE DAVID', initials: 'D' },
  { date: '01-14', name: 'TITA ABUELA CARMEN', initials: 'C' },
  { date: '03-23', name: 'CUÑADA JULIA', initials: 'J' },
  { date: '08-13', name: 'PAPÁ JESÚS', initials: 'PJ' },
  { date: '10-17', name: 'TETE JAUME', initials: 'J' },
  { date: '10-30', name: 'RAYITO LEO', initials: 'RL' },
  { date: '11-21', name: 'AMORE', initials: 'AD' },
  { date: '12-12', name: 'Mi cumple', initials: 'S' },
];

export const UV_RANGES = [
  { min: 0,  max: 2,  riesgo: "(bajo)",     color: "#28a745", icono: "🟢" },
  { min: 3,  max: 5,  riesgo: "(moderado)", color: "#fbc02d", icono: "🟡" },
  { min: 6,  max: 7,  riesgo: "(alto)",     color: "#f57c00", icono: "🟠" },
  { min: 8,  max: 10, riesgo: "(muy alto)", color: "#d32f2f", icono: "🔴" },
  { min: 11, max: 99, riesgo: "(extremo)",  color: "#ff0000", icono: "🟣" }
];

export const MOON_PHASES = {
  "New Moon": { text: "Luna Nueva", icon: "🌑" },
  "Waxing Crescent": { text: "Luna Creciente", icon: "🌒" },
  "First Quarter": { text: "Cuarto Creciente", icon: "🌓" },
  "Waxing Gibbous": { text: "Gibosa Creciente", icon: "🌔" },
  "Full Moon": { text: "Luna Llena", icon: "🌕" },
  "Waning Gibbous": { text: "Gibosa Menguante", icon: "🌖" },
  "Last Quarter": { text: "Cuarto Menguante", icon: "🌗" },
  "Waning Crescent": { text: "Luna Menguante", icon: "🌘" }
};

export const ALERTS = {
  ZONE: "Litoral norte de Valencia",
  ENDPOINT: "/api/avisos",
  STYLES: {
    AMARILLO: '#ffca28',
    NARANJA: '#ff953d',
    ROJO: '#fa5252',
    DEFAULT: '#6c757d'
  }
}

export const HOROSCOPE = {
  ENDPOINT: "/api/horoscopo",
  ZODIAC_SIGN: {
    ENGLISH: "sagittarius",
    SPANISH: "Sagitario",
    ICON: "♐",
    ELEMENT: "Fuego"
  },
}