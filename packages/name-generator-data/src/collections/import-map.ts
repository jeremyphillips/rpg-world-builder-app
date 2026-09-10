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
  'halfling-org-type-pool': () => import('./halfling-org-type-pool'),
  'gnomish-given-pool': () => import('./gnomish-given-pool'),
  'gnomish-family-pool': () => import('./gnomish-family-pool'),
  'gnomish-place-root-pool': () => import('./gnomish-place-root-pool'),
  'gnomish-place-suffix-pool': () => import('./gnomish-place-suffix-pool'),
  'gnomish-landmark-suffix-pool': () => import('./gnomish-landmark-suffix-pool'),
  'gnomish-org-type-pool': () => import('./gnomish-org-type-pool'),
  'human-given-pool': () => import('./human-given-pool'),
  'human-family-pool': () => import('./human-family-pool'),
  'human-place-root-pool': () => import('./human-place-root-pool'),
  'human-place-suffix-pool': () => import('./human-place-suffix-pool'),
  'human-landmark-suffix-pool': () => import('./human-landmark-suffix-pool'),
  'human-org-type-pool': () => import('./human-org-type-pool'),
  'orc-given-pool': () => import('./orc-given-pool'),
  'orc-clan-pool': () => import('./orc-clan-pool'),
  'orc-place-root-pool': () => import('./orc-place-root-pool'),
  'orc-place-suffix-pool': () => import('./orc-place-suffix-pool'),
  'orc-landmark-suffix-pool': () => import('./orc-landmark-suffix-pool'),
  'orc-org-type-pool': () => import('./orc-org-type-pool'),
  'infernal-tiefling-given-pool': () => import('./infernal-tiefling-given-pool'),
  'infernal-tiefling-virtue-pool': () => import('./infernal-tiefling-virtue-pool'),
  'infernal-tiefling-place-root-pool': () => import('./infernal-tiefling-place-root-pool'),
  'infernal-tiefling-place-suffix-pool': () => import('./infernal-tiefling-place-suffix-pool'),
  'infernal-tiefling-landmark-suffix-pool': () =>
    import('./infernal-tiefling-landmark-suffix-pool'),
  'infernal-tiefling-org-type-pool': () => import('./infernal-tiefling-org-type-pool'),
  'abyssal-tiefling-given-pool': () => import('./abyssal-tiefling-given-pool'),
  'chthonic-tiefling-given-pool': () => import('./chthonic-tiefling-given-pool'),
  'draconic-dragon-given-pool': () => import('./draconic-dragon-given-pool'),
  'draconic-dragonborn-given-pool': () => import('./draconic-dragonborn-given-pool'),
  'draconic-dragonborn-clan-pool': () => import('./draconic-dragonborn-clan-pool'),
  'draconic-dragonborn-place-root-pool': () => import('./draconic-dragonborn-place-root-pool'),
  'draconic-dragonborn-place-suffix-pool': () => import('./draconic-dragonborn-place-suffix-pool'),
  'draconic-dragonborn-landmark-suffix-pool': () =>
    import('./draconic-dragonborn-landmark-suffix-pool'),
  'draconic-dragonborn-org-type-pool': () => import('./draconic-dragonborn-org-type-pool'),
  'draconic-metallic-given-pool': () => import('./draconic-metallic-given-pool'),
  'draconic-chromatic-given-pool': () => import('./draconic-chromatic-given-pool'),
  'goliath-given-pool': () => import('./goliath-given-pool'),
  'goliath-epithet-pool': () => import('./goliath-epithet-pool'),
  'goliath-clan-pool': () => import('./goliath-clan-pool'),
  'goliath-place-root-pool': () => import('./goliath-place-root-pool'),
  'goliath-place-suffix-pool': () => import('./goliath-place-suffix-pool'),
  'goliath-landmark-suffix-pool': () => import('./goliath-landmark-suffix-pool'),
  'goliath-org-type-pool': () => import('./goliath-org-type-pool'),
  'akan-given-pool': () => import('./akan-given-pool'),
  'akan-family-pool': () => import('./akan-family-pool'),
  'norse-given-pool': () => import('./norse-given-pool'),
  'norse-patronym-suffix-pool': () => import('./norse-patronym-suffix-pool'),
  'norse-byname-pool': () => import('./norse-byname-pool'),
  'anglo-saxon-given-pool': () => import('./anglo-saxon-given-pool'),
  'anglo-saxon-byname-pool': () => import('./anglo-saxon-byname-pool'),
  'anglo-saxon-place-root-pool': () => import('./anglo-saxon-place-root-pool'),
  'anglo-saxon-place-suffix-pool': () => import('./anglo-saxon-place-suffix-pool'),
  'anglo-saxon-landmark-suffix-pool': () => import('./anglo-saxon-landmark-suffix-pool'),
  'japanese-family-pool': () => import('./japanese-family-pool'),
  'japanese-given-pool': () => import('./japanese-given-pool'),
  'japanese-place-root-pool': () => import('./japanese-place-root-pool'),
  'japanese-place-suffix-pool': () => import('./japanese-place-suffix-pool'),
  'japanese-landmark-suffix-pool': () => import('./japanese-landmark-suffix-pool'),
  'gaelic-given-pool': () => import('./gaelic-given-pool'),
  'gaelic-patronym-particle-pool': () => import('./gaelic-patronym-particle-pool'),
  'gaelic-family-pool': () => import('./gaelic-family-pool'),
  'gaelic-place-root-pool': () => import('./gaelic-place-root-pool'),
  'gaelic-place-prefix-pool': () => import('./gaelic-place-prefix-pool'),
  'gaelic-landmark-prefix-pool': () => import('./gaelic-landmark-prefix-pool'),
  'slavic-given-pool': () => import('./slavic-given-pool'),
  'slavic-patronym-suffix-pool': () => import('./slavic-patronym-suffix-pool'),
  'slavic-family-root-pool': () => import('./slavic-family-root-pool'),
  'slavic-family-suffix-pool': () => import('./slavic-family-suffix-pool'),
  'slavic-place-root-pool': () => import('./slavic-place-root-pool'),
  'slavic-place-suffix-pool': () => import('./slavic-place-suffix-pool'),
  'slavic-landmark-suffix-pool': () => import('./slavic-landmark-suffix-pool'),
  'han-chinese-family-pool': () => import('./han-chinese-family-pool'),
  'han-chinese-given-pool': () => import('./han-chinese-given-pool'),
  'han-chinese-place-root-pool': () => import('./han-chinese-place-root-pool'),
  'han-chinese-place-suffix-pool': () => import('./han-chinese-place-suffix-pool'),
  'han-chinese-landmark-suffix-pool': () => import('./han-chinese-landmark-suffix-pool'),
  'yoruba-given-pool': () => import('./yoruba-given-pool'),
  'yoruba-family-pool': () => import('./yoruba-family-pool'),
  'yoruba-place-root-pool': () => import('./yoruba-place-root-pool'),
  'yoruba-place-prefix-pool': () => import('./yoruba-place-prefix-pool'),
  'yoruba-landmark-prefix-pool': () => import('./yoruba-landmark-prefix-pool'),
  'roman-praenomen-pool': () => import('./roman-praenomen-pool'),
  'roman-nomen-pool': () => import('./roman-nomen-pool'),
  'roman-cognomen-pool': () => import('./roman-cognomen-pool'),
  'roman-place-root-pool': () => import('./roman-place-root-pool'),
  'roman-place-prefix-pool': () => import('./roman-place-prefix-pool'),
  'roman-landmark-prefix-pool': () => import('./roman-landmark-prefix-pool'),
  'arabic-given-pool': () => import('./arabic-given-pool'),
  'arabic-nasab-particle-pool': () => import('./arabic-nasab-particle-pool'),
  'arabic-nisba-pool': () => import('./arabic-nisba-pool'),
  'arabic-place-root-pool': () => import('./arabic-place-root-pool'),
  'arabic-place-prefix-pool': () => import('./arabic-place-prefix-pool'),
  'arabic-landmark-prefix-pool': () => import('./arabic-landmark-prefix-pool'),
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
