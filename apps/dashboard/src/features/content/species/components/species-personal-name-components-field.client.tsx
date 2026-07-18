'use client'

import {
  PERSONAL_NAME_COMPONENT_ENTRIES,
  PERSONAL_NAME_COMPONENTS,
  type PersonalNameComponent,
} from '@rpg/contracts/name-generator'
import { ChipsField, OptionalFieldDisclosure } from '@rpg/ui'
import type { FieldOption } from '@rpg/ui/form'
import { useId, useState } from 'react'
import { useController, useFormContext } from 'react-hook-form'

import { labelsFromEntries } from '@/features/content/equipment/lib/equipment-form-field-helpers'

import { CULTURE_NAMING_PERSONAL_NAME_COMPONENTS_FIELD } from '../lib/species-culture-form-fields'

const personalNameComponentOptions: FieldOption[] = PERSONAL_NAME_COMPONENTS.map((value) => ({
  value,
  label: labelsFromEntries(PERSONAL_NAME_COMPONENT_ENTRIES)[value],
}))

const PERSONAL_NAME_COMPONENTS_HINT =
  "Optional parts that may appear in this species' personal names. Given names are included automatically."

export type SpeciesPersonalNameComponentsFieldProps = {
  disabled?: boolean
}

export function SpeciesPersonalNameComponentsField({
  disabled = false,
}: SpeciesPersonalNameComponentsFieldProps) {
  const controlId = useId()
  const { control } = useFormContext()
  const { field } = useController({
    control,
    name: CULTURE_NAMING_PERSONAL_NAME_COMPONENTS_FIELD,
    defaultValue: [] as PersonalNameComponent[],
  })
  const value = (field.value as PersonalNameComponent[] | undefined) ?? []
  const [open, setOpen] = useState(value.length > 0)

  return (
    <OptionalFieldDisclosure
      controlId={controlId}
      fieldLabel="Personal name components"
      addLabel="Add personal name components"
      open={open}
      onOpenChange={setOpen}
      onRemove={() => {
        field.onChange([])
        setOpen(false)
      }}
    >
      <ChipsField
        id={controlId}
        label=""
        hint={PERSONAL_NAME_COMPONENTS_HINT}
        multiple
        disabled={disabled}
        value={value}
        onChange={(nextValue) => {
          field.onChange(Array.isArray(nextValue) ? nextValue : [])
        }}
        options={personalNameComponentOptions}
        chrome={{ variant: 'panel' }}
      />
    </OptionalFieldDisclosure>
  )
}
