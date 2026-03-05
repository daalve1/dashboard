import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración para usar directorios en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const COMMON_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

// ENDPOINT PROXY PARA AEMET
app.get('/api/avisos', async (req, res) => {
    const url = 'https://www.aemet.es/documentos_d/eltiempo/prediccion/avisos/rss/CAP_AFAC77_RSS.xml';

    try {
        const response = await fetch(url, {
            headers: { ...COMMON_HEADERS, 'Accept': 'application/xml, text/xml, */*' }
        });

        if (!response.ok) throw new Error(`Error AEMET: ${response.status}`);

        const data = await response.text();
        
        res.set('Content-Type', 'text/xml');
        res.send(data);
    } catch (error) {
        console.error('[Proxy Error - AEMET]', error.message);
        res.status(500).json({ error: 'Error obteniendo avisos' });
    }
});

// ENDPOINT PROXY PARA HORÓSCOPO
app.get('/api/horoscopo', async (req, res) => {
    // Parámetros dinámicos con fallback a los tuyos originales
    const sign = req.query.sign || 'sagittarius';
    const day = req.query.day || 'today';
    const url = `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${sign}&day=${day}`;

    try {
        const response = await fetch(url, {
            headers: { ...COMMON_HEADERS, 'Accept': 'application/json, text/plain, */*' }
        });

        if (!response.ok) throw new Error(`Error HOSÓSCOPO: ${response.status}`);

        const data = await response.json();
        
        res.json(data);
    } catch (error) {
        console.error('[Proxy Error - Horóscopo]', error.message);
        res.status(500).json({ error: 'Error obteniendo horóscopo' });
    }
});

app.use(express.static('dist')); 

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando en puerto ${PORT}`);
});