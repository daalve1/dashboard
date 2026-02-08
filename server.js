import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración para usar directorios en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 1. ENDPOINT PROXY PARA AEMET
// Tu frontend llamará a /api/avisos, y este servidor llamará a AEMET
app.get('/api/avisos', async (req, res) => {
    const urlAemet = 'https://www.aemet.es/documentos_d/eltiempo/prediccion/avisos/rss/CAP_AFAC77_RSS.xml';

    try {
        console.log(`[Proxy] Solicitando datos a AEMET...`);
        
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

// 2. SERVIR TU FRONTEND (Archivos estáticos)
app.use(express.static('dist')); 

// Cualquier otra petición devuelve el index.html (para Single Page Apps)
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando en puerto ${PORT}`);
});