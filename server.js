import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración para usar directorios en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ENDPOINT PROXY PARA AEMET
app.get('/api/avisos', async (req, res) => {
    const urlAemet = 'https://www.aemet.es/documentos_d/eltiempo/prediccion/avisos/rss/CAP_AFAC77_RSS.xml';

    try {
        const response = await fetch(urlAemet, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/xml, text/xml, */*'
            }
        });

        if (!response.ok) {
            throw new Error(`Error AEMET: ${response.status}`);
        }

        const data = await response.text();
        
        // Devolvemos el XML al frontend tal cual
        res.set('Content-Type', 'text/xml');
        res.send(data);

    } catch (error) {
        console.error('[Proxy Error]', error.message);
        res.status(500).send('<error>Error obteniendo avisos</error>');
    }
});

// ENDPOINT PROXY PARA HOSÓSCOPO
app.get('/api/horoscopo', async (req, res) => {
    const url = `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=sagittarius&day=today`;

    try {
        console.log(`[Proxy] Solicitando datos a HOSÓSCOPO...`);
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            }
        });

        if (!response.ok) {
            throw new Error(`Error HOSÓSCOPO: ${response.status}`);
        }

        const data = await response.json();
        
        // Devolvemos el JSON al frontend tal cual
        res.set('Content-Type', 'application/json');
        res.send(data);

    } catch (error) {
        console.error('[Proxy Error]', error.message);
        res.status(500).send('<error>Error obteniendo horóscopo</error>');
    }
});

// SERVIR TU FRONTEND
app.use(express.static('dist')); 

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando en puerto ${PORT}`);
});