import { ABILITY_IDS, getAbilityLabel, type Ability } from '@rpg/contracts'
import { SelectField } from '@rpg/ui'
import {
  resolveFieldErrorMessage,
  resolveNestedFieldErrorMessage,
  useFieldControlSize,
} from '@rpg/ui/form'
import type { SelectFieldOptionListItem } from '@rpg/ui/form'
import { useFormContext, useWatch } from 'react-hook-form'

import { formatCastingSourceChangeNotice } from '../monster-form-labels'
import {
  legendarySpellcastingActionOptions,
  MONSTER_CASTING_ABILITY_GROUP_LABEL,
  MONSTER_CASTING_SHARE_GROUP_LABEL,
  monsterCastingDependentLabels,
} from './monster-action-casting-summary'
import {
  MONSTER_LEGENDARY_SPELLCASTING_FIELD_HINT,
  MONSTER_LEGENDARY_SPELLCASTING_FIELD_LABEL,
  MONSTER_SPELLCASTING_ABILITY_LABEL,
  MONSTER_SPELLCASTING_ABILITY_PRIMARY_HINT,
  MONSTER_SPELLCASTING_ABILITY_SHARED_HINT,
} from '../monster-form-labels'
import type { MonsterFormValues } from '../monster-form-values'

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
  const shared = {
    kind: 'group' as const,
    label: MONSTER_CASTING_SHARE_GROUP_LABEL,
    options: sharedOptions.map((option) => ({
      value: `shared:${option.value}`,
      label: option.label,
    })),
  }
  if (sharedOptions.length === 0) return [abilities]
  return [abilities, shared]
}

function isDirectAbility(value: unknown): value is { kind: 'ability'; ability: Ability } {
  if (!value || typeof value !== 'object') return false
  const ability = value as { kind?: string; ability?: string }
  return ability.kind === 'ability' && ABILITY_IDS.some((id) => id === ability.ability)
}

export function MonsterActionCastingAbilityField({
  name,
  sharedOptions,
  sourceActionId,
  onBlocked,
  required = true,
  profile = 'shared',
}: {
  name: string
  sharedOptions: readonly { value: string; label: string }[]
  /** Set on the spell row that other actions share. Nested attack and save fields omit it. */
  sourceActionId?: string
  onBlocked?: (message: string) => void
  required?: boolean
  /** Primary defines the ability other actions reuse. Shared may choose that ability or its own. */
  profile?: 'primary' | 'shared'
}) {
  const controlSize = useFieldControlSize()
  const { getValues, setValue, formState } = useFormContext<MonsterFormValues>()
  const current = useWatch({ name })
  const value = castingAbilityValue(current)
  const fieldId = `${name.replaceAll('.', '-')}-casting-ability`
  const error = resolveFieldErrorMessage(resolveNestedFieldErrorMessage(formState.errors, name))
  const hint =
    profile === 'primary'
      ? MONSTER_SPELLCASTING_ABILITY_PRIMARY_HINT
      : MONSTER_SPELLCASTING_ABILITY_SHARED_HINT

  return (
    <SelectField
      id={fieldId}
      name={name}
      label={MONSTER_SPELLCASTING_ABILITY_LABEL}
      required={required}
      placeholder="Choose"
      hint={hint}
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
