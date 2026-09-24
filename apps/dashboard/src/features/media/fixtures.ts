import { createUploadRoleAssignment, type ContentMedia, type MediaAsset } from '@rpg/contracts'

export const mediaFixtureAssets: MediaAsset[] = [
  {
    id: 'media-demo-portrait',
    filename: 'Seraphina Vale — portrait.jpg',
    mimeType: 'image/jpeg',
    byteSize: 1840000,
    orientedWidth: 1600,
    orientedHeight: 2400,
    contentHash: 'demo-portrait',
    animated: false,
    lifecycle: 'ready',
    createdAt: '2026-09-22T12:00:00.000Z',
  },
  {
    id: 'media-demo-artwork',
    filename: 'Seraphina Vale — mountain expedition.jpg',
    mimeType: 'image/jpeg',
    byteSize: 2400000,
    orientedWidth: 2400,
    orientedHeight: 1600,
    contentHash: 'demo-artwork',
    animated: false,
    lifecycle: 'ready',
    createdAt: '2026-09-22T12:00:00.000Z',
  },
]
export const mediaFixture: ContentMedia = {
  revision: 4,
  images: mediaFixtureAssets.map((asset, index) => ({
    id: `image-${index}`,
    assetId: asset.id,
    alt: 'An adventurer in the mountains',
  })),
  roles: {
    portrait: createUploadRoleAssignment('image-0'),
    primary: createUploadRoleAssignment('image-1'),
  },
}

/** Local, offline source-coordinate fixture for visual crop verification. */
export function mediaFixtureImageUrl(assetId: string) {
  const asset = mediaFixtureAssets.find((item) => item.id === assetId) ?? mediaFixtureAssets[0]!
  const { orientedWidth: width, orientedHeight: height } = asset
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#284455"/><stop offset="1" stop-color="#b3c6ba"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#sky)"/><circle cx="${width * 0.72}" cy="${height * 0.24}" r="${width * 0.09}" fill="#efe2ad"/><path d="M0 ${height * 0.8} L${width * 0.25} ${height * 0.32} L${width * 0.6} ${height * 0.85} L${width * 0.8} ${height * 0.5} L${width} ${height * 0.8} V${height} H0" fill="#304a43"/><path d="M${width * 0.38} ${height} L${width * 0.45} ${height * 0.48} Q${width * 0.5} ${height * 0.4} ${width * 0.55} ${height * 0.48} L${width * 0.68} ${height}" fill="#202f3d"/><circle cx="${width * 0.5}" cy="${height * 0.38}" r="${width * 0.06}" fill="#c9a989"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
