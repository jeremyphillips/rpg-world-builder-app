import type { Spell } from '@rpg/contracts'
import { ActionIcon, iconGhostControlVariants } from '@rpg/ui'
import type { ArrayItemShellRenderProps } from '@rpg/ui/form'
import { useArrayFieldContext } from '@rpg/ui/form'
import { useWatch } from 'react-hook-form'

import { EntityDisclosureArrayItemShell } from '../../../lib/entity/surfaces/cards/disclosure/entity-disclosure-array-item-shell'

import {
  spellEntryCatalogMetadata,
  spellEntryFrequencyMetadata,
} from '../../lib/actions/monster-spell-frequency'
import { MONSTER_SPELL_CHANGE_LABEL } from '../../lib/monster-form-labels'
import { useMonsterSpellPicker } from './monster-spell-picker-context'
import {
  MonsterSpellFrequencyField,
  SpellEntryMetadataLines,
} from './monster-spell-frequency-field'

export function MonsterSpellEntryCard({
  catalog,
  ...props
}: ArrayItemShellRenderProps & {
  catalog: ReadonlyMap<string, Spell> | undefined
}) {
  const array = useArrayFieldContext()
  const spellId = typeof props.itemValues.spellId === 'string' ? props.itemValues.spellId : ''
  const spell = spellId ? catalog?.get(spellId) : undefined
  const actionLimitName =
    array?.fullArrayName !== undefined
      ? `${array.fullArrayName.replace(/\.spells$/, '')}.limitedUse`
      : undefined
  const actionLimitedUse = useWatch({ name: actionLimitName ?? 'limitedUse' })
  const catalogLine = spell ? spellEntryCatalogMetadata(spell) : []
  const frequencyLine = spellEntryFrequencyMetadata(
    props.itemValues.limitedUse,
    actionLimitedUse,
    props.itemValues.castAtLevel,
    spell?.level,
  )
  const heading = spell?.name ?? props.header.primary ?? props.header.fallback

  return (
    <EntityDisclosureArrayItemShell
      {...props}
      header={{ ...props.header, primary: heading }}
      description={<SpellEntryMetadataLines catalog={catalogLine} frequency={frequencyLine} />}
    >
      {props.children}
    </EntityDisclosureArrayItemShell>
  )
}

export function MonsterSpellChangeAction({
  catalog,
}: {
  catalog: ReadonlyMap<string, Spell> | undefined
}) {
  const picker = useMonsterSpellPicker()
  const array = useArrayFieldContext()
  if (!picker || !array) return null
  const row = array.items[array.rowIndex]
  const spellId =
    typeof row === 'object' && row !== null && 'spellId' in row && typeof row.spellId === 'string'
      ? row.spellId
      : ''
  const spellName =
    (spellId ? catalog?.get(spellId)?.name : undefined) ?? `Spell ${array.rowIndex + 1}`

  return (
    <button
      type="button"
      className={iconGhostControlVariants({ hover: 'text', layout: 'flex' })}
      aria-label={`${MONSTER_SPELL_CHANGE_LABEL} ${spellName}`}
      onClick={() => picker.openChange(array.rowIndex)}
    >
      <ActionIcon action="replace" size="md" />
    </button>
  )
}

export function MonsterSpellFrequencySlot() {
  const array = useArrayFieldContext()
  if (!array?.fullArrayName) return null
  const actionPath = array.fullArrayName.replace(/\.spells$/, '')
  return (
    <MonsterSpellFrequencyField
      spellLimitName={`${array.fullArrayName}.${array.rowIndex}.limitedUse`}
      actionLimitName={`${actionPath}.limitedUse`}
    />
  )
}
