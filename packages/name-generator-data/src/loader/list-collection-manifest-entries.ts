import type { NameCollectionManifestEntry } from '@rpg/contracts/name-generator'

import { COLLECTION_MANIFEST_ENTRIES } from '../collections/manifest'

export function listCollectionManifestEntries(): readonly NameCollectionManifestEntry[] {
  return COLLECTION_MANIFEST_ENTRIES
}
