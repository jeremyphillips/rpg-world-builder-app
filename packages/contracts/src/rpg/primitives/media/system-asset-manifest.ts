import { z } from 'zod'

/** Public catalog art served from `/assets/system/...` — not private asset rows. */
export const systemAssetManifestEntrySchema = z
  .object({
    path: z.string().min(1),
    orientedWidth: z.number().int().positive(),
    orientedHeight: z.number().int().positive(),
    alt: z.string().optional(),
  })
  .strict()

export type SystemAssetManifestEntry = z.infer<typeof systemAssetManifestEntrySchema>

/** v1 seed entries referenced by tests and resolver fixtures. */
export const SYSTEM_ASSET_MANIFEST: Readonly<Record<string, SystemAssetManifestEntry>> = {
  '/assets/system/species/elf.webp': {
    path: '/assets/system/species/elf.webp',
    orientedWidth: 512,
    orientedHeight: 512,
    alt: 'Elf silhouette',
  },
  '/assets/system/class/fighter.webp': {
    path: '/assets/system/class/fighter.webp',
    orientedWidth: 640,
    orientedHeight: 480,
    alt: 'Fighter emblem',
  },
}

export function getSystemAssetManifestEntry(path: string): SystemAssetManifestEntry | undefined {
  return SYSTEM_ASSET_MANIFEST[path]
}

export function listSystemAssetManifestEntries(): readonly SystemAssetManifestEntry[] {
  return Object.values(SYSTEM_ASSET_MANIFEST)
}
