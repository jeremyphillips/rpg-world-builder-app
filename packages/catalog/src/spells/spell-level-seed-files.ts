/**
 * SRD 5.2.1 spell seed JSON paths relative to `data/srd-cc-5.2.1/`.
 * Level 1 is sharded alphabetically when the monolithic file exceeds ~500 lines.
 */
export const SRD_521_SPELL_LEVEL_1_SHARD_FILES = [
  'level-1-a-f.json',
  'level-1-f-i.json',
  'level-1-i-p.json',
  'level-1-r-t.json',
] as const

export const SRD_521_SPELL_LEVEL_SEED_FILES = [
  'level-0.json',
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
