import { ABILITY_IDS, getAbilityLabel } from '@rpg/contracts'
import { SelectField, type FieldLabelPosition } from '@rpg/ui'
import {
  resolveFieldErrorMessage,
  resolveNestedFieldErrorMessage,
  useFieldControlSize,
} from '@rpg/ui/form'
import type { SelectFieldOptionListItem } from '@rpg/ui/form'
import { useFormContext, useWatch } from 'react-hook-form'

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
  return [
    ...ABILITY_IDS.map((ability) => ({ value: ability, label: getAbilityLabel(ability) })),
    ...sharedOptions.map((option) => ({
      value: `shared:${option.value}`,
      label: option.label,
    })),
  ]
}

export function MonsterActionAttackCastingField({
  namePrefix,
  sharedOptions,
}: {
  namePrefix: string
  sharedOptions: readonly { value: string; label: string }[]
}) {
  const kind = useWatch({ name: `${namePrefix}.bonusSource.kind` })
  if (kind !== 'spell') return null
  return (
    <MonsterActionCastingAbilityField
      name={`${namePrefix}.bonusSource.castingAbility`}
      sharedOptions={sharedOptions}
    />
  )
}

export function MonsterActionSaveDcCastingField({
  namePrefix,
  sharedOptions,
}: {
  namePrefix: string
  sharedOptions: readonly { value: string; label: string }[]
}) {
  const kind = useWatch({ name: `${namePrefix}.dcSource.kind` })
  if (kind !== 'spell') return null
  return (
    <MonsterActionCastingAbilityField
      name={`${namePrefix}.dcSource.castingAbility`}
      sharedOptions={sharedOptions}
    />
  )
}

export function MonsterActionCastingAbilityField({
  name,
  sharedOptions,
  labelPosition,
}: {
  name: string
  sharedOptions: readonly { value: string; label: string }[]
  labelPosition?: FieldLabelPosition
}) {
  const controlSize = useFieldControlSize()
  const { setValue, formState } = useFormContext<MonsterFormValues>()
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
      placeholder="Choose"
      options={monsterCastingAbilityOptions(sharedOptions)}
      value={value}
      size={controlSize}
      width="full"
      error={error}
      invalid={Boolean(error)}
      onValueChange={(next) => {
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
