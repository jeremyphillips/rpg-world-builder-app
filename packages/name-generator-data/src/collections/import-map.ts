import type { NameCollection } from '@rpg/contracts/name-generator'

type CollectionLoader = () => Promise<Record<string, NameCollection>>

export const COLLECTION_IMPORT_MAP: Record<string, CollectionLoader> = {
  'elvish-given-pool': () => import('./elvish-given-pool'),
  'elvish-family-pool': () => import('./elvish-family-pool'),
  'elvish-place-root-pool': () => import('./elvish-place-root-pool'),
  'elvish-place-suffix-pool': () => import('./elvish-place-suffix-pool'),
  'draconic-dragon-given-pool': () => import('./draconic-dragon-given-pool'),
  'draconic-dragonborn-given-pool': () => import('./draconic-dragonborn-given-pool'),
  'draconic-dragonborn-clan-pool': () => import('./draconic-dragonborn-clan-pool'),
  'dwarven-given-pool': () => import('./dwarven-given-pool'),
  'dwarven-clan-pool': () => import('./dwarven-clan-pool'),
  'dwarven-settlement-pool': () => import('./dwarven-settlement-pool'),
  'halfling-given-pool': () => import('./halfling-given-pool'),
  'halfling-family-pool': () => import('./halfling-family-pool'),
  'halfling-place-root-pool': () => import('./halfling-place-root-pool'),
  'halfling-place-suffix-pool': () => import('./halfling-place-suffix-pool'),
  'infernal-tiefling-given-pool': () => import('./infernal-tiefling-given-pool'),
  'infernal-tiefling-virtue-pool': () => import('./infernal-tiefling-virtue-pool'),
  'gnomish-given-pool': () => import('./gnomish-given-pool'),
  'gnomish-family-pool': () => import('./gnomish-family-pool'),
  'gnomish-place-root-pool': () => import('./gnomish-place-root-pool'),
  'gnomish-place-suffix-pool': () => import('./gnomish-place-suffix-pool'),
  'goliath-given-pool': () => import('./goliath-given-pool'),
  'goliath-epithet-pool': () => import('./goliath-epithet-pool'),
  'goliath-clan-pool': () => import('./goliath-clan-pool'),
  'human-given-pool': () => import('./human-given-pool'),
  'human-family-pool': () => import('./human-family-pool'),
  'orc-given-pool': () => import('./orc-given-pool'),
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
  'draconic-dragon-given-pool': 'draconicDragonGivenPoolCollection',
  'draconic-dragonborn-given-pool': 'draconicDragonbornGivenPoolCollection',
  'draconic-dragonborn-clan-pool': 'draconicDragonbornClanPoolCollection',
  'dwarven-given-pool': 'dwarvenGivenPoolCollection',
  'dwarven-clan-pool': 'dwarvenClanPoolCollection',
  'dwarven-settlement-pool': 'dwarvenSettlementPoolCollection',
  'halfling-given-pool': 'halflingGivenPoolCollection',
  'halfling-family-pool': 'halflingFamilyPoolCollection',
  'halfling-place-root-pool': 'halflingPlaceRootPoolCollection',
  'halfling-place-suffix-pool': 'halflingPlaceSuffixPoolCollection',
  'infernal-tiefling-given-pool': 'infernalTieflingGivenPoolCollection',
  'infernal-tiefling-virtue-pool': 'infernalTieflingVirtuePoolCollection',
  'gnomish-given-pool': 'gnomishGivenPoolCollection',
  'gnomish-family-pool': 'gnomishFamilyPoolCollection',
  'gnomish-place-root-pool': 'gnomishPlaceRootPoolCollection',
  'gnomish-place-suffix-pool': 'gnomishPlaceSuffixPoolCollection',
  'goliath-given-pool': 'goliathGivenPoolCollection',
  'goliath-epithet-pool': 'goliathEpithetPoolCollection',
  'goliath-clan-pool': 'goliathClanPoolCollection',
  'human-given-pool': 'humanGivenPoolCollection',
  'human-family-pool': 'humanFamilyPoolCollection',
  'orc-given-pool': 'orcGivenPoolCollection',
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
