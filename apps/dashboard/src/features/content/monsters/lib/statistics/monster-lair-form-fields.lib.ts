import {
  formatExperiencePoints,
  monsterLairCustomXpMinimumHint,
  resolveMonsterBaseExperiencePoints,
  suggestInLairExperience,
  type ChallengeRating,
} from '@rpg/contracts'
import type { FieldVisibility, FormDisplayBlock, SelectFieldOptionListItem } from '@rpg/ui/form'

import {
  MONSTER_LAIR_EXPERIENCE_MODE_CUSTOM,
  MONSTER_LAIR_EXPERIENCE_MODE_SUGGESTED,
  MONSTER_LAIR_EXPERIENCE_SUGGESTED_CAPTION,
  MONSTER_LAIR_EXPERIENCE_UNAVAILABLE,
  MONSTER_LAIR_EXPERIENCE_UNAVAILABLE_STORED,
} from '../monster-form-labels'

export const MONSTER_LAIR_EXPERIENCE_MODE_FIELD = 'lair.experience.mode'
export const MONSTER_LAIR_EXPERIENCE_VALUE_FIELD = 'lair.experience.value'

export const monsterLairEnabledVisibility: FieldVisibility = {
  dependsOn: ['lair.enabled'],
  visibleWhen: (values) => values['lair.enabled'] === true,
}

export function lairExperienceModeVisibility(mode: 'suggested' | 'custom'): FieldVisibility {
  return {
    dependsOn: [MONSTER_LAIR_EXPERIENCE_MODE_FIELD],
    visibleWhen: (values) => values[MONSTER_LAIR_EXPERIENCE_MODE_FIELD] === mode,
  }
}

export function readChallengeRating(values: Record<string, unknown>): ChallengeRating | undefined {
  const raw = values.challengeRating ?? values['challengeRating']
  return typeof raw === 'string' && raw.length > 0 ? (raw as ChallengeRating) : undefined
}

function readExperiencePointsOverride(values: Record<string, unknown>): number | undefined {
  const raw = values.experiencePointsOverride ?? values['experiencePointsOverride']
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : undefined
}

export function resolveMonsterLairCustomXpHintValues(
  values: Record<string, unknown>,
): { baseXp: number; suggestionXp?: number } | undefined {
  const challengeRating = readChallengeRating(values)
  if (!challengeRating) return undefined
  const baseXp = resolveMonsterBaseExperiencePoints({
    challengeRating,
    experiencePointsOverride: readExperiencePointsOverride(values),
  })
  const suggestion = suggestInLairExperience(challengeRating)
  return {
    baseXp,
    suggestionXp: suggestion.status === 'available' ? suggestion.experiencePoints : undefined,
  }
}

export function seedMonsterLairExperience(values: Record<string, unknown>) {
  const challengeRating = readChallengeRating(values)
  const suggestion = challengeRating
    ? suggestInLairExperience(challengeRating)
    : { status: 'unavailable' as const }
  return {
    mode: suggestion.status === 'available' ? ('suggested' as const) : ('custom' as const),
  }
}

export function resolveMonsterLairExperienceModeOptions(
  values: Record<string, unknown>,
): SelectFieldOptionListItem[] {
  const challengeRating = readChallengeRating(values)
  const suggestion = challengeRating
    ? suggestInLairExperience(challengeRating)
    : { status: 'unavailable' as const }
  const options: SelectFieldOptionListItem[] = [
    { value: 'custom', label: MONSTER_LAIR_EXPERIENCE_MODE_CUSTOM },
  ]
  if (suggestion.status === 'available') {
    options.unshift({ value: 'suggested', label: MONSTER_LAIR_EXPERIENCE_MODE_SUGGESTED })
  }
  return options
}

export function resolveMonsterLairSuggestedXpDisplayContent(
  values: Record<string, unknown>,
): FormDisplayBlock | undefined {
  if (values[MONSTER_LAIR_EXPERIENCE_MODE_FIELD] !== 'suggested') return undefined
  const challengeRating = readChallengeRating(values)
  if (!challengeRating) return undefined
  const suggestion = suggestInLairExperience(challengeRating)
  if (suggestion.status === 'available') {
    return {
      variant: 'text',
      text: formatExperiencePoints(suggestion.experiencePoints),
      role: 'supporting',
    }
  }
  return {
    variant: 'text',
    text: MONSTER_LAIR_EXPERIENCE_UNAVAILABLE_STORED,
    role: 'supporting',
  }
}

export function resolveMonsterLairSuggestedXpCaptionDisplayContent(
  values: Record<string, unknown>,
): FormDisplayBlock | undefined {
  if (values[MONSTER_LAIR_EXPERIENCE_MODE_FIELD] !== 'suggested') return undefined
  const challengeRating = readChallengeRating(values)
  if (!challengeRating) return undefined
  const suggestion = suggestInLairExperience(challengeRating)
  if (suggestion.status !== 'available') return undefined
  return {
    variant: 'text',
    text: MONSTER_LAIR_EXPERIENCE_SUGGESTED_CAPTION,
    role: 'caption',
  }
}

export function resolveMonsterLairCustomXpHint(
  values: Record<string, unknown>,
): string | undefined {
  if (values[MONSTER_LAIR_EXPERIENCE_MODE_FIELD] !== 'custom') return undefined
  const resolved = resolveMonsterLairCustomXpHintValues(values)
  if (!resolved) return MONSTER_LAIR_EXPERIENCE_UNAVAILABLE
  const parts = [monsterLairCustomXpMinimumHint(resolved.baseXp)]
  if (resolved.suggestionXp !== undefined) {
    parts.push(`Suggested: ${formatExperiencePoints(resolved.suggestionXp)}`)
  }
  return parts.join(' ')
}
