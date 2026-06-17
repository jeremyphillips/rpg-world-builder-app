import { z } from 'zod'

// ---------------------------------------------------------------------------
// Skill taxonomy — the SRD 5.2 skills as id -> display label. The map doubles
// as form select options (`value: id`, `label: SKILLS[id]`). Governing-ability
// mapping is deferred to the skillProficiencies content type.
// ---------------------------------------------------------------------------

export const SKILLS = {
  acrobatics: 'Acrobatics',
  'animal-handling': 'Animal Handling',
  arcana: 'Arcana',
  athletics: 'Athletics',
  deception: 'Deception',
  history: 'History',
  insight: 'Insight',
  intimidation: 'Intimidation',
  investigation: 'Investigation',
  medicine: 'Medicine',
  nature: 'Nature',
  perception: 'Perception',
  performance: 'Performance',
  persuasion: 'Persuasion',
  religion: 'Religion',
  'sleight-of-hand': 'Sleight of Hand',
  stealth: 'Stealth',
  survival: 'Survival',
} as const

export type SkillId = keyof typeof SKILLS

export const SKILL_IDS = Object.keys(SKILLS) as [SkillId, ...SkillId[]]

export const skillSchema = z.enum(SKILL_IDS)
