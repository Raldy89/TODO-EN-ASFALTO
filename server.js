const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// Tipos MIME para diferentes extensiones de archivo
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  console.log(`Petición recibida: ${req.method} ${req.url}`);

  // Convertir URL a ruta del sistema de archivos
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }

  // Obtener la extensión del archivo
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeType = mimeTypes[extname] || 'application/octet-stream';

  // Leer el archivo
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // Archivo no encontrado
        fs.readFile('./index.html', (error, content) => {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        });
      } else {
        // Error del servidor
        res.writeHead(500);
        res.end(`Error del servidor: ${error.code}`);
      }
    } else {
      // Archivo encontrado, servirlo
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Servidor iniciado exitosamente`);
  console.log(`📱 Aplicación: TODO EN ASFALTO DE LEÓN`);
  console.log(`🌐 URL local: http://localhost:${PORT}`);
  console.log(`📂 Directorio: ${__dirname}`);
  console.log(`\n✨ La aplicación está lista para usarse`);
  console.log(`💡 Presiona Ctrl+C para detener el servidor\n`);
});
