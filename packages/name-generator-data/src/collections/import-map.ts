import type { NameCollection } from '@rpg/contracts/name-generator'

type CollectionLoader = () => Promise<Record<string, NameCollection>>

export const COLLECTION_IMPORT_MAP: Record<string, CollectionLoader> = {
  'elvish-given-pool': () => import('./elvish-given-pool'),
  'elvish-family-pool': () => import('./elvish-family-pool'),
  'elvish-place-root-pool': () => import('./elvish-place-root-pool'),
  'elvish-place-suffix-pool': () => import('./elvish-place-suffix-pool'),
  'draconic-personal-pool': () => import('./draconic-personal-pool'),
  'draconic-clan-pool': () => import('./draconic-clan-pool'),
  'dwarven-settlement-pool': () => import('./dwarven-settlement-pool'),
  'faction-descriptor-pool': () => import('./faction-descriptor-pool'),
  'faction-org-type-pool': () => import('./faction-org-type-pool'),
  'akan-given-pool': () => import('./akan-given-pool'),
  'akan-family-pool': () => import('./akan-family-pool'),
}

const COLLECTION_EXPORT_BY_ID: Record<string, string> = {
  'elvish-given-pool': 'elvishGivenPoolCollection',
  'elvish-family-pool': 'elvishFamilyPoolCollection',
  'elvish-place-root-pool': 'elvishPlaceRootPoolCollection',
  'elvish-place-suffix-pool': 'elvishPlaceSuffixPoolCollection',
  'draconic-personal-pool': 'draconicPersonalPoolCollection',
  'draconic-clan-pool': 'draconicClanPoolCollection',
  'dwarven-settlement-pool': 'dwarvenSettlementPoolCollection',
  'faction-descriptor-pool': 'factionDescriptorPoolCollection',
  'faction-org-type-pool': 'factionOrgTypePoolCollection',
  'akan-given-pool': 'akanGivenPoolCollection',
  'akan-family-pool': 'akanFamilyPoolCollection',
}

export async function importCollectionModule(collectionId: string): Promise<NameCollection> {
  const loader = COLLECTION_IMPORT_MAP[collectionId]
  if (loader === undefined) {
    throw new Error(`No import map entry for collection "${collectionId}"`)
  }

  const module = await loader()
  const exportName = COLLECTION_EXPORT_BY_ID[collectionId]
  const collection = module[exportName ?? '']
  if (collection === undefined) {
    throw new Error(`Collection export "${exportName}" missing for "${collectionId}"`)
  }

  return collection
}
