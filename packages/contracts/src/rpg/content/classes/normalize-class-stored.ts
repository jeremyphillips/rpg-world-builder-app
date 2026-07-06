import { isMeaningfulProficiencyChoice, type ProficiencyChoice } from '../lib/proficiency-grant-set'

type PlainObject = Record<string, unknown>

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isPlainObject(value: unknown): value is PlainObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Coerces legacy category arrays and polluted grant buckets into `ProficiencyGrantSet` shape. */
function normalizeGrantBucket(
  value: unknown,
  fallback: { categories: string[]; items: string[] },
): { categories: string[]; items: string[] } {
  if (isStringArray(value)) {
    return { categories: [...value], items: [] }
  }
  if (!isPlainObject(value)) {
    return fallback
  }
  return {
    categories: isStringArray(value.categories) ? [...value.categories] : [],
    items: isStringArray(value.items) ? [...value.items] : [],
  }
}

interface LegacySkillProficiencyInput extends PlainObject {
  choose?: unknown
  from?: unknown
}

function legacySkillChoiceFromProficiencies(skills: unknown): ProficiencyChoice | undefined {
  if (!isPlainObject(skills)) return undefined
  const raw = skills as LegacySkillProficiencyInput
  if (typeof raw.choose !== 'number') return undefined
  const choice: ProficiencyChoice = {
    id: 'class-skills',
    choose: raw.choose,
    from: isStringArray(raw.from) ? [...raw.from] : [],
  }
  return isMeaningfulProficiencyChoice(choice) ? choice : undefined
}

function normalizeSkillsGrantSet(skills: unknown): {
  grantSet: { categories: string[]; items: string[] }
  legacyChoice?: ProficiencyChoice
} {
  const legacyChoice = legacySkillChoiceFromProficiencies(skills)
  if (isStringArray(skills)) {
    return { grantSet: { categories: [], items: [...skills] } }
  }
  return {
    grantSet: normalizeGrantBucket(skills, { categories: [], items: [] }),
    ...(legacyChoice ? { legacyChoice } : {}),
  }
}

function normalizeToolsGrantSet(
  tools: unknown,
): { categories: string[]; items: string[] } | undefined {
  const grantSet = normalizeGrantBucket(tools, { categories: [], items: [] })
  if (grantSet.categories.length === 0 && grantSet.items.length === 0) return undefined
  return grantSet
}

function proficienciesFromRaw(raw: PlainObject): PlainObject {
  const { grantSet: skills, legacyChoice } = normalizeSkillsGrantSet(raw.skills)
  const tools = normalizeToolsGrantSet(raw.tools)

  return {
    savingThrows: isStringArray(raw.savingThrows) ? [...raw.savingThrows] : [],
    armor: normalizeGrantBucket(raw.armor, { categories: [], items: [] }),
    weapons: normalizeGrantBucket(raw.weapons, { categories: [], items: [] }),
    skills,
    ...(tools ? { tools } : {}),
    ...(legacyChoice ? { __legacySkillChoice: legacyChoice } : {}),
  }
}

function mergeLegacySkillChoice(
  characterCreation: unknown,
  legacyChoice: ProficiencyChoice,
): PlainObject | undefined {
  const existing =
    isPlainObject(characterCreation) && isPlainObject(characterCreation.proficiencies)
      ? characterCreation.proficiencies
      : undefined
  const existingChoices =
    isPlainObject(existing?.skills) && Array.isArray(existing.skills.choices)
      ? existing.skills.choices
      : []
  const hasMeaningfulChoice = existingChoices.some(
    (choice) => isPlainObject(choice) && isMeaningfulProficiencyChoice(choice as ProficiencyChoice),
  )
  if (hasMeaningfulChoice) {
    return isPlainObject(characterCreation) ? characterCreation : undefined
  }

  const base = isPlainObject(characterCreation) ? characterCreation : {}
  const proficiencies = isPlainObject(base.proficiencies) ? base.proficiencies : {}

  return {
    ...base,
    proficiencies: {
      ...proficiencies,
      skills: {
        choices: [legacyChoice],
      },
    },
  }
}

/**
 * Coerces pre-refactor class bodies (and deep-merge pollution) into the current
 * stored contract before Zod parse. Read-time only — does not rewrite Mongo.
 */
export function normalizeClassStoredBody(body: PlainObject): PlainObject {
  const rawProficiencies = isPlainObject(body.proficiencies) ? body.proficiencies : {}
  const normalizedProficiencies = proficienciesFromRaw(rawProficiencies)
  const legacyChoice = normalizedProficiencies.__legacySkillChoice as ProficiencyChoice | undefined
  const { __legacySkillChoice: _legacy, ...proficiencies } = normalizedProficiencies

  let characterCreation = body.characterCreation
  if (legacyChoice) {
    characterCreation = mergeLegacySkillChoice(characterCreation, legacyChoice)
  }

  return {
    ...body,
    proficiencies,
    ...(characterCreation !== undefined ? { characterCreation } : {}),
  }
}

/** Normalizes envelope + body for campaign catalog reads. */
export function normalizeClassStored(stored: PlainObject): PlainObject {
  return {
    ...stored,
    ...normalizeClassStoredBody(stored),
  }
}
