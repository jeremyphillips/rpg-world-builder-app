import type { NameCollection } from '@rpg/contracts/name-generator'

const cache = new Map<string, NameCollection>()

export function getCachedNameCollection(collectionId: string): NameCollection | undefined {
  return cache.get(collectionId)
}

export function setCachedNameCollection(collection: NameCollection): void {
  cache.set(collection.id, collection)
}

export function clearNameCollectionCache(): void {
  cache.clear()
}
