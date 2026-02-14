export const CONFIG = {
  LOCATION: {
    NAME: "Torrent,Spain",
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
    AMARILLO: 'linear-gradient(135deg, #ffca28 0%, #ffb300 100%)',
    NARANJA: 'linear-gradient(135deg, #fd7e14 0%, #f76707 100%)',
    ROJO: 'linear-gradient(135deg, #fa5252 0%, #e03131 100%)',
    DEFAULT: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)'
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