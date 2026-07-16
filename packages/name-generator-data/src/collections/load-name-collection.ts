import {
  NameGeneratorError,
  nameCollectionSchema,
  SUPPORTED_NAME_COLLECTION_VERSION,
  type NameCollection,
} from '@rpg/contracts/name-generator'

import { COLLECTION_MANIFEST_IDS } from './manifest'
import { importCollectionModule } from './import-map'
import {
  clearNameCollectionCache,
  getCachedNameCollection,
  setCachedNameCollection,
} from './name-collection-cache'

export { clearNameCollectionCache }

export async function loadNameCollection(collectionId: string): Promise<NameCollection> {
  if (!COLLECTION_MANIFEST_IDS.has(collectionId)) {
    throw new NameGeneratorError('unknown-collection', `Unknown name collection "${collectionId}"`)
  }

  const cached = getCachedNameCollection(collectionId)
  if (cached !== undefined) {
    return cached
  }

  let raw: NameCollection
  try {
    raw = await importCollectionModule(collectionId)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to import collection asset'
    throw new NameGeneratorError('invalid-asset', message)
  }

  const parsed = nameCollectionSchema.safeParse(raw)
  if (!parsed.success) {
    throw new NameGeneratorError(
      'invalid-asset',
      `Collection "${collectionId}" failed validation: ${parsed.error.issues[0]?.message ?? 'invalid shape'}`,
    )
  }

  if (parsed.data.version > SUPPORTED_NAME_COLLECTION_VERSION) {
    throw new NameGeneratorError(
      'unsupported-version',
      `Collection "${collectionId}" version ${parsed.data.version} is not supported`,
    )
  }

  if (parsed.data.id !== collectionId) {
    throw new NameGeneratorError(
      'invalid-asset',
      `Collection asset id "${parsed.data.id}" does not match manifest id "${collectionId}"`,
    )
  }

  setCachedNameCollection(parsed.data)
  return parsed.data
}
