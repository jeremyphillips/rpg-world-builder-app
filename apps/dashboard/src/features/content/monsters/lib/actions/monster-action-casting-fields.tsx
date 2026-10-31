import { ABILITY_IDS, getAbilityLabel } from '@rpg/contracts'
import { useFormContext, useWatch } from 'react-hook-form'

import type { MonsterFormValues } from '../monster-form-values'

function castingAbilityValue(value: unknown): string {
  if (!value || typeof value !== 'object') return ''
  const ability = value as { kind?: string; ability?: string; entryId?: string }
  if (ability.kind === 'ability' && ability.ability) return ability.ability
  if (ability.kind === 'shared' && ability.entryId) return `shared:${ability.entryId}`
  return ''
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

export function MonsterActionCastingAbilityField({
  name,
  sharedOptions,
}: {
  name: string
  sharedOptions: readonly { value: string; label: string }[]
}) {
  const { setValue } = useFormContext<MonsterFormValues>()
  const current = useWatch({ name })
  const value = castingAbilityValue(current)
  const fieldId = `${name.replaceAll('.', '-')}-casting-ability`

  return (
    <label htmlFor={fieldId} className="flex flex-col gap-1">
      Spellcasting ability
      <select
        id={fieldId}
        value={value}
        onChange={(event) => {
          const next = event.target.value
          if (!next) {
            setValue(name as never, undefined as never, { shouldDirty: true })
            return
          }
          if (next.startsWith('shared:')) {
            setValue(
              name as never,
              { kind: 'shared', entryId: next.slice('shared:'.length) } as never,
              { shouldDirty: true },
            )
            return
          }
          setValue(name as never, { kind: 'ability', ability: next } as never, {
            shouldDirty: true,
          })
        }}
      >
        <option value="">Choose</option>
        {ABILITY_IDS.map((ability) => (
          <option key={ability} value={ability}>
            {getAbilityLabel(ability)}
          </option>
        ))}
        {sharedOptions.map((option) => (
          <option key={option.value} value={`shared:${option.value}`}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
