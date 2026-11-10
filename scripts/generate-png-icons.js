import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const favDir = path.resolve(__dirname, '../public/favicon')

function createPNG(size) {
  // Simple PNG encoder in pure Node
  const width = size
  const height = size
  const buffer = Buffer.alloc(height * (width * 4 + 1))

  const cx = width / 2
  const cy = height / 2
  const rOuter = width * 0.44

  let offset = 0
  for (let y = 0; y < height; y++) {
    buffer[offset++] = 0 // Filter type: None
    for (let x = 0; x < width; x++) {
      const dx = x - cx
      const dy = y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)

      // Squircle distance check
      const nx = Math.abs(dx) / (width * 0.46)
      const ny = Math.abs(dy) / (height * 0.46)
      const squircleDist = Math.pow(nx, 4) + Math.pow(ny, 4)

      let r = 8, g = 8, b = 12, a = 255

      if (squircleDist > 1.05) {
        // Outside squircle
        r = 0; g = 0; b = 0; a = 0
      } else if (squircleDist > 0.95) {
        // Border
        r = 50; g = 50; b = 65; a = 255
      } else {
        // Inside
        r = 10; g = 10; b = 15; a = 255

        // Outer ring dotted
        const ringDist = Math.abs(dist - rOuter * 0.85)
        const angle = Math.atan2(dy, dx)
        if (ringDist < width * 0.04) {
          if (angle > -1.2 && angle < -0.2) {
            // Nothing red arc
            r = 215; g = 25; b = 33; a = 255
          } else if (Math.sin(angle * 12) > 0.2) {
            r = 70; g = 70; b = 90; a = 220
          }
        }

        // V shape dots
        const checkDot = (px, py, dotR, col) => {
          const ddx = x - (cx + px * width)
          const ddy = y - (cy + py * height)
          if (Math.sqrt(ddx * ddx + ddy * ddy) <= dotR * width) {
            r = col[0]; g = col[1]; b = col[2]; a = 255
          }
        }

        const dotR = 0.045
        // V shape
        checkDot(-0.18, -0.16, dotR, [240, 240, 250])
        checkDot(-0.12, -0.05, dotR, [240, 240, 250])
        checkDot(-0.06, 0.06, dotR, [240, 240, 250])
        checkDot(0.18, -0.16, dotR, [240, 240, 250])
        checkDot(0.12, -0.05, dotR, [240, 240, 250])
        checkDot(0.06, 0.06, dotR, [240, 240, 250])
        // Vertex (Nothing Red)
        checkDot(0, 0.18, 0.055, [215, 25, 33])
        // Cyan Caelestia dot
        checkDot(0, -0.08, 0.035, [0, 242, 254])
      }

      buffer[offset++] = r
      buffer[offset++] = g
      buffer[offset++] = b
      buffer[offset++] = a
    }
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR chunk
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(width, 0)
  ihdrData.writeUInt32BE(height, 4)
  ihdrData.writeUInt8(8, 8) // Bit depth
  ihdrData.writeUInt8(6, 9) // Color type RGBA
  ihdrData.writeUInt8(0, 10) // Compression
  ihdrData.writeUInt8(0, 11) // Filter
  ihdrData.writeUInt8(0, 12) // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData)

  // IDAT chunk
  const compressed = zlib.deflateSync(buffer)
  const idatChunk = makeChunk('IDAT', compressed)

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0))

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk])
}

function crc32(buf) {
  let crc = -1
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff]
  }
  return (crc ^ (-1)) >>> 0
}

const table = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let k = 0; k < 8; k++) {
    c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1))
  }
  table[i] = c
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const toCrc = Buffer.concat([typeBuf, data])
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(toCrc), 0)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

[16, 32, 48, 128].forEach(size => {
  const png = createPNG(size)
  fs.writeFileSync(path.join(favDir, `icon-${size}.png`), png)
  console.log(`✓ Generated icon-${size}.png`)
})

