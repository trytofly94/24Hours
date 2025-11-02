# PWA Icons

## Current Status

The `icon.svg` file contains the source icon design. For a production deployment, this needs to be converted to PNG files in the following sizes:

- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

## How to Generate Icons

You can use one of these tools to generate the icons:

1. **PWA Asset Generator** (recommended):
   ```bash
   npx @vite-pwa/assets-generator --preset minimal public/icons/icon.svg
   ```

2. **Manual conversion** with ImageMagick:
   ```bash
   convert icon.svg -resize 72x72 icon-72x72.png
   convert icon.svg -resize 96x96 icon-96x96.png
   # ... etc for all sizes
   ```

3. **Online tools**:
   - https://realfavicongenerator.net/
   - https://www.favicon-generator.org/

## Design Notes

The icon features:
- Primary color: Indigo (#4F46E5)
- Circular design representing 24-hour time
- White clock hands at 12:00 and 3:00 positions
- "24" text at bottom
- Rounded corners (64px radius) for modern look
