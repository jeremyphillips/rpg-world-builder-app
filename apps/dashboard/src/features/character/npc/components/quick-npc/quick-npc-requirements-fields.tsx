import * as React from 'react'
import { useFormContext } from 'react-hook-form'

import { ComboboxField } from '@rpg/ui'
import type { ComboboxFieldOption } from '@rpg/ui'

import {
  QUICK_NPC_REQUIRED_SPELL_FIELD_NAME,
  type QuickNpcAuthoringTabFormValues,
} from '../../lib/quick-npc/quick-npc-form-fields'
import type {
  QuickNpcRequirementOptionSets,
  QuickNpcSpellRequirementOption,
} from '../../lib/quick-npc/quick-npc-requirement-options.lib'
import { QuickNpcSpellRequirementPreview } from './quick-npc-requirement-preview'
import { QuickNpcStartingChoiceSelectedRow } from './quick-npc-starting-choice-selected-row'

const QUICK_NPC_SPELL_ADD_LABEL = '+ Add spell'

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

function SpellRequirementsField({ entries }: { entries: QuickNpcSpellRequirementOption[] }) {
  const form = useFormContext<QuickNpcAuthoringTabFormValues>()
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
      labelVisibility="srOnly"
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
        return <QuickNpcStartingChoiceSelectedRow label={option.label} onRemove={onRemove} />
      }}
    />
  )
}

export type QuickNpcRequirementsFieldsProps = {
  optionSets: QuickNpcRequirementOptionSets
}

export function QuickNpcRequirementsFields({ optionSets }: QuickNpcRequirementsFieldsProps) {
  return optionSets.spells.length > 0 ? (
    <SpellRequirementsField entries={optionSets.spells} />
  ) : null
}
