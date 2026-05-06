// Script para generar iconos PWA a partir de la imagen principal
// Este script necesita ser ejecutado en un entorno Node.js con Canvas API

const fs = require('fs');
const path = require('path');

// Crear placeholders SVG para iconos
const createSVGIcon = (size, text = 'AL') => {
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#050505"/>
  <rect x="2" y="2" width="${size-4}" height="${size-4}" fill="#ffd600" rx="${size/8}"/>
  <text x="${size/2}" y="${size/2}" text-anchor="middle" dominant-baseline="middle" 
        font-family="Arial, sans-serif" font-size="${size/4}" font-weight="bold" fill="#050505">
    ${text}
  </text>
</svg>`;
  return svg;
};

// Tamaños de iconos necesarios
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

// Generar archivos SVG
iconSizes.forEach(size => {
  const svgContent = createSVGIcon(size, 'AL');
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(filename, svgContent);
  console.log(`✅ Creado: ${filename}`);
});

// Crear favicon.ico básico
const faviconSVG = createSVGIcon(32, 'AL');
fs.writeFileSync('favicon.svg', faviconSVG);
console.log('✅ Creado: favicon.svg');

console.log('\n🎯 Iconos PWA generados exitosamente!');
console.log('📝 Nota: Para producción, convierte estos SVG a PNG con herramientas como:');
console.log('   - npm install -g svg2png');
console.log('   - Online: https://convertio.co/es/svg-png/');
console.log('   - Photoshop/GIMP para mayor calidad');

// Crear script de conversión a PNG (opcional)
const convertScript = `// Script para convertir SVG a PNG usando sharp
const sharp = require('sharp');
const fs = require('fs');

const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

async function convertIcons() {
  for (const size of sizes) {
    try {
      await sharp('icon-512x512.svg')
        .resize(size, size)
        .png({ quality: 90 })
        .toFile(\`icon-\${size}x\${size}.png\`);
      console.log(\`✅ Convertido: icon-\${size}x\${size}.png\`);
    } catch (error) {
      console.error(\`❌ Error al convertir icon-\${size}x\${size}.png:\`, error);
    }
  }
}

convertIcons().then(() => console.log('🎉 Conversión completada!'));
`;

fs.writeFileSync('convertir-iconos.js', convertScript);
console.log('✅ Creado: convertir-iconos.js (requiere sharp: npm install sharp)');
