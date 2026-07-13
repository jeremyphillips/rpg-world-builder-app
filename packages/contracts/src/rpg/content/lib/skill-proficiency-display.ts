import type { SkillProficiency } from '../skill-proficiency'

export const SKILL_PROFICIENCY_SECTION_LABELS = {
  examples: 'Examples',
} as const

function normalizeExamplePhrase(text: string): string {
  const trimmed = text.trim().replace(/\.+$/, '')
  if (!trimmed) return ''
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

function lowercaseFirstCharacter(text: string): string {
  if (!text) return text
  return text.charAt(0).toLowerCase() + text.slice(1)
}

/**
 * Splits legacy single-string skill descriptions into example phrases.
 * Used during catalog migration; review output per skill before committing seed data.
 */
export function splitLegacySkillDescriptionIntoExamples(description: string): string[] {
  const trimmed = description.trim()
  if (!trimmed) return []

  const segments = trimmed.split(/, or | or /)
  const examples = segments
    .flatMap((segment) => (segment.includes(', ') ? segment.split(', ') : [segment]))
    .map(normalizeExamplePhrase)
    .filter((example) => example.length > 0)

  if (examples.length === 0) {
    const fallback = normalizeExamplePhrase(trimmed)
    return fallback ? [fallback] : []
  }

  return examples
}

type SkillProficiencySummaryInput = Pick<SkillProficiency, 'name' | 'description'>

/** Builds `"{Name} covers {predicate}."` from a skill name and summary description. */
export function formatSkillProficiencySummarySentence(
  skill: SkillProficiencySummaryInput,
): string | undefined {
  const predicate = skill.description?.trim()
  if (!predicate) return undefined

  const withoutTrailingPeriod = predicate.replace(/\.+$/, '')
  if (!withoutTrailingPeriod) return undefined

  return `${skill.name} covers ${lowercaseFirstCharacter(withoutTrailingPeriod)}.`
}
