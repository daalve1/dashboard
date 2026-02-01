/**
 * Diccionario de configuraciones predefinidas
 */
const presets = {
    // 🌼 Configuración 1: Margaritas
    margaritas: {
        fpsLimit: 120,
        particles: {
            number: { 
                value: 30,
                density: { enable: true, area: 800 }
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
                speed: 3,
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
            opacity: { value: { min: 0.5, max: 1 } },
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

    // 🎄 Configuración 3: Navidad
    navidad: {
        fpsLimit: 120,
        particles: {
            number: { 
                value: 30,
                density: { enable: true, area: 800 }
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
                speed: 3,
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

    // 🎉 Configuración 4: Confeti
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

    // 🌧️ Configuración 5: Lluvia (CORREGIDA - VERTICAL)
    lluvia: {
        fpsLimit: 120,
        particles: {
            number: { 
                value: 150, 
                density: { enable: true, area: 800 } 
            },
            color: { value: "#ffffff" },
            shape: {
                type: "line"
            },
            stroke: {
                width: 1,
                color: "#7896d8"
            },
            opacity: {
                value: 0.7
            },
            size: {
                value: { min: 15, max: 25 }
            },
            rotate: {
                value: 95,
                random: false,
                animation: { enable: false }
            },
            move: {
                enable: true,
                speed: 12,
                direction: "bottom",
                straight: true,
                outModes: "out"
            }
        }
    }
};

export async function lanzarDecoracion(containerId, tipo) {
  const config = presets[tipo];

  if (!config) {
    console.error(`El efecto "${tipo}" no existe.`);
    return;
  }

  await tsParticles.load(containerId, config);
}