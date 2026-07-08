import { getTermSentenceForm, type GameTermEntry } from './types'

// ---------------------------------------------------------------------------
// Proficiency grant kinds — weapon, tool, skill, and armor training terms
// shared by grant formatters, authoring UI, and character builder surfaces.
// ---------------------------------------------------------------------------

export const PROFICIENCY_DOMAINS = ['weapon', 'tool', 'skill', 'armor'] as const

export type ProficiencyDomain = (typeof PROFICIENCY_DOMAINS)[number]

export const PROFICIENCY_DOMAIN_ENTRIES = {
  weapon: {
    label: 'Weapon Proficiency',
    description: 'Training with specific weapons or weapon categories.',
    sentence: {
      singular: 'weapon proficiency',
      plural: 'weapon proficiencies',
    },
  },
  tool: {
    label: 'Tool Proficiency',
    description: 'Training with specific tools or tool categories.',
    sentence: {
      singular: 'tool proficiency',
      plural: 'tool proficiencies',
    },
  },
  skill: {
    label: 'Skill Proficiency',
    description: 'Training with specific skills.',
    sentence: {
      singular: 'skill proficiency',
      plural: 'skill proficiencies',
    },
  },
  armor: {
    label: 'Armor Training',
    description: 'Training with specific armor pieces or armor categories.',
    sentence: {
      singular: 'armor training',
      plural: 'armor training',
    },
  },
} as const satisfies Record<ProficiencyDomain, GameTermEntry>

export const PROFICIENCY_POOL_ANY_LABELS = {
  weapon: 'any weapon',
  tool: 'any tool',
  skill: 'any skill',
  armor: 'any armor',
} as const satisfies Record<ProficiencyDomain, string>

export const PROFICIENCY_POOL_ANY_SCOPE_PHRASES = {
  tool: 'any tools',
  skill: 'any skills',
} as const

export const PROFICIENCY_POOL_SELECTED_PHRASES = {
  weapon: 'selected weapons',
  tool: 'selected tools',
  skill: 'selected skills',
  armor: 'selected armor',
} as const satisfies Record<ProficiencyDomain, string>

/** Returns the reference entry for a proficiency domain, if known. */
export function getProficiencyDomainEntry(domain: string): GameTermEntry | undefined {
  return PROFICIENCY_DOMAIN_ENTRIES[domain as ProficiencyDomain]
}

/** Counted noun phrase for generated proficiency-grant prose. */
export function getProficiencyDomainSentenceForm(domain: ProficiencyDomain, count = 1): string {
  return getTermSentenceForm(PROFICIENCY_DOMAIN_ENTRIES[domain], count)
}

/** Title-case domain label for authoring headers (e.g. "Weapon proficiency"). */
export function getProficiencyDomainLabel(domain: ProficiencyDomain): string {
  const phrase = getProficiencyDomainSentenceForm(domain, 1)
  return `${phrase.charAt(0).toUpperCase()}${phrase.slice(1)}`
}

/** Compact suffix for fixed weapon/tool/skill grant summaries. */
export function getProficiencyGrantCompactSuffix(count: number): 'proficiency' | 'proficiencies' {
  return count === 1 ? 'proficiency' : 'proficiencies'
}

/** Compact suffix for fixed armor training grant summaries. */
export function getArmorTrainingCompactSuffix(): string {
  return 'training'
}

/** Pool display label for unconstrained choice pools (e.g. "any weapon"). */
export function getProficiencyPoolAnyLabel(domain: ProficiencyDomain): string {
  return PROFICIENCY_POOL_ANY_LABELS[domain]
}

/** Scope phrase for choice sentences with open pools (e.g. "any tools"). */
export function getProficiencyPoolAnyScopePhrase(
  kind: keyof typeof PROFICIENCY_POOL_ANY_SCOPE_PHRASES,
): string {
  return PROFICIENCY_POOL_ANY_SCOPE_PHRASES[kind]
}

/** Scope phrase for explicit pool choices (e.g. "selected weapons"). */
export function getProficiencyPoolSelectedPhrase(domain: ProficiencyDomain): string {
  return PROFICIENCY_POOL_SELECTED_PHRASES[domain]
}

/** Character builder add action label (e.g. "Add weapon proficiency"). */
export function getProficiencyGrantAddLabel(domain: ProficiencyDomain): string {
  return `Add ${getProficiencyDomainSentenceForm(domain, 1)}`
}

/** Authoring fallback when a pool category is unset: "choose N weapon proficiency". */
export function formatProficiencyGrantChoosePhrase(
  domain: ProficiencyDomain,
  choose: number,
): string {
  return `choose ${choose} ${getProficiencyDomainSentenceForm(domain, choose)}`
}

/** Authoring fallback for explicit pool choices: "choose N from selected weapons". */
export function formatProficiencyGrantChooseFromSelectedPhrase(
  domain: ProficiencyDomain,
  choose: number,
): string {
  return `choose ${choose} from ${getProficiencyPoolSelectedPhrase(domain)}`
}

/** Authoring fallback for open pool choices: "choose N from any tools". */
export function formatProficiencyGrantChooseFromAnyScopePhrase(
  kind: keyof typeof PROFICIENCY_POOL_ANY_SCOPE_PHRASES,
  choose: number,
): string {
  return `choose ${choose} from ${getProficiencyPoolAnyScopePhrase(kind)}`
}
