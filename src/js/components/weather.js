import { mountCard } from '../utils/ui.js';

/**
 * Mapea los estados de cielo de AEMET a emojis
 */
function getAemetEmoji(descripcion) {
    const desc = descripcion.toLowerCase();
    if (desc.includes('despejado')) return '☀️';
    if (desc.includes('poco nuboso')) return '🌤️';
    if (desc.includes('nuboso')) return '☁️';
    if (desc.includes('cubierto')) return '☁️';
    if (desc.includes('lluvia') || desc.includes('llovizna')) return '🌧️';
    if (desc.includes('tormenta')) return '⛈️';
    if (desc.includes('nieve')) return '❄️';
    if (desc.includes('niebla')) return '🌫️';
    return '🌤️';
}

export async function initWeather(targetId) {
    const ui = mountCard(targetId, 'Meteorología');
    if (!ui) return;

    // Endpoint de predicción diaria Torrent
    const urlPrediccion = `https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/46244?api_key=${import.meta.env.VITE_AEMET_API_KEY}`;

    // Endpoint de avisos AEMET
    const urlAvisos = `https://www.aemet.es/documentos_d/eltiempo/prediccion/avisos/rss/CAP_AFAC77_RSS.xml`;

    try {
        // PASO 1: Obtener la URL temporal de los datos
        const resPrediccion = await fetch(urlPrediccion, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        const resAvisos =  await fetch(urlAvisos, {
            method: 'GET'
        });

        const infoPrediccion = await resPrediccion.json();

        // Verificamos si la API de AEMET nos ha dado el OK
        if (infoPrediccion.estado !== 200 || resAvisos.status !== 200) {
            throw new Error(infoPrediccion.descripcion || 'Error en la API');
        }

        // PASO 2: Obtener los datos reales desde la URL que nos devuelve AEMET
        const resPrediccionData = await fetch(infoPrediccion.datos);
        const dataRawPrediccion = await resPrediccionData.json();

        const resAvisosData = await resAvisos.text();
        
        // AEMET devuelve un array, el primer elemento [0] es el municipio solicitado
        // y dentro de prediccion.dia[0] tenemos los datos de hoy
        const prediccion = dataRawPrediccion[0].prediccion.dia[0];

        // Extraer avisos y convertir a HTML
        const avisosHTML = extractAvisos(resAvisosData);

        // Obtener hora actual
        const horaActual = new Date().getHours();

        const estado = prediccion.estadoCielo[0].descripcion;
        const emoji = getAemetEmoji(estado);
        const temperaturaData = prediccion.temperatura.dato;
        const tempMax = prediccion.temperatura.maxima;
        const tempMin = prediccion.temperatura.minima;
        const humedadData = prediccion.humedadRelativa.dato;
        const precipitacionData = prediccion.probPrecipitacion;
        const uvIndice = prediccion.uvMax;
        const vientoData = prediccion.viento;

        // Obtener humedad actual según la hora del día
        const humedadActual = getHumedadActual(horaActual, humedadData);
        const precipitacionActual = getPrecipitacionActual(horaActual, precipitacionData);
        const temperaturaActual = getTemperaturaActual(horaActual, temperaturaData);
        const vientoActual = getVientoActual(horaActual, vientoData);

        // Renderizado del contenido
        ui.setContent(`
            <div class="row">
                <div class="col-6 text-center">
                    <div class="fs-1 fw-bold">${emoji}</div>
                    <div class="fs-1 fw-bold">${temperaturaActual}°C</div>
                </div>
                <div class="col-6">
                    <span class="text-primary fw-bold">↓ ${tempMin}°</span>
                    <span class="text-danger fw-bold">↑ ${tempMax}°</span>
                    <div class="text-muted small">
                        🌧️ ${precipitacionActual}%<br>
                        💧 ${humedadActual}%<br>
                        🌞 ${uvIndice}<br/>
                        🌬️ ${vientoActual}km/h
                    </div>
                </div>
            </div>
            <div class="mt-3">
                ${avisosHTML}
            </div>
        `);
        
        ui.setSuccess();
    } catch (error) {
        ui.setError('Error API Tiempo');
    }
}

function extractAvisos(data) {
    const error = data.includes("The requested URL was rejected");

    if (error) {
        return `
            <div class="d-flex align-items-center text-danger text-center">
                <div class="fw-bold small w-100">⚠️ No se han podido cargar los avisos</div>
            </div>
        `;
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "text/xml");
    
    // 3. Buscar los items (cada aviso es un <item>)
    const items = xmlDoc.querySelectorAll("item");
    
    let html = "";
    let encontrados = 0;
        
    // ZONA QUE BUSCAMOS (Tal cual la escribe AEMET)
    const zonaBuscada = "Litoral norte de Valencia";
    const zonaNoBuscada = "Costeros.";

    items.forEach(item => {
        const title = item.querySelector("title")?.textContent || "";
        const desc = item.querySelector("description")?.textContent || "";

        // --- EL FILTRO MÁGICO ---
        // Solo entramos si el título incluye el nombre de tu zona
        if (title.includes(zonaBuscada) && !title.includes(zonaNoBuscada)) {
            encontrados++;

            // Detectar color de la alerta
            let color = "bg-info"; 
            if (title.toLowerCase().includes("amarillo")) color = "bg-warning";
            if (title.toLowerCase().includes("naranja")) color = "bg-danger"; // Naranja = Rojo visual
            if (title.toLowerCase().includes("rojo")) color = "bg-dark";

            html += `
                <div class="alert ${color} text-white mb-2 p-2 shadow-sm">
                    <div class="fw-bold small">⚠️ ${title}</div>
                    <div class="small mt-1" style="font-size: 0.8rem; opacity: 0.9;">
                        ${desc}
                    </div>
                </div>
            `;
        }
    });

    // Si no hemos encontrado ninguna alerta ESPECÍFICA para esa zona
    if (encontrados === 0) {
        html = `
            <div class="d-flex align-items-center text-success">
                <span class="fs-2 me-2">🟢</span>
                <div>
                    <div class="fw-bold">Sin alertas activas</div>
                    <div class="small text-muted">${zonaBuscada}</div>
                </div>
            </div>
        `;
    }

    return html;
}

function getTemperaturaActual(horaActual, temperatura) {
    let indiceTemp;

    if (horaActual < 6) {
        indiceTemp = 0;
    } else if (horaActual < 12) {
        indiceTemp = 1;
    } else if (horaActual < 18) {
        indiceTemp = 2;
    } else {
        indiceTemp = 3;
    }

    return temperatura[indiceTemp].value;
}

function getPrecipitacionActual(horaActual, probPrecipitacion) {
    let indiceLluvia;
    
    if (horaActual < 6) {
        indiceLluvia = 3;
    } else if (horaActual < 12) {
        indiceLluvia = 4;
    } else if (horaActual < 18) {
        indiceLluvia = 5;
    } else {
        indiceLluvia = 6;
    }

    return probPrecipitacion[indiceLluvia].value;
}

function getHumedadActual(horaActual, humedadRelativa) {
    let indiceHumedad;

    if (horaActual < 6) {
        indiceHumedad = 0;
    } else if (horaActual < 12) {
        indiceHumedad = 1;
    } else if (horaActual < 18) {
        indiceHumedad = 2;
    } else {
        indiceHumedad = 3;
    }

    return humedadRelativa[indiceHumedad].value;
}

function getVientoActual(horaActual, viento) {
    let indiceViento;

    if (horaActual < 6) {
        indiceViento = 3;
    } else if (horaActual < 12) {
        indiceViento = 4;
    } else if (horaActual < 18) {
        indiceViento = 5;
    } else {
        indiceViento = 6;
    }

    return viento[indiceViento].velocidad;
}