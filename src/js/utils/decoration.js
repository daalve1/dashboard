/**
 * Diccionario de configuraciones predefinidas
 */
const presets = {
  // 🌼 Configuración 1: Margaritas (OPTIMIZADA)
  margaritas: {
    fpsLimit: 120, // CLAVE: Suaviza la animación sincronizando con la pantalla
    particles: {
      number: { 
        value: 30,
        density: { enable: true, area: 800 } // Ajusta la cantidad según el tamaño de pantalla
      },
      shape: {
        type: "char", 
        character: {
          value: ["🌼", "🌻", "🌸"], 
          font: "Verdana",
          weight: "400"
        }
      },
      size: { value: { min: 20, max: 40 } },
      move: {
        enable: true,
        speed: 3, // Un poco más rápido para que no parezca que flotan en el vacío
        direction: "bottom", 
        outModes: "out",
        straight: false,
      },
      rotate: {
        value: { min: 0, max: 360 },
        animation: { enable: true, speed: 5, sync: false }
      }
    }
  },

  // ❄️ Configuración 2: Nieve
  nieve: {
    fpsLimit: 120,
    particles: {
      number: { value: 100, density: { enable: true, area: 800 } },
      color: { value: "#ffffff" },
      shape: { type: "circle" }, 
      opacity: { value: { min: 0.5, max: 1 } }, // Más visible
      size: { value: { min: 2, max: 6 } },
      move: {
        enable: true,
        speed: 2,
        direction: "bottom",
        random: true, 
        outModes: "out"
      }
    }
  },

  navidad: {
    fpsLimit: 120, // CLAVE: Suaviza la animación sincronizando con la pantalla
    particles: {
      number: { 
        value: 30,
        density: { enable: true, area: 800 } // Ajusta la cantidad según el tamaño de pantalla
      },
      shape: {
        type: "char", 
        character: {
          value: ["🎄", "🎅🏻", "🎁", "❄️"], 
          font: "Verdana",
          weight: "400"
        }
      },
      size: { value: { min: 10, max: 25 } },
      move: {
        enable: true,
        speed: 3, // Un poco más rápido para que no parezca que flotan en el vacío
        direction: "bottom", 
        outModes: "out",
        straight: false,
      },
      rotate: {
        value: { min: 0, max: 360 },
        animation: { enable: true, speed: 5, sync: false }
      }
    }
  },

  // 🎉 Configuración 3: Confeti
  confeti: {
    fpsLimit: 120,
    particles: {
      number: { value: 70, density: { enable: true, area: 800 } },
      color: {
        value: ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"]
      },
      shape: { type: ["circle", "square"] }, 
      size: { value: { min: 5, max: 10 } },
      move: {
        enable: true,
        speed: 6,
        direction: "bottom",
        outModes: "out"
      },
      rotate: {
        value: { min: 0, max: 360 },
        animation: { enable: true, speed: 20 } 
      }
    }
  },

  // 🌧️ Configuración 4: Lluvia (CORREGIDA - VERTICAL)
  lluvia: {
    fpsLimit: 120, // Importante para que no vaya a tirones
    particles: {
      number: { 
        value: 150, 
        density: { enable: true, area: 800 } 
      },
      color: { value: "#ffffff" }, // Blanco
      shape: {
        type: "line" // Forma de línea
      },
      stroke: {
        width: 1, // Grosor de la gota (fino queda mejor)
        color: "#7896d8"
      },
      opacity: {
        value: 0.7 // Bastante visible
      },
      size: {
        value: { min: 15, max: 25 } // Largo de la gota (vertical)
      },
      // 👇 AQUÍ ESTÁ EL TRUCO PARA QUE NO SEAN HORIZONTALES 👇
      rotate: {
        value: 95,      // Rotamos 90 grados para que queden verticales
        random: false,  // Todas iguales
        animation: { enable: false } // Que no giren mientras caen
      },
      // 👆 -------------------------------------------------- 👆
      move: {
        enable: true,
        speed: 12,
        direction: "bottom",
        straight: true, // Caída recta perfecta
        outModes: "out"
      }
    }
  }
};

/**
 * Función principal
 */
export async function lanzarDecoracion(containerId, tipo) {
  const config = presets[tipo];

  if (!config) {
    console.error(`El efecto "${tipo}" no existe.`);
    return;
  }

  // Usamos loadFull o load dependiendo de tu instalación, pero load es seguro.
  // El 'await' asegura que la carga anterior termine antes de empezar la nueva
  await tsParticles.load(containerId, config);
}