import {
  formatExperiencePoints,
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

export const monsterLairEnabledVisibility: FieldVisibility = {
  dependsOn: ['lair.enabled'],
  visibleWhen: (values) => (values.lair as { enabled?: boolean } | undefined)?.enabled === true,
}

export function lairExperienceModeVisibility(mode: 'suggested' | 'custom'): FieldVisibility {
  return {
    dependsOn: ['mode'],
    visibleWhen: (values) => values.mode === mode,
  }
}

export function readChallengeRating(values: Record<string, unknown>): ChallengeRating | undefined {
  const raw =
    values.challengeRating ?? values['../../challengeRating'] ?? values['../challengeRating']
  return typeof raw === 'string' && raw.length > 0 ? (raw as ChallengeRating) : undefined
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
  if (values.mode !== 'suggested') return undefined
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
  if (values.mode !== 'suggested') return undefined
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
  if (values.mode !== 'custom') return undefined
  const challengeRating = readChallengeRating(values)
  if (!challengeRating) return MONSTER_LAIR_EXPERIENCE_UNAVAILABLE
  const suggestion = suggestInLairExperience(challengeRating)
  if (suggestion.status === 'unavailable') return MONSTER_LAIR_EXPERIENCE_UNAVAILABLE
  return `Suggested: ${formatExperiencePoints(suggestion.experiencePoints)}`
}
