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

// Constante de reintentos
const FETCH_MAX_RETRIES = 5;

/**
 * Realiza un fetch con reintentos automáticos
 */
async function fetchWithRetry(url, options = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= FETCH_MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            if (attempt > 1) {
                console.log(`[Fetch] ✓ Éxito en intento ${attempt}/${FETCH_MAX_RETRIES}`);
            }
            return response;
        } catch (error) {
            lastError = error;
            console.warn(`[Fetch] ✗ Intento ${attempt}/${FETCH_MAX_RETRIES} falló: ${error.message}`);
            if (attempt < FETCH_MAX_RETRIES) {
                // Esperar 1 segundo antes de reintentar (APIs públicas)
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
    
    console.error(`[Fetch] ✗ Falló tras ${FETCH_MAX_RETRIES} intentos`);
    throw lastError;
}

async function fetchAndProcessAvisos(url, delayMs = 1000) {
    for (let i = 1; i <= FETCH_MAX_RETRIES; i++) {
        try {
            const res = await fetchWithRetry(url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            const text = await res.text();
            const processed = extractAvisos(text);
            // Si extractAvisos devuelve el mensaje de fallo, considerarlo error
            if (typeof processed === 'string' && processed.includes('No se han podido cargar los avisos')) {
                throw new Error('Contenido de avisos inválido');
            }
            return processed;
        } catch (err) {
            console.warn(`[Avisos] ✗ Intento ${i}/${FETCH_MAX_RETRIES} falló: ${err.message}`);
            if (i < FETCH_MAX_RETRIES) await new Promise(r => setTimeout(r, delayMs));
        }
    }
    console.error('[Avisos] ✗ Fallaron todos los intentos para avisos');
    return `\n                        <div class="d-flex align-items-center text-danger text-center">\n                            <div class="fw-bold small w-100">⚠️ No se han podido cargar los avisos</div>\n                        </div>\n                    `;
}

/**
 * Obtiene el valor actual según la hora del día
 */
function getValueByHour(horaActual, dataArray) {
    const indiceMap = {
        early: 0,    // 0-5h
        morning: 1,  // 6-11h
        afternoon: 2, // 12-17h
        evening: 3   // 18-23h
    };
    
    let periodo;
    if (horaActual < 6) periodo = 'early';
    else if (horaActual < 12) periodo = 'morning';
    else if (horaActual < 18) periodo = 'afternoon';
    else periodo = 'evening';
    
    return dataArray[indiceMap[periodo]];
}

/**
 * Obtiene el valor actual para datos con más periodos (lluvia, viento)
 */
function getValueByHourExtended(horaActual, dataArray) {
    const indiceMap = {
        early: 3,    // 0-5h
        morning: 4,  // 6-11h
        afternoon: 5, // 12-17h
        evening: 6   // 18-23h
    };
    
    let periodo;
    if (horaActual < 6) periodo = 'early';
    else if (horaActual < 12) periodo = 'morning';
    else if (horaActual < 18) periodo = 'afternoon';
    else periodo = 'evening';
    
    return dataArray[indiceMap[periodo]];
}

export async function initWeather(targetId) {
    const ui = mountCard(targetId, 'Meteorología');
    if (!ui) return;
    ui.setLoading(true);

    // Endpoint de predicción diaria Torrent
    const urlPrediccion = `https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/46244?api_key=${import.meta.env.VITE_AEMET_API_KEY}`;

    // Endpoint de avisos AEMET
    const urlAvisos = `https://www.aemet.es/documentos_d/eltiempo/prediccion/avisos/rss/CAP_AFAC77_RSS.xml`;

    try {
        // PASO 1: Obtener la URL temporal de los datos (con reintentos)
        const resPrediccion = await fetchWithRetry(urlPrediccion, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        const infoPrediccion = await resPrediccion.json();

        // Verificamos si la API de AEMET nos ha dado el OK
        if (infoPrediccion.estado !== 200) {
            throw new Error(infoPrediccion.descripcion || 'Error en la API Predicción');
        }

        // PASO 2: Obtener los datos reales desde la URL que nos devuelve AEMET
        const resPrediccionData = await fetchWithRetry(infoPrediccion.datos, {});
        const dataRawPrediccion = await resPrediccionData.json();
        
        // AEMET devuelve un array, el primer elemento [0] es el municipio solicitado
        // y dentro de prediccion.dia[0] tenemos los datos de hoy
        const prediccion = dataRawPrediccion[0].prediccion.dia[0];

        // Obtener hora actual
        const horaActual = new Date().getHours();

        const estado = prediccion.estadoCielo[0].descripcion;
        const emoji = getAemetEmoji(estado);
        const tempMax = prediccion.temperatura.maxima;
        const tempMin = prediccion.temperatura.minima;
        const uvIndice = prediccion.uvMax;

        // Obtener valores actuales según la hora
        const temperaturaActual = getValueByHour(horaActual, prediccion.temperatura.dato).value;
        const humedadActual = getValueByHour(horaActual, prediccion.humedadRelativa.dato).value;
        const precipitacionActual = getValueByHourExtended(horaActual, prediccion.probPrecipitacion).value;
        const vientoActual = getValueByHourExtended(horaActual, prediccion.viento).velocidad;

        // Renderizado del contenido del tiempo (sin esperar a avisos)
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
            <div class="mt-3" id="weather-avisos-container">
                <div class="d-flex justify-content-center py-2">
                    <div class="spinner-border spinner-border-sm text-secondary" role="status">
                        <span class="visually-hidden">Cargando avisos...</span>
                    </div>
                </div>
            </div>
        `);
        
        ui.setSuccess();
        
        // Cargar avisos en paralelo sin bloquear (2s entre reintentos)
        fetchAndProcessAvisos(urlAvisos, 2000).then(avisosHTML => {
            const container = document.getElementById('weather-avisos-container');
            if (container) container.innerHTML = avisosHTML;
        }).catch(err => {
            console.error('Error cargando avisos:', err);
            const container = document.getElementById('weather-avisos-container');
            if (container) container.innerHTML = `
                <div class="d-flex align-items-center text-danger text-center">
                    <div class="fw-bold small w-100">⚠️ No se han podido cargar los avisos</div>
                </div>
            `;
        });
    } catch (error) {
        ui.setError('Error API Tiempo');
        console.error("Error en Weather:", error);
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