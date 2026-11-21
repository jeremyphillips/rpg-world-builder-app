import { Button, Text } from '@rpg/ui'
import {
  formatExperiencePoints,
  suggestInLairExperience,
  type ChallengeRating,
} from '@rpg/contracts'
import { useFormContext, useWatch } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'

import {
  MONSTER_ADD_IN_LAIR_XP_LABEL,
  MONSTER_HAS_LAIR_ENHANCEMENTS_HINT,
  MONSTER_HAS_LAIR_ENHANCEMENTS_LABEL,
  MONSTER_LAIR_EXPERIENCE_ADD_HINT,
  MONSTER_LAIR_EXPERIENCE_CUSTOM_HINT_PREFIX,
  MONSTER_LAIR_EXPERIENCE_CUSTOM_LABEL,
  MONSTER_LAIR_EXPERIENCE_MODE_CUSTOM,
  MONSTER_LAIR_EXPERIENCE_MODE_LABEL,
  MONSTER_LAIR_EXPERIENCE_MODE_SUGGESTED,
  MONSTER_LAIR_EXPERIENCE_REMOVE_LABEL,
  MONSTER_LAIR_EXPERIENCE_SUGGESTED_CAPTION,
  MONSTER_LAIR_EXPERIENCE_UNAVAILABLE,
  MONSTER_LAIR_EXPERIENCE_UNAVAILABLE_STORED,
  MONSTER_LAIR_XP_GROUP_HEADING,
} from '../../../../lib/monster-form-labels'
import type { MonsterFormValues } from '../../../../lib/monster-form-values'

type InLairSuggestion = ReturnType<typeof suggestInLairExperience>
type LairExperience = NonNullable<MonsterFormValues['lair']>['experience']

function useMonsterLairExperience() {
  const form = useFormContext<MonsterFormValues>()
  const lairEnabled = useWatch<MonsterFormValues, 'lair.enabled'>({ name: 'lair.enabled' })
  const experience = useWatch<MonsterFormValues, 'lair.experience'>({ name: 'lair.experience' })
  const challengeRating = useWatch<MonsterFormValues, 'challengeRating'>({
    name: 'challengeRating',
  })
  const suggestion =
    typeof challengeRating === 'string' && challengeRating.length > 0
      ? suggestInLairExperience(challengeRating as ChallengeRating)
      : { status: 'unavailable' as const }

  return { form, lairEnabled, experience, suggestion }
}

function suggestedXpLine(suggestion: InLairSuggestion): string | undefined {
  return suggestion.status === 'available'
    ? formatExperiencePoints(suggestion.experiencePoints)
    : undefined
}

