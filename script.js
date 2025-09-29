'use strict'

/**
 * ASCII renderer for images on a canvas + plain text export.
 * - Upload converts image to Base64 data URL (no server required).
 * - Same scan logic powers both canvas draw and text export.
 */

/** DOM refs */
const canvas = document.getElementById('canvas1')
const ctx = canvas.getContext('2d')
const image1 = new Image()

const inputSlider = document.getElementById('resolution')
const inputLabel = document.getElementById('resolutionLabel')

const uploadInput = document.getElementById('upload')
const textBtn = document.getElementById('textBtn')
const asciiOutput = document.getElementById('asciiOutput')

/** Constants */
const ALPHA_THRESHOLD = 128

/** Wire up slider */
inputSlider.addEventListener('input', handleSlider)

/**
 * A single ASCII “cell” (character + draw color).
 */
class Cell {
  /**
   * @param {number} x      - x position (px)
   * @param {number} y      - y position (px)
   * @param {string} symbol - character to draw
   * @param {string} color  - CSS color (e.g. "rgb(r,g,b)")
   */
  constructor(x, y, symbol, color) {
    this.x = x
    this.y = y
    this.symbol = symbol
    this.color = color
  }
  /**
   * Draw this cell’s symbol to the canvas context.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    ctx.fillStyle = this.color
    ctx.fillText(this.symbol, this.x, this.y)
  }
}

/**
 * Converts canvas image pixels to ASCII characters.
 * Uses same scan for canvas rendering and text export.
 */
class AsciiEffect {
  #cells = [];           // Cell[] for canvas draw
  #grid = [];            // string[] for text export (one string per row)
  #pixels = null;        // ImageData
  #ctx; #width; #height

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} width
   * @param {number} height
   */
  constructor(ctx, width, height) {
    this.#ctx = ctx
    this.#width = width
    this.#height = height

    // Paint current image to canvas, then read pixels.
    this.#ctx.drawImage(image1, 0, 0, this.#width, this.#height)
    this.#pixels = this.#ctx.getImageData(0, 0, this.#width, this.#height)
  }

  /**
   * Map grayscale brightness to ASCII symbol.
   * @param {number} g - average 0..255
   * @returns {string} ASCII character or empty string
   */
  #convertToSymbol(g) {
    if (g >= 250) return '@'
    else if (g >= 240) return '*'
    else if (g >= 220) return '+'
    else if (g >= 200) return '#'
    else if (g >= 180) return '&'
    else if (g >= 160) return '%'
    else if (g >= 140) return '_'
    else if (g >= 120) return ':'
    else if (g >= 100) return '$'
    else if (g >= 80) return '/'
    else if (g >= 60) return '-'
    else if (g >= 40) return 'X'
    else if (g >= 20) return 'W'
    return '' // very dark -> treat as empty
  }

  /**
   * Scan pixels into both:
   * - #cells: for colored canvas draw
   * - #grid : for plain text export (monochrome)
   * @param {number} cellSize - sampling step in pixels
   */
  #compute(cellSize) {
    this.#cells = []
    this.#grid = []

    const w = this.#pixels.width
    const h = this.#pixels.height
    const data = this.#pixels.data

    // Build one text row per y-step
    for (let y = 0; y < h; y += cellSize) {
      let row = ''

      for (let x = 0; x < w; x += cellSize) {
        const pos = (y * w + x) * 4
        const a = data[pos + 3]

        if (a > ALPHA_THRESHOLD) {
          const r = data[pos]
          const g = data[pos + 1]
          const b = data[pos + 2]

          const avg = (r + g + b) / 3
          const symbol = this.#convertToSymbol(avg)

          // For canvas draw: only push if we have a symbol
          if (symbol) {
            const color = `rgb(${r},${g},${b})`
            this.#cells.push(new Cell(x, y, symbol, color))
            row += symbol      // text version
          } else {
            row += ' '
          }
        } else {
          row += ' '
        }
      }
      this.#grid.push(row)
    }
  }

  /**
   * Draw ASCII to canvas.
   * @param {number} cellSize - sampling step in pixels
   */
  draw(cellSize) {
    this.#compute(cellSize)                 // keep draw + text in sync
    this.#ctx.clearRect(0, 0, this.#width, this.#height)
    for (let i = 0; i < this.#cells.length; i++) {
      this.#cells[i].draw(this.#ctx)
    }
  }

  /**
   * Return ASCII art as plain text (no color).
   * @param {number} cellSize - sampling step in pixels
   * @returns {string} ASCII lines separated by '\n'
   */
  toText(cellSize) {
    this.#compute(cellSize)                 // reuse the exact same scan
    return this.#grid.join('\n')
  }
}

/** Global effect instance (recreated on each new image load) */
let effect = null

/**
 * Slider handler: render at current resolution.
 * - 1 -> draw original image (no ASCII)
 * - >=2 -> draw ASCII at chosen cell size
 */
function handleSlider() {
  let size = Number(inputSlider.value)

  // safety: if too many cells, auto-adjust
  const maxCells = 100000
  if ((canvas.width / size) * (canvas.height / size) > maxCells) {
    size = Math.ceil(Math.sqrt((canvas.width * canvas.height) / maxCells))
    inputSlider.value = size
  }

  if (size === 1) {
    inputLabel.textContent = 'Original image'
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(image1, 0, 0, canvas.width, canvas.height)
  } else {
    inputLabel.textContent = `Resolution: ${size} px`
    ctx.font = `${Math.max(6, Math.round(size * 1.6))}px monospace`
    ctx.textBaseline = 'top'
    effect.draw(size)
  }
}

/** Upload -> Base64 -> set as image src */
uploadInput.addEventListener('change', (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    image1.src = event.target.result // Base64 data URL
  }
  reader.readAsDataURL(file)
})

/** Dump ASCII to textarea (monospace + whitespace preserved via CSS) */
textBtn.addEventListener('click', () => {
  const size = Number(inputSlider.value)
  if (!effect) return
  asciiOutput.value = effect.toText(size)
})

// Image
const MAX_WIDTH = 800
const MAX_HEIGHT = 600
/** Each time an image is set/loaded, resize canvas and rebuild effect */
const previewImg = document.getElementById('previewImg')
const previewPlaceholder = document.getElementById('previewPlaceholder')

image1.onload = function initialize() {
  let w = image1.width
  let h = image1.height

  // scale down if too big
  const ratio = Math.min(MAX_WIDTH / w, MAX_HEIGHT / h, 1)
  w = Math.round(w * ratio)
  h = Math.round(h * ratio)

  canvas.width = w
  canvas.height = h

  // show preview
  previewPlaceholder.style.display = 'none'
  previewImg.style.display = 'block'
  previewImg.src = image1.src

  effect = new AsciiEffect(ctx, w, h)
  handleSlider()
}