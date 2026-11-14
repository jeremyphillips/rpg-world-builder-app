import { ABILITY_IDS, type Ability } from '@rpg/contracts'
import { SelectField } from '@rpg/ui'
import {
  resolveFieldErrorMessage,
  resolveNestedFieldErrorMessage,
  useFieldControlSize,
} from '@rpg/ui/form'
import { useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import {
  formatCastingSourceChangeNotice,
  MONSTER_LEGENDARY_SPELLCASTING_FIELD_HINT,
  MONSTER_LEGENDARY_SPELLCASTING_FIELD_LABEL,
} from '../monster-form-labels'
import {
  legendarySpellcastingActionOptions,
  monsterCastingDependentLabels,
} from './monster-action-casting-summary'
import {
  monsterCastingAbilitySelectOptions,
  type MonsterCastingAbilityPreview,
} from './monster-casting-ability-options'
import {
  SPELLCASTING_ABILITY_FIELD_LABEL,
  SPELLCASTING_ABILITY_PRIMARY_HINT,
  SPELLCASTING_ABILITY_SHARED_HINT,
} from '../../../lib/forms/mechanics/spellcasting-ability-field-copy'
import type { MonsterFormValues } from '../monster-form-values'

function castingAbilityValue(value: unknown): string {
  if (!value || typeof value !== 'object') return ''
  const ability = value as { kind?: string; ability?: string; entryId?: string }
  if (ability.kind === 'ability' && ability.ability) return ability.ability
  if (ability.kind === 'shared' && ability.entryId) return `shared:${ability.entryId}`
  return ''
}

function isDirectAbility(value: unknown): value is { kind: 'ability'; ability: Ability } {
  if (!value || typeof value !== 'object') return false
  const ability = value as { kind?: string; ability?: string }
  return ability.kind === 'ability' && ABILITY_IDS.some((id) => id === ability.ability)
}

const CASTING_PREVIEW_FIELDS = [
  'abilityScores',
  'challengeRating',
  'actions',
  'bonusActions',
  'reactions',
  'legendaryActions',
] as const

export function MonsterActionCastingAbilityField({
  name,
  currentActionId = '',
  sourceActionId,
  onBlocked,
  required = true,
  profile = 'shared',
  preview,
  hint: hintOverride,
}: {
  name: string
  /** Excludes this action from shared sources and resolves derived previews. */
  currentActionId?: string
  /** Set on the spell row that other actions share. Nested attack and save fields omit it. */
  sourceActionId?: string
  onBlocked?: (message: string) => void
  required?: boolean
  /** Primary defines the ability other actions reuse. Shared may choose that ability or its own. */
  profile?: 'primary' | 'shared'
  /** Save DC and spell attack use the same options with different trailing values. */
  preview: MonsterCastingAbilityPreview
  /** Overrides the primary/shared spellcasting hints (for example save DC derivation). */
  hint?: string
}) {
  const controlSize = useFieldControlSize()
  const { getValues, setValue, formState } = useFormContext<MonsterFormValues>()
  const [abilityScores, challengeRating, actions, bonusActions, reactions, legendaryActions] =
    useWatch({ name: [...CASTING_PREVIEW_FIELDS] })
  const current = useWatch({ name })
  const options = useMemo(
    () =>
      monsterCastingAbilitySelectOptions(
        {
          abilityScores,
          challengeRating,
          actions,
          bonusActions,
          reactions,
          legendaryActions,
        } as MonsterFormValues,
        currentActionId,
        preview,
      ),
    [
      abilityScores,
      actions,
      bonusActions,
      challengeRating,
      currentActionId,
      legendaryActions,
      preview,
      reactions,
    ],
  )
  const value = castingAbilityValue(current)
  const fieldId = `${name.replaceAll('.', '-')}-casting-ability`
  const error = resolveFieldErrorMessage(resolveNestedFieldErrorMessage(formState.errors, name))
  const hint =
    hintOverride ??
    (profile === 'primary' ? SPELLCASTING_ABILITY_PRIMARY_HINT : SPELLCASTING_ABILITY_SHARED_HINT)

  return (
    <SelectField
      id={fieldId}
      name={name}
      label={SPELLCASTING_ABILITY_FIELD_LABEL}
      required={required}
      placeholder="Choose"
      hint={hint}
      options={options}
      value={value}
      size={controlSize}
      width="full"
      error={error}
      invalid={Boolean(error)}
      onValueChange={(next) => {
        const leavingDirect = isDirectAbility(current) && !ABILITY_IDS.some((id) => id === next)
        if (leavingDirect && sourceActionId) {
          const dependents = monsterCastingDependentLabels(getValues(), sourceActionId)
          if (dependents.length > 0) {
            onBlocked?.(formatCastingSourceChangeNotice(dependents))
            return
          }
        }
        if (!next) {
          setValue(name as never, undefined as never, { shouldDirty: true, shouldValidate: true })
          return
        }
        if (next.startsWith('shared:')) {
          setValue(
            name as never,
            { kind: 'shared', entryId: next.slice('shared:'.length) } as never,
            { shouldDirty: true, shouldValidate: true },
          )
          return
        }
        setValue(name as never, { kind: 'ability', ability: next } as never, {
          shouldDirty: true,
          shouldValidate: true,
        })
      }}
    />
  )
}

export function MonsterLegendarySpellcastingActionField({
  name,
  required = true,
}: {
  name: string
  required?: boolean
}) {
  const controlSize = useFieldControlSize()
  const { setValue, formState } = useFormContext<MonsterFormValues>()
  const values = (useWatch() ?? {}) as MonsterFormValues
  const current = useWatch({ name }) as { kind?: string; entryId?: string } | undefined
  const entryId = current?.kind === 'shared' && current.entryId ? current.entryId : ''
  const options = legendarySpellcastingActionOptions(values)
  const fieldId = `${name.replaceAll('.', '-')}-spellcasting-action`
  const error = resolveFieldErrorMessage(resolveNestedFieldErrorMessage(formState.errors, name))

  return (
    <SelectField
      id={fieldId}
      name={name}
      label={MONSTER_LEGENDARY_SPELLCASTING_FIELD_LABEL}
      hint={MONSTER_LEGENDARY_SPELLCASTING_FIELD_HINT}
      required={required}
      placeholder="Choose"
      options={options}
      value={entryId}
      size={controlSize}
      width="full"
      error={error}
      invalid={Boolean(error)}
      onValueChange={(next) => {
        if (!next) {
          setValue(name as never, undefined as never, { shouldDirty: true, shouldValidate: true })
          return
        }
        setValue(name as never, { kind: 'shared', entryId: next } as never, {
          shouldDirty: true,
          shouldValidate: true,
        })
      }}
    />
  )
}
