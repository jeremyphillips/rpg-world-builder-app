/**
 * Asset URL helpers — the single place that resolves a storage key to a URL.
 *
 * Local/dev: resolves to a relative path under `/api/uploads/` (no env var needed).
 * CDN:       set `STORAGE_BASE_URL=https://cdn.example.com` — zero other changes required.
 *
 * Always store the *key*, never the full URL. Resolve at render time with `getAssetUrl`.
 */

// Ambient declaration so this file compiles in browser-only tsconfigs (no @types/node).
declare const process: { env: Record<string, string | undefined> } | undefined

const BASE =
  typeof process !== 'undefined' && process.env.STORAGE_BASE_URL
    ? process.env.STORAGE_BASE_URL.replace(/\/$/, '')
    : ''

/**
 * Resolves a storage key to a fully-qualified URL.
 *
 * @example
 * // Store the key
 * await saveCampaign({ imageKey: 'campaigns/abc.jpg' })
 *
 * // Render the image
 * <img src={getAssetUrl(campaign.imageKey)} alt={campaign.name} />
 */
export function getAssetUrl(key: string): string {
  return `${BASE}/api/uploads/${key}`
}
