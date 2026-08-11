'use client'

import * as React from 'react'
import { useFormContext } from 'react-hook-form'

import { Button, ComboboxField } from '@rpg/ui'
import type { ComboboxFieldOption } from '@rpg/ui'

import {
  QUICK_NPC_REQUIRED_SPELL_FIELD_NAME,
  QUICK_NPC_REQUIRED_WEAPON_FIELD_NAME,
  type QuickNpcAuthoringTabValues,
} from '../lib/quick-npc-form-fields'
import type {
  QuickNpcRequirementOptionSets,
  QuickNpcSpellRequirementOption,
  QuickNpcWeaponRequirementOption,
} from '../lib/quick-npc-requirement-options.lib'
import {
  QuickNpcSpellRequirementPreview,
  QuickNpcWeaponRequirementPreview,
} from './quick-npc-requirement-preview.client'

const QUICK_NPC_WEAPON_ADD_LABEL = '+ Add weapon'
const QUICK_NPC_SPELL_ADD_LABEL = '+ Add spell'
const QUICK_NPC_REQUIREMENT_REMOVE_LABEL = 'Remove'

function excludeSelectedOptions(
  options: ComboboxFieldOption[],
  selected: string[],
): ComboboxFieldOption[] {
  const selectedSet = new Set(selected)
  return options.filter((option) => !selectedSet.has(option.value))
}

function filterComboboxOptions(
  options: ComboboxFieldOption[],
  query: string,
  selected: string[],
): ComboboxFieldOption[] {
  const available = excludeSelectedOptions(options, selected)
  const normalized = query.trim().toLowerCase()
  if (!normalized) return available
  return available.filter((option) => option.label.toLowerCase().includes(normalized))
}

function WeaponRequirementsField({ entries }: { entries: QuickNpcWeaponRequirementOption[] }) {
  const form = useFormContext<QuickNpcAuthoringTabValues>()
  const value = form.watch(QUICK_NPC_REQUIRED_WEAPON_FIELD_NAME) ?? []
  const options = React.useMemo(() => entries.map((entry) => entry.option), [entries])
  const entryById = React.useMemo(
    () => new Map(entries.map((entry) => [entry.option.value, entry])),
    [entries],
  )

  return (
    <ComboboxField
      id="quick-npc-required-weapons"
      label="Weapons"
      options={options}
      multiple
      value={value}
      onChange={(next) => {
        form.setValue(QUICK_NPC_REQUIRED_WEAPON_FIELD_NAME, Array.isArray(next) ? next : [], {
          shouldDirty: true,
        })
      }}
      placeholder={QUICK_NPC_WEAPON_ADD_LABEL}
      emptyMessage="No matching weapons"
      resolveFilteredOptions={(panelOptions, query, selected) =>
        filterComboboxOptions(panelOptions, query, selected)
      }
      renderOption={(option) => {
        const entry = entryById.get(option.value)
        if (!entry) return null
        return <QuickNpcWeaponRequirementPreview entry={entry} />
      }}
      renderSelectedItem={(option, { onRemove }) => {
        const entry = entryById.get(option.value)
        if (!entry) return null
        return (
          <div className="flex items-start gap-2 rounded-md border border-border bg-card px-3 py-2">
            <div className="min-w-0 flex-1">
              <QuickNpcWeaponRequirementPreview entry={entry} />
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
              {QUICK_NPC_REQUIREMENT_REMOVE_LABEL}
            </Button>
          </div>
        )
      }}
    />
  )
}

function SpellRequirementsField({ entries }: { entries: QuickNpcSpellRequirementOption[] }) {
  const form = useFormContext<QuickNpcAuthoringTabValues>()
  const value = form.watch(QUICK_NPC_REQUIRED_SPELL_FIELD_NAME) ?? []
  const options = React.useMemo(() => entries.map((entry) => entry.option), [entries])
  const entryById = React.useMemo(
    () => new Map(entries.map((entry) => [entry.option.value, entry])),
    [entries],
  )

  return (
    <ComboboxField
      id="quick-npc-required-spells"
      label="Spells"
      options={options}
      multiple
      value={value}
      onChange={(next) => {
        form.setValue(QUICK_NPC_REQUIRED_SPELL_FIELD_NAME, Array.isArray(next) ? next : [], {
          shouldDirty: true,
        })
      }}
      placeholder={QUICK_NPC_SPELL_ADD_LABEL}
      emptyMessage="No matching spells"
      resolveFilteredOptions={(panelOptions, query, selected) =>
        filterComboboxOptions(panelOptions, query, selected)
      }
      renderOption={(option) => {
        const entry = entryById.get(option.value)
        if (!entry) return null
        return <QuickNpcSpellRequirementPreview entry={entry} />
      }}
      renderSelectedItem={(option, { onRemove }) => {
        const entry = entryById.get(option.value)
        if (!entry) return null
        return (
          <div className="flex items-start gap-2 rounded-md border border-border bg-card px-3 py-2">
            <div className="min-w-0 flex-1">
              <QuickNpcSpellRequirementPreview entry={entry} />
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
              {QUICK_NPC_REQUIREMENT_REMOVE_LABEL}
            </Button>
          </div>
        )
      }}
    />
  )
}

export type QuickNpcRequirementsFieldsProps = {
  optionSets: QuickNpcRequirementOptionSets
}

export function QuickNpcRequirementsFields({ optionSets }: QuickNpcRequirementsFieldsProps) {
  return (
    <div className="space-y-6">
      {optionSets.weapons.length > 0 ? (
        <WeaponRequirementsField entries={optionSets.weapons} />
      ) : null}
      {optionSets.spells.length > 0 ? <SpellRequirementsField entries={optionSets.spells} /> : null}
    </div>
  )
}