function MonsterLairExperienceModeFieldset({
  form,
  experience,
  suggestion,
}: {
  form: UseFormReturn<MonsterFormValues>
  experience: NonNullable<LairExperience>
  suggestion: InLairSuggestion
}) {
  return (
    <fieldset className="flex flex-col gap-2 border-0 p-0">
      <legend className="sr-only">{MONSTER_LAIR_EXPERIENCE_MODE_LABEL}</legend>
      <Text role="label">{MONSTER_LAIR_EXPERIENCE_MODE_LABEL}</Text>
      <div className="flex flex-wrap gap-2">
        {suggestion.status === 'available' ? (
          <Button
            type="button"
            size="sm"
            variant={experience.mode === 'suggested' ? 'default' : 'secondary'}
            onClick={() =>
              form.setValue('lair.experience.mode', 'suggested', { shouldDirty: true })
            }
          >
            {MONSTER_LAIR_EXPERIENCE_MODE_SUGGESTED}
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant={experience.mode === 'custom' ? 'default' : 'secondary'}
          onClick={() => form.setValue('lair.experience.mode', 'custom', { shouldDirty: true })}
        >
          {MONSTER_LAIR_EXPERIENCE_MODE_CUSTOM}
        </Button>
      </div>
    </fieldset>
  )
}

function MonsterLairExperienceSuggestedBody({ suggestedLine }: { suggestedLine?: string }) {
  if (!suggestedLine) {
    return <Text role="supporting">{MONSTER_LAIR_EXPERIENCE_UNAVAILABLE_STORED}</Text>
  }
  return (
    <>
      <Text role="supporting">{suggestedLine}</Text>
      <Text role="caption">{MONSTER_LAIR_EXPERIENCE_SUGGESTED_CAPTION}</Text>
    </>
  )
}

function MonsterLairExperienceCustomBody({
  form,
  experience,
  suggestion,
  suggestedLine,
}: {
  form: UseFormReturn<MonsterFormValues>
  experience: Extract<LairExperience, { mode: 'custom' }>
  suggestion: InLairSuggestion
  suggestedLine?: string
}) {
  return (
    <>
      {suggestion.status === 'unavailable' ? (
        <Text role="supporting">{MONSTER_LAIR_EXPERIENCE_UNAVAILABLE}</Text>
      ) : null}
      {suggestedLine ? (
        <Text role="supporting">{`${MONSTER_LAIR_EXPERIENCE_CUSTOM_HINT_PREFIX}${suggestedLine}`}</Text>
      ) : null}
      <label className="flex flex-col gap-1">
        <Text role="label">{MONSTER_LAIR_EXPERIENCE_CUSTOM_LABEL}</Text>
        <input
          type="number"
          className="ui-field-input"
          min={0}
          value={experience.value ?? ''}
          onChange={(event) => {
            const raw = event.target.value
            form.setValue(
              'lair.experience.value',
              raw === '' ? undefined : Number.parseInt(raw, 10),
              { shouldDirty: true },
            )
          }}
        />
      </label>
    </>
  )
}

function MonsterLairExperienceConfigured({
  form,
  experience,
  suggestion,
  onRemove,
}: {
  form: UseFormReturn<MonsterFormValues>
  experience: NonNullable<LairExperience>
  suggestion: InLairSuggestion
  onRemove: () => void
}) {
  const suggestedLine = suggestedXpLine(suggestion)
  return (
    <div className="flex flex-col gap-3">
      <Text role="label">{MONSTER_LAIR_XP_GROUP_HEADING}</Text>
      <MonsterLairExperienceModeFieldset
        form={form}
        experience={experience}
        suggestion={suggestion}
      />
      {experience.mode === 'suggested' ? (
        <MonsterLairExperienceSuggestedBody suggestedLine={suggestedLine} />
      ) : (
        <MonsterLairExperienceCustomBody
          form={form}
          experience={experience}
          suggestion={suggestion}
          suggestedLine={suggestedLine}
        />
      )}
      <Button type="button" variant="text" size="sm" onClick={onRemove}>
        {MONSTER_LAIR_EXPERIENCE_REMOVE_LABEL}
      </Button>
    </div>
  )
}

export function MonsterLairExperienceField() {
  const { form, lairEnabled, experience, suggestion } = useMonsterLairExperience()
  if (lairEnabled !== true) return null

  const addExperience = () => {
    form.setValue(
      'lair.experience',
      { mode: suggestion.status === 'available' ? 'suggested' : 'custom' },
      { shouldDirty: true },
    )
  }

  if (!experience) {
    return (
      <div className="flex flex-col gap-2">
        <Text role="supporting">{MONSTER_LAIR_EXPERIENCE_ADD_HINT}</Text>
        <Button type="button" variant="secondary" size="sm" onClick={addExperience}>
          {MONSTER_ADD_IN_LAIR_XP_LABEL}
        </Button>
      </div>
    )
  }

  return (
    <MonsterLairExperienceConfigured
      form={form}
      experience={experience}
      suggestion={suggestion}
      onRemove={() => form.setValue('lair.experience', undefined, { shouldDirty: true })}
    />
  )
}

/** Lair switch plus in-lair XP controls. */
export function MonsterLairField() {
  const { form, lairEnabled } = useMonsterLairExperience()

  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={lairEnabled === true}
          onChange={(event) =>
            form.setValue('lair.enabled', event.target.checked, { shouldDirty: true })
          }
        />
        <span>{MONSTER_HAS_LAIR_ENHANCEMENTS_LABEL}</span>
      </label>
      <Text role="supporting">{MONSTER_HAS_LAIR_ENHANCEMENTS_HINT}</Text>
      <MonsterLairExperienceField />
    </div>
  )
}
