import type { NamingConvention, NameCollection } from '@rpg/contracts/name-generator'
import { loadNameCollection } from '@rpg/name-generator-data'

export type LoadNameCollectionFn = (collectionId: string) => Promise<NameCollection>

export async function loadConventionCollections(
  conventions: readonly NamingConvention[],
  loadCollection: LoadNameCollectionFn = loadNameCollection,
): Promise<Map<string, NameCollection>> {
  const collectionIds = new Set<string>()
  for (const convention of conventions) {
    for (const collectionId of convention.collectionIds) {
      collectionIds.add(collectionId)
    }
  }

  const entries = await Promise.all(
    [...collectionIds].map(async (collectionId) => {
      const collection = await loadCollection(collectionId)
      return [collectionId, collection] as const
    }),
  )

  return new Map(entries)
}
