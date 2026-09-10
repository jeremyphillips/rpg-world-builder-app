import type { NameCollection } from '@rpg/contracts/name-generator'

type CollectionLoader = () => Promise<Record<string, NameCollection>>

/** Trusted allowlist — only ids listed here can be dynamically imported. */
export const COLLECTION_IMPORT_MAP: Record<string, CollectionLoader> = {
  'elvish-given-pool': () => import('./elvish-given-pool'),
  'elvish-family-pool': () => import('./elvish-family-pool'),
  'elvish-place-root-pool': () => import('./elvish-place-root-pool'),
  'elvish-place-suffix-pool': () => import('./elvish-place-suffix-pool'),
  'elvish-landmark-suffix-pool': () => import('./elvish-landmark-suffix-pool'),
  'elvish-org-type-pool': () => import('./elvish-org-type-pool'),
  'elvish-high-given-pool': () => import('./elvish-high-given-pool'),
  'elvish-wood-given-pool': () => import('./elvish-wood-given-pool'),
  'elvish-drow-given-pool': () => import('./elvish-drow-given-pool'),
  'dwarven-given-pool': () => import('./dwarven-given-pool'),
  'dwarven-clan-pool': () => import('./dwarven-clan-pool'),
  'dwarven-place-root-pool': () => import('./dwarven-place-root-pool'),
  'dwarven-place-suffix-pool': () => import('./dwarven-place-suffix-pool'),
  'dwarven-landmark-suffix-pool': () => import('./dwarven-landmark-suffix-pool'),
  'dwarven-org-type-pool': () => import('./dwarven-org-type-pool'),
  'halfling-given-pool': () => import('./halfling-given-pool'),
  'halfling-family-pool': () => import('./halfling-family-pool'),
  'halfling-place-root-pool': () => import('./halfling-place-root-pool'),
  'halfling-place-suffix-pool': () => import('./halfling-place-suffix-pool'),
  'halfling-landmark-suffix-pool': () => import('./halfling-landmark-suffix-pool'),
  'gnomish-given-pool': () => import('./gnomish-given-pool'),
  'gnomish-family-pool': () => import('./gnomish-family-pool'),
  'gnomish-place-root-pool': () => import('./gnomish-place-root-pool'),
  'gnomish-place-suffix-pool': () => import('./gnomish-place-suffix-pool'),
  'gnomish-landmark-suffix-pool': () => import('./gnomish-landmark-suffix-pool'),
  'human-given-pool': () => import('./human-given-pool'),
  'human-family-pool': () => import('./human-family-pool'),
  'human-place-root-pool': () => import('./human-place-root-pool'),
  'human-place-suffix-pool': () => import('./human-place-suffix-pool'),
  'human-landmark-suffix-pool': () => import('./human-landmark-suffix-pool'),
  'orc-given-pool': () => import('./orc-given-pool'),
  'orc-place-root-pool': () => import('./orc-place-root-pool'),
  'orc-place-suffix-pool': () => import('./orc-place-suffix-pool'),
  'orc-landmark-suffix-pool': () => import('./orc-landmark-suffix-pool'),
  'infernal-tiefling-given-pool': () => import('./infernal-tiefling-given-pool'),
  'infernal-tiefling-virtue-pool': () => import('./infernal-tiefling-virtue-pool'),
  'infernal-tiefling-place-root-pool': () => import('./infernal-tiefling-place-root-pool'),
  'infernal-tiefling-place-suffix-pool': () => import('./infernal-tiefling-place-suffix-pool'),
  'infernal-tiefling-landmark-suffix-pool': () =>
    import('./infernal-tiefling-landmark-suffix-pool'),
  'abyssal-tiefling-given-pool': () => import('./abyssal-tiefling-given-pool'),
  'chthonic-tiefling-given-pool': () => import('./chthonic-tiefling-given-pool'),
  'draconic-dragon-given-pool': () => import('./draconic-dragon-given-pool'),
  'draconic-dragonborn-given-pool': () => import('./draconic-dragonborn-given-pool'),
  'draconic-dragonborn-clan-pool': () => import('./draconic-dragonborn-clan-pool'),
  'draconic-dragonborn-place-root-pool': () => import('./draconic-dragonborn-place-root-pool'),
  'draconic-dragonborn-place-suffix-pool': () => import('./draconic-dragonborn-place-suffix-pool'),
  'draconic-dragonborn-landmark-suffix-pool': () =>
    import('./draconic-dragonborn-landmark-suffix-pool'),
  'draconic-metallic-given-pool': () => import('./draconic-metallic-given-pool'),
  'draconic-chromatic-given-pool': () => import('./draconic-chromatic-given-pool'),
  'goliath-given-pool': () => import('./goliath-given-pool'),
  'goliath-epithet-pool': () => import('./goliath-epithet-pool'),
  'goliath-clan-pool': () => import('./goliath-clan-pool'),
  'goliath-place-root-pool': () => import('./goliath-place-root-pool'),
  'goliath-place-suffix-pool': () => import('./goliath-place-suffix-pool'),
  'goliath-landmark-suffix-pool': () => import('./goliath-landmark-suffix-pool'),
  'akan-given-pool': () => import('./akan-given-pool'),
  'akan-family-pool': () => import('./akan-family-pool'),
  'faction-descriptor-pool': () => import('./faction-descriptor-pool'),
  'faction-emblem-pool': () => import('./faction-emblem-pool'),
  'faction-org-type-pool': () => import('./faction-org-type-pool'),
}

/** Collection assets export `<camelCaseId>Collection` — derived rather than re-listed. */
function toExportName(collectionId: string): string {
  return `${collectionId.replace(/-([a-z0-9])/g, (_, character: string) => character.toUpperCase())}Collection`
}

export async function importCollectionModule(collectionId: string): Promise<NameCollection> {
  const loader = COLLECTION_IMPORT_MAP[collectionId]
  if (loader === undefined) {
    throw new Error(`No import map entry for collection "${collectionId}"`)
  }

  const module = await loader()
  const exportName = toExportName(collectionId)
  const collection = module[exportName]
  if (collection === undefined) {
    throw new Error(`Collection export "${exportName}" missing for "${collectionId}"`)
  }

  return collection
}
