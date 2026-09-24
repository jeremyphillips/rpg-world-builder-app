/** Accepted MIME types for standard raster image upload fields and media manager drop targets. */
export const STANDARD_IMAGE_UPLOAD_ACCEPT = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const

/** Default per-file upload byte ceiling — mirrors API `MAX_UPLOAD_BYTES` default (5 MiB). */
export const DEFAULT_UPLOAD_MAX_BYTES = 5_242_880

/** Maximum attachments per content record gallery. */
export const CONTENT_MEDIA_MAX_ATTACHMENTS = 20

/** Absolute platform ceiling for any configured content-media collection. */
export const CONTENT_MEDIA_MAX_ATTACHMENTS_CEILING = CONTENT_MEDIA_MAX_ATTACHMENTS

/** Maximum concurrent in-flight uploads per client session. */
export const CONTENT_MEDIA_MAX_UPLOADS_IN_FLIGHT = 3

/** Minimum decoded Portrait crop edge length in oriented pixels. */
export const CONTENT_MEDIA_PORTRAIT_MIN_EDGE_PX = 128

/** Maximum decoded pixel count (width × height) for raster inspection. */
export const CONTENT_MEDIA_MAX_PIXEL_COUNT = 25_000_000

/** Maximum decoded edge length in oriented pixels. */
export const CONTENT_MEDIA_MAX_EDGE_PX = 8192

/** Unreferenced upload lease duration before garbage collection (milliseconds). */
export const CONTENT_MEDIA_UPLOAD_LEASE_MS = 24 * 60 * 60 * 1000

/** Rounding tolerance when validating square Portrait crops against source pixels. */
export const CONTENT_MEDIA_PORTRAIT_SQUARE_TOLERANCE_PX = 1

/** Minimum decoded Banner crop width in oriented pixels. */
export const CONTENT_MEDIA_BANNER_MIN_WIDTH_PX = 1200

/** Minimum decoded Banner crop height in oriented pixels. */
export const CONTENT_MEDIA_BANNER_MIN_HEIGHT_PX = 400

/** Banner crop width-to-height ratio. */
export const CONTENT_MEDIA_BANNER_ASPECT_RATIO = 3

/** Rounding tolerance when validating Banner 3:1 crops against source pixels. */
export const CONTENT_MEDIA_BANNER_ASPECT_TOLERANCE_PX = 1

/** Minimum decoded Primary crop short edge in oriented pixels. */
export const CONTENT_MEDIA_PRIMARY_MIN_SHORT_SIDE_PX = 256

/** Minimum decoded source edge for Emblem eligibility in oriented pixels. */
export const CONTENT_MEDIA_EMBLEM_MIN_EDGE_PX = 128

/** Emblem contain layout: minimum scale multiplier (0.25–1). */
export const CONTENT_MEDIA_EMBLEM_SCALE_MIN = 0.25
