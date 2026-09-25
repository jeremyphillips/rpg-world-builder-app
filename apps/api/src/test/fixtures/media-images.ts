import sharp from 'sharp'

/** 1×1 PNG suitable for upload integration tests. */
export const MINIMAL_PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

export async function createTestImageBuffer(
  format: 'jpeg' | 'png' | 'webp' | 'gif',
  size = 64,
): Promise<Buffer> {
  const image = sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: { r: 120, g: 80, b: 40 },
    },
  })

  switch (format) {
    case 'jpeg':
      return image.jpeg().toBuffer()
    case 'png':
      return image.png().toBuffer()
    case 'webp':
      return image.webp().toBuffer()
    case 'gif':
      return image.gif().toBuffer()
  }
}

export const SVG_BUFFER = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="red"/></svg>',
)

export const CORRUPT_IMAGE_BUFFER = Buffer.from('not-an-image-file')
