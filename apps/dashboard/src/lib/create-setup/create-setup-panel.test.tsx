import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { RadioCardOption } from '@rpg/ui'

import {
  CreateSetupPanel,
  isCreateSetupChoiceComplete,
  isCreateSetupNumberComplete,
  resolveCreateSetupActiveSetId,
  type CreateSetupSet,
} from '@/lib/create-setup'

const SPECIES_OPTIONS: RadioCardOption[] = [
  { value: 'dwarf', label: 'Dwarf' },
  { value: 'elf', label: 'Elf' },
]

const CLASS_OPTIONS: RadioCardOption[] = [
  { value: 'fighter', label: 'Fighter' },
  { value: 'wizard', label: 'Wizard' },
]

function buildNpcSetupSets(
  values: { speciesId: string; level: number; classId: string },
  onValuesChange: (values: { speciesId: string; level: number; classId: string }) => void,
): CreateSetupSet[] {
  const min = 1
  const max = 20

  return [
    {
      id: 'speciesId',
      kind: 'choice',
      fieldLabel: 'Species',
      prompt: 'Choose a species',
      options: SPECIES_OPTIONS,
      value: values.speciesId,
      isComplete: isCreateSetupChoiceComplete(values.speciesId),
      collapseWhenComplete: true,
      onValueChange: (speciesId) => onValuesChange({ ...values, speciesId }),
      onReset: () => {},
    },
    {
      id: 'level',
      kind: 'number',
      fieldLabel: 'Level',
      value: values.level,
      min,
      max,
      digits: 2,
      isComplete: isCreateSetupNumberComplete(values.level, min, max),
      collapseWhenComplete: false,
      onValueChange: (level) => onValuesChange({ ...values, level }),
      onReset: () => onValuesChange({ ...values, level: 1 }),
    },
    {
      id: 'classId',
      kind: 'choice',
      fieldLabel: 'Class',
      prompt: 'Choose a class',
      options: CLASS_OPTIONS,
      value: values.classId,
      dependsOn: ['speciesId'],
      isComplete: isCreateSetupChoiceComplete(values.classId),
      collapseWhenComplete: true,
      onValueChange: (classId) => onValuesChange({ ...values, classId }),
      onReset: () => onValuesChange({ ...values, classId: '' }),
    },
  ]
}

function MixedSetupHarness() {
  const [values, setValues] = useState({ speciesId: '', level: 1, classId: '' })
  const sets = buildNpcSetupSets(values, setValues)

  return <CreateSetupPanel sets={sets} />
}

function OptionalSetupHarness() {
  const [values, setValues] = useState({ form: '', facility: '', operator: '' })
  const sets: CreateSetupSet[] = [
    {
      id: 'form',
      kind: 'choice',
      fieldLabel: 'Building form',
      prompt: 'What physical building is this?',
      options: [{ value: 'house', label: 'House' }],
      value: values.form,
      required: false,
      isComplete: isCreateSetupChoiceComplete(values.form),
      onValueChange: (form) => setValues((current) => ({ ...current, form })),
      onReset: () => setValues((current) => ({ ...current, form: '' })),
    },
    {
      id: 'facility',
      kind: 'choice',
      fieldLabel: 'Facility type',
      prompt: 'How is this building used?',
      options: [{ value: 'residence', label: 'Residence' }],
      value: values.facility,
      required: false,
      isComplete: isCreateSetupChoiceComplete(values.facility),
      onValueChange: (facility) => setValues((current) => ({ ...current, facility })),
      onReset: () => setValues((current) => ({ ...current, facility: '' })),
    },
    {
      id: 'operator',
      kind: 'choice',
      fieldLabel: 'Operator',
      prompt: 'Who operates here?',
      options: [
        { value: 'none', label: 'No organization' },
        { value: 'create', label: 'Create an organization' },
      ],
      value: values.operator,
      isComplete: isCreateSetupChoiceComplete(values.operator),
      onValueChange: (operator) => setValues((current) => ({ ...current, operator })),
      onReset: () => setValues((current) => ({ ...current, operator: '' })),
    },
  ]

  return <CreateSetupPanel sets={sets} />
}

describe('CreateSetupPanel', () => {
  it('shows untouched optional sets without blocking the required decision', async () => {
    const user = userEvent.setup()
    render(<OptionalSetupHarness />)

    expect(
      screen.getByRole('radiogroup', { name: 'What physical building is this?' }),
    ).toBeVisible()
    expect(screen.getByRole('radiogroup', { name: 'How is this building used?' })).toBeVisible()
    expect(screen.getByRole('radiogroup', { name: 'Who operates here?' })).toBeVisible()

    await user.click(screen.getByRole('radio', { name: 'No organization' }))

    expect(
      screen.getByRole('radiogroup', { name: 'What physical building is this?' }),
    ).toBeVisible()
    expect(screen.getByRole('radiogroup', { name: 'How is this building used?' })).toBeVisible()
  })

  it('keeps a number set expanded when collapseWhenComplete is false', async () => {
    const user = userEvent.setup()
    render(<MixedSetupHarness />)

    await user.click(screen.getByRole('radio', { name: 'Dwarf' }))

    expect(screen.getByRole('spinbutton', { name: 'Level' })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Choose a class' })).toBeInTheDocument()
  })

  it('activates the next incomplete set after level reset without reactivating level', async () => {
    const user = userEvent.setup()
    render(<MixedSetupHarness />)

    await user.click(screen.getByRole('radio', { name: 'Dwarf' }))
    await user.click(screen.getByRole('button', { name: 'Increase Level' }))
    await user.click(screen.getByRole('radio', { name: 'Fighter' }))

    const setsAfterClass = buildNpcSetupSets(
      { speciesId: 'dwarf', level: 2, classId: 'fighter' },
      vi.fn(),
    )
    expect(resolveCreateSetupActiveSetId({ sets: setsAfterClass })).toBe('classId')

    await user.click(screen.getByRole('button', { name: 'Change' }))
    await user.click(screen.getByRole('radio', { name: 'Elf' }))

    const setsAfterSpeciesChange = buildNpcSetupSets(
      { speciesId: 'elf', level: 1, classId: '' },
      vi.fn(),
    )
    expect(resolveCreateSetupActiveSetId({ sets: setsAfterSpeciesChange })).toBe('classId')
    expect(setsAfterSpeciesChange.find((set) => set.id === 'level')?.isComplete).toBe(true)
    expect(screen.queryByRole('heading', { name: 'Fighter' })).not.toBeInTheDocument()
  })
})
