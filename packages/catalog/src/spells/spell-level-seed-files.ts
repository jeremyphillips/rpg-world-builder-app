/**
 * SRD 5.2.1 spell seed JSON paths relative to `data/srd-cc-5.2.1/`.
 * Levels 0 and 1 are sharded alphabetically when monolithic files exceed ~500 lines.
 */
export const SRD_521_SPELL_LEVEL_0_SHARD_FILES = [
  'level-0-a-f.json',
  'level-0-g-m.json',
  'level-0-p-t.json',
] as const

export const SRD_521_SPELL_LEVEL_1_SHARD_FILES = [
  'level-1-a-f.json',
  'level-1-f-i.json',
  'level-1-i-p.json',
  'level-1-r-t.json',
] as const

export const SRD_521_SPELL_LEVEL_SEED_FILES = [
  ...SRD_521_SPELL_LEVEL_0_SHARD_FILES,
  ...SRD_521_SPELL_LEVEL_1_SHARD_FILES,
  'level-2.json',
  'level-3.json',
  'level-4.json',
  'level-5.json',
  'level-6.json',
  'level-7.json',
  'level-8.json',
  'level-9.json',
] as const

export type Srd521SpellLevelSeedFile = (typeof SRD_521_SPELL_LEVEL_SEED_FILES)[number]
