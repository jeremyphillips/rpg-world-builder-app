import {
  normalizeOmittedSpellComponents,
  type SpellComponentId,
  SPELL_COMPONENT_ENTRIES,
  SPELL_COMPONENT_IDS,
} from '@rpg/contracts'
import { CheckboxField, OptionalFieldDisclosure, Text } from '@rpg/ui'
import { useFieldControlSize } from '@rpg/ui/form'
import { useId, useState } from 'react'
import { useController, useFormContext, useWatch } from 'react-hook-form'

import {
  MONSTER_SPELL_COMPONENT_OMISSION_ADD_LABEL,
  MONSTER_SPELL_COMPONENT_OMISSION_HINT,
  MONSTER_SPELL_COMPONENT_OMISSION_LABEL,
} from '../../lib/monster-form-labels'

function readOmitted(value: unknown): SpellComponentId[] {
  if (!Array.isArray(value)) return []
  return normalizeOmittedSpellComponents(value as SpellComponentId[])
}

export function MonsterSpellComponentRequirementsField({ name }: { name: string }) {
  const disclosureId = useId()
  const controlSize = useFieldControlSize()
  const { control } = useFormContext()
  const { field } = useController({
    control,
    name,
    defaultValue: undefined,
  })
  const watched = useWatch({ control, name })
  const omitted = readOmitted(watched)
  const [manualOpen, setManualOpen] = useState(false)
  const populated = omitted.length > 0
  const open = manualOpen || populated

  const writeOmitted = (next: SpellComponentId[] | undefined) => {
    const normalized = next?.length ? normalizeOmittedSpellComponents(next) : undefined
    field.onChange(normalized)
  }

  const toggleComponent = (id: SpellComponentId, checked: boolean) => {
    const selected = new Set(omitted)
    if (checked) selected.add(id)
    else selected.delete(id)
    const next = normalizeOmittedSpellComponents([...selected])
    writeOmitted(next.length > 0 ? next : undefined)
  }

  return (
    <OptionalFieldDisclosure
      controlId={disclosureId}
      fieldLabel={MONSTER_SPELL_COMPONENT_OMISSION_LABEL}
      addLabel={MONSTER_SPELL_COMPONENT_OMISSION_ADD_LABEL}
      open={open}
      onOpenChange={setManualOpen}
      onRemove={() => {
        writeOmitted(undefined)
        setManualOpen(false)
      }}
      size={controlSize}
    >
      <div className="flex min-w-0 flex-col gap-2">
        <Text variant="caption">{MONSTER_SPELL_COMPONENT_OMISSION_HINT}</Text>
        <div
          className="flex min-w-0 flex-wrap items-start gap-x-4 gap-y-2"
          role="group"
          aria-labelledby={disclosureId}
        >
          {SPELL_COMPONENT_IDS.map((id) => (
            <CheckboxField
              key={id}
              id={`${disclosureId}-${id}`}
              label={SPELL_COMPONENT_ENTRIES[id].label}
              size={controlSize}
              checked={omitted.includes(id)}
              onCheckedChange={(checked) => toggleComponent(id, checked === true)}
            />
          ))}
        </div>
      </div>
    </OptionalFieldDisclosure>
  )
}
