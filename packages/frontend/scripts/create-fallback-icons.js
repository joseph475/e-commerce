const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// Simple PNG data for a blue square (base64 encoded)
const createSimplePNG = (size) => {
  // This is a minimal PNG data structure for a solid blue square
  // In a real scenario, you'd want to use a proper image library
  // But for fallback purposes, we'll create a simple colored square
  
  const canvas = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#3b82f6" rx="${size * 0.125}"/>
    <g fill="white">
      <rect x="${size * 0.1875}" y="${size * 0.3125}" width="${size * 0.625}" height="${size * 0.375}" rx="${size * 0.03125}" fill="white"/>
      <rect x="${size * 0.21875}" y="${size * 0.34375}" width="${size * 0.5625}" height="${size * 0.15625}" rx="${size * 0.015625}" fill="#3b82f6"/>
      <text x="${size * 0.5}" y="${size * 0.4375}" text-anchor="middle" font-family="Arial" font-size="${size * 0.09375}" font-weight="bold" fill="white">POS</text>
    </g>
  </svg>`;
  
  return canvas;
};

function createFallbackIcons() {
  try {
    // Ensure icons directory exists
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }

    console.log('Creating fallback SVG icons...');
    
    for (const size of sizes) {
      const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
      
      // Only create if PNG doesn't exist
      if (!fs.existsSync(iconPath)) {
        const svgContent = createSimplePNG(size);
        fs.writeFileSync(svgPath, svgContent);
        console.log(`Created fallback SVG icon: ${size}x${size}`);
      } else {
        console.log(`PNG icon ${size}x${size} already exists, skipping`);
      }
    }
    
    console.log('Fallback icon creation completed!');
  } catch (error) {
    console.error('Error creating fallback icons:', error);
  }
}

// Only run if called directly
if (require.main === module) {
  createFallbackIcons();
}

module.exports = { createFallbackIcons };
