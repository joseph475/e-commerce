const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svgPath = path.join(__dirname, '../public/icons/icon.svg');
const iconsDir = path.join(__dirname, '../public/icons');

async function generateIcons() {
  try {
    // Try to require sharp
    const sharp = require('sharp');
    
    if (!fs.existsSync(svgPath)) {
      console.log('SVG icon not found, skipping icon generation');
      return;
    }
    
    const svgBuffer = fs.readFileSync(svgPath);
    
    for (const size of sizes) {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      
      // Skip if icon already exists
      if (fs.existsSync(outputPath)) {
        console.log(`Icon ${size}x${size} already exists, skipping`);
        continue;
      }
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`Generated ${size}x${size} icon`);
    }
    
    console.log('Icon generation completed successfully!');
  } catch (error) {
    console.log('Sharp not available or failed, using existing icons');
    console.log('Error details:', error.message);
    
    // Check if we have existing icons
    const existingIcons = sizes.filter(size => {
      const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      return fs.existsSync(iconPath);
    });
    
    if (existingIcons.length > 0) {
      console.log(`Found ${existingIcons.length} existing icons, continuing with build`);
    } else {
      console.log('No existing icons found. PWA will work but may have missing icon warnings.');
    }
  }
}

generateIcons();
