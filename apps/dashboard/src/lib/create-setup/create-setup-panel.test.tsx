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

describe('CreateSetupPanel', () => {
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
