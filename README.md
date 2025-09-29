# ASCII Art Generator

A client-side web application that converts any image into colorful ASCII art with real-time preview and text export functionality. Built with vanilla JavaScript and HTML5 Canvas API.

## 🎯 Features

- **Real-time ASCII Conversion** - Live preview as you adjust settings
- **Adjustable Resolution** - 1-20px cell size for fine-tuning detail level
- **Color Preservation** - ASCII characters rendered in original image colors
- **Text Export** - Copy ASCII art as plain text for use anywhere
- **Responsive Design** - Works on desktop and tablet devices
- **No Server Required** - Runs entirely in the browser using FileReader API
- **Auto-scaling** - Large images automatically resized to fit canvas
- **Performance Optimization** - Automatic cell count limiting for smooth performance

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Graphics**: HTML5 Canvas API, FileReader API
- **Styling**: Custom CSS with dark theme
- **Architecture**: Object-oriented design with ES6 classes

## 🚀 Quick Start

1. **Clone or download the repository**
   ```bash
   git clone https://github.com/viktorHadz/ascii-art-generator.git
   cd ascii-art-generator
   ```

2. **Open in browser**
   - Simply open `ascii.html` in any modern web browser
   - No installation or server setup required

3. **Start creating ASCII art**
   - Upload an image using the file input
   - Adjust resolution with the slider
   - Click "Export to Text" to get plain ASCII

## 💡 Usage

### Converting Images to ASCII

1. **Upload Image**: Click "Upload Image" and select any image file (JPG, PNG, GIF, etc.)
2. **Adjust Resolution**: Use the slider to control ASCII detail level:
   - **1px**: Shows original image (no ASCII conversion)
   - **2-10px**: High detail ASCII (more characters, finer detail)
   - **11-20px**: Lower detail ASCII (fewer characters, broader strokes)
3. **Preview**: View real-time colored ASCII art in the right panel
4. **Export**: Click "Export to Text" to copy plain text ASCII to the textarea

### ASCII Character Mapping

The generator uses brightness-based character mapping:

```
Brightest (250-255): @
Very Bright (240-249): *
Bright (220-239): +
High (200-219): #
Medium-High (180-199): &
Medium (160-179): %
Medium-Low (140-159): _
Low-Medium (120-139): :
Low (100-119): $
Dark (80-99): /
Darker (60-79): -
Very Dark (40-59): X
Darkest (20-39): W
Almost Black (0-19): (space)
```

### Performance Features

- **Auto-scaling**: Images larger than 800x600px are automatically resized
- **Cell Limiting**: Maximum 100,000 cells prevents browser freezing
- **Alpha Threshold**: Transparent pixels (alpha < 128) are treated as spaces
- **Memory Efficient**: Uses ImageData for pixel-level access

## 📁 Project Structure

```
ascii-art-generator/
├── ascii.html              # Main HTML interface
├── ascii.css               # Dark theme styling
├── script.js               # Core ASCII conversion logic
└── README.md               # This file
```

## 🎨 Technical Implementation

### Core Classes

#### `Cell` Class
Represents a single ASCII character with position and color:
```javascript
class Cell {
  constructor(x, y, symbol, color) {
    this.x = x;      // Canvas x position
    this.y = y;      // Canvas y position  
    this.symbol = symbol;  // ASCII character
    this.color = color;    // RGB color string
  }
}
```

#### `AsciiEffect` Class
Handles image processing and ASCII conversion:
- **Pixel Sampling**: Scans image at specified intervals
- **Brightness Calculation**: Averages RGB values for character selection
- **Dual Output**: Generates both colored canvas and plain text versions
- **Memory Management**: Uses private fields for encapsulation

### Image Processing Pipeline

1. **Image Upload** → FileReader converts to Base64 data URL
2. **Canvas Sizing** → Auto-scale to fit max dimensions (800x600)
3. **Pixel Extraction** → getImageData() reads RGBA pixel data
4. **ASCII Mapping** → Brightness analysis converts pixels to characters
5. **Dual Rendering** → 
   - Canvas: Colored ASCII characters
   - Text: Monochrome ASCII grid

### Key Features

#### Smart Resolution Control
```javascript
// Prevents browser freeze with too many cells
const maxCells = 100000;
if ((canvas.width / size) * (canvas.height / size) > maxCells) {
  size = Math.ceil(Math.sqrt((canvas.width * canvas.height) / maxCells));
}
```

#### Alpha Channel Support
```javascript
// Skip transparent pixels
const ALPHA_THRESHOLD = 128;
if (alpha > ALPHA_THRESHOLD) {
  // Process opaque pixels
}
```

## 🎯 Use Cases

- **Digital Art**: Create ASCII versions of photos and artwork
- **Code Comments**: Generate ASCII art for source code headers
- **Terminal Applications**: Create text-based graphics
- **Social Media**: Share ASCII art in text-only environments
- **Retro Aesthetics**: Add vintage computer art to projects
- **Educational**: Learn about image processing and pixel manipulation

## 🔧 Customization

### Adding New ASCII Characters
Modify the `#convertToSymbol()` method in `AsciiEffect`:
```javascript
#convertToSymbol(brightness) {
  if (brightness >= 250) return '█';
  if (brightness >= 200) return '▓';
  if (brightness >= 150) return '▒';
  if (brightness >= 100) return '░';
  return ' ';
}
```

### Adjusting Canvas Size Limits
Change constants in `script.js`:
```javascript
const MAX_WIDTH = 1200;   // Increase max width
const MAX_HEIGHT = 900;   // Increase max height
```

### Modifying Color Schemes
The generator preserves original colors, but you can modify the rendering in `Cell.draw()`:
```javascript
draw(ctx) {
  // Convert to grayscale
  const gray = this.color.replace(/rgb\((\d+),(\d+),(\d+)\)/, (match, r, g, b) => {
    const avg = Math.round((+r + +g + +b) / 3);
    return `rgb(${avg},${avg},${avg})`;
  });
  ctx.fillStyle = gray;
  ctx.fillText(this.symbol, this.x, this.y);
}
```

## 🌐 Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support  
- **Safari**: Full support
- **Edge**: Full support
- **Mobile**: Limited (file upload may vary)

**Requirements**: ES6+ support, HTML5 Canvas, FileReader API

## 🚀 Future Enhancements

- **Save Options**: Download ASCII as PNG or TXT file
- **Batch Processing**: Convert multiple images at once
- **Animation Support**: Convert GIFs to animated ASCII
- **Color Modes**: Grayscale, sepia, and custom color palettes
- **Custom Character Sets**: User-defined ASCII character mappings
- **Social Sharing**: Direct export to social platforms
- **Mobile Optimization**: Touch-friendly controls and mobile upload

## 🐛 Known Limitations

- **Large Images**: May cause slowdowns on older devices
- **Mobile File Access**: Some mobile browsers limit file upload
- **Memory Usage**: Very high resolution settings use significant RAM
- **Font Rendering**: ASCII appearance varies between operating systems

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Transform any image into beautiful ASCII art with real-time preview and export capabilities - no server required!**
