import { type Spell } from '@rpg/contracts'
import type { SelectFieldConfig } from '@rpg/ui/form'

import {
  MONSTER_SPELL_CAST_HIGHER_LEVEL_LABEL,
  MONSTER_SPELL_CAST_LEVEL_PLACEHOLDER,
} from '../monster-form-labels'
import { higherCastLevelOptions, spellAllowsHigherCastLevel } from './monster-spell-frequency'

function spellIdFromValues(values: Record<string, unknown>, field: string): string {
  const raw = values[field]
  return typeof raw === 'string' ? raw : ''
}

function selectedSpell(
  values: Record<string, unknown>,
  field: string,
  catalog: ReadonlyMap<string, Spell> | undefined,
): Spell | undefined {
  const spellId = spellIdFromValues(values, field)
  if (!spellId) return undefined
  return catalog?.get(spellId)
}

export function monsterSpellCastAtLevelField(input: {
  name?: string
  spellIdField: string
  catalog: ReadonlyMap<string, Spell> | undefined
  label?: string
  labelVisibility?: SelectFieldConfig['labelVisibility']
  width?: SelectFieldConfig['width']
  optionalDisclosure?: SelectFieldConfig['optionalDisclosure']
}): SelectFieldConfig {
  const name = input.name ?? 'castAtLevel'
  return {
    type: 'select',
    name,
    label: input.label ?? 'Cast at level',
    labelVisibility: input.labelVisibility,
    placeholder: MONSTER_SPELL_CAST_LEVEL_PLACEHOLDER,
    width: input.width,
    optionalDisclosure: input.optionalDisclosure ?? {
      addLabel: MONSTER_SPELL_CAST_HIGHER_LEVEL_LABEL,
      expandWhenPopulated: true,
    },
    optionsResolve: {
      dependsOn: [input.spellIdField],
      optionsWhen: (values) => {
        const spell = selectedSpell(values, input.spellIdField, input.catalog)
        if (!spell || !spellAllowsHigherCastLevel(spell.level)) return []
        return higherCastLevelOptions(spell.level)
      },
    },
    visibility: {
      dependsOn: [input.spellIdField],
      visibleWhen: (values) => {
        const spell = selectedSpell(values, input.spellIdField, input.catalog)
        return Boolean(spell && spellAllowsHigherCastLevel(spell.level))
      },
    },
  }
}
