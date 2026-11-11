import { ABILITY_IDS, getAbilityLabel, type Ability } from '@rpg/contracts'
import { SelectField, type FieldLabelPosition } from '@rpg/ui'
import {
  resolveFieldErrorMessage,
  resolveNestedFieldErrorMessage,
  useFieldControlSize,
} from '@rpg/ui/form'
import type { SelectFieldOptionListItem } from '@rpg/ui/form'
import { useFormContext, useWatch } from 'react-hook-form'

import { formatCastingSourceChangeNotice } from '../monster-form-labels'
import {
  MONSTER_CASTING_ABILITY_GROUP_LABEL,
  MONSTER_CASTING_SHARE_GROUP_LABEL,
  monsterCastingDependentLabels,
} from './monster-action-casting-summary'
import type { MonsterFormValues } from '../monster-form-values'

const SPELLCASTING_ABILITY_LABEL = 'Spellcasting ability'

function castingAbilityValue(value: unknown): string {
  if (!value || typeof value !== 'object') return ''
  const ability = value as { kind?: string; ability?: string; entryId?: string }
  if (ability.kind === 'ability' && ability.ability) return ability.ability
  if (ability.kind === 'shared' && ability.entryId) return `shared:${ability.entryId}`
  return ''
}

function monsterCastingAbilityOptions(
  sharedOptions: readonly { value: string; label: string }[],
): SelectFieldOptionListItem[] {
  const abilities = {
    kind: 'group' as const,
    label: MONSTER_CASTING_ABILITY_GROUP_LABEL,
    options: ABILITY_IDS.map((ability) => ({ value: ability, label: getAbilityLabel(ability) })),
  }
  if (sharedOptions.length === 0) return [abilities]
  return [
    abilities,
    {
      kind: 'group' as const,
      label: MONSTER_CASTING_SHARE_GROUP_LABEL,
      options: sharedOptions.map((option) => ({
        value: `shared:${option.value}`,
        label: option.label,
      })),
    },
  ]
}

function isDirectAbility(value: unknown): value is { kind: 'ability'; ability: Ability } {
  if (!value || typeof value !== 'object') return false
  const ability = value as { kind?: string; ability?: string }
  return ability.kind === 'ability' && ABILITY_IDS.some((id) => id === ability.ability)
}

export function MonsterActionCastingAbilityField({
  name,
  sharedOptions,
  labelPosition,
  sourceActionId,
  onBlocked,
  required,
}: {
  name: string
  sharedOptions: readonly { value: string; label: string }[]
  labelPosition?: FieldLabelPosition
  /** Set on the spell row that other actions share. Nested attack and save fields omit it. */
  sourceActionId?: string
  onBlocked?: (message: string) => void
  required?: boolean
}) {
  const controlSize = useFieldControlSize()
  const { getValues, setValue, formState } = useFormContext<MonsterFormValues>()
  const current = useWatch({ name })
  const value = castingAbilityValue(current)
  const fieldId = `${name.replaceAll('.', '-')}-casting-ability`
  const error = resolveFieldErrorMessage(resolveNestedFieldErrorMessage(formState.errors, name))

  return (
    <SelectField
      id={fieldId}
      name={name}
      label={SPELLCASTING_ABILITY_LABEL}
      labelPosition={labelPosition}
      required={required}
      placeholder="Choose"
      options={monsterCastingAbilityOptions(sharedOptions)}
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
