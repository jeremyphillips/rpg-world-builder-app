import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { RadioCardOption } from '@rpg/ui'

import {
  CreateSetupPanel,
  isCreateSetupChoiceComplete,
  resolveCreateSetupActiveSetId,
  useCreateSetupSequence,
  type CreateSetupSet,
  type CreateSetupValueChangeEvent,
} from '@/lib/create-setup'

const SPECIES_OPTIONS: RadioCardOption[] = [
  { value: 'dwarf', label: 'Dwarf' },
  { value: 'elf', label: 'Elf' },
]

const CLASS_OPTIONS: RadioCardOption[] = [
  { value: 'fighter', label: 'Fighter' },
  { value: 'wizard', label: 'Wizard' },
]

function applyNpcSetupValueChange(
  values: { speciesId: string; classId: string },
  event: CreateSetupValueChangeEvent,
) {
  let next = { ...values }

  for (const invalidatedId of event.invalidatedSetIds) {
    if (invalidatedId === 'classId') {
      next.classId = ''
    }
  }

  if (event.setId === 'speciesId') {
    next = { ...next, speciesId: String(event.nextValue), classId: '' }
  }
  if (event.setId === 'classId') {
    next = { ...next, classId: String(event.nextValue) }
  }

  return next
}

function buildNpcSetupSets(values: { speciesId: string; classId: string }): CreateSetupSet[] {
  return [
    {
      id: 'speciesId',
      kind: 'choice',
      fieldLabel: 'Species',
      prompt: 'Choose a species',
      options: SPECIES_OPTIONS,
      value: values.speciesId,
      isComplete: isCreateSetupChoiceComplete(values.speciesId),
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
    },
  ]
}

function DependentSetupHarness() {
  const [values, setValues] = useState({ speciesId: '', classId: '' })
  const sets = buildNpcSetupSets(values)
  const model = useCreateSetupSequence(sets)

  return (
    <CreateSetupPanel
      sets={sets}
      model={model}
      onSetupValueChange={(event) => {
        setValues((current) => applyNpcSetupValueChange(current, event))
      }}
    />
  )
}

function GroupedSetupHarness({ sets }: { sets: CreateSetupSet[] }) {
  const model = useCreateSetupSequence(sets)

  return <CreateSetupPanel sets={sets} model={model} onSetupValueChange={vi.fn()} />
}

describe('CreateSetupPanel', () => {
  it('renders a partial grouped summary when one grouped member is complete', () => {
    const sets: CreateSetupSet[] = [
      {
        id: 'membershipTitle',
        kind: 'choice',
        fieldLabel: 'Title',
        prompt: 'Choose a title',
        options: [{ value: 'guildmaster', label: 'Guildmaster' }],
        value: 'guildmaster',
        summaryGroup: 'selections',
        summaryGroupEyebrow: 'Selections',
        isComplete: true,
      },
      {
        id: 'speciesId',
        kind: 'choice',
        fieldLabel: 'Species',
        prompt: 'Choose a species',
        options: SPECIES_OPTIONS,
        value: '',
        visibleWhenComplete: ['membershipTitle'],
        summaryGroup: 'selections',
        summaryGroupEyebrow: 'Selections',
        isComplete: false,
      },
    ]

    render(<GroupedSetupHarness sets={sets} />)

    expect(screen.getByText('Selections')).toBeInTheDocument()
    expect(screen.getByText('Guildmaster')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change title' })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Choose a species' })).toBeInTheDocument()
  })

  it('renders standalone partial summary cards for completed non-active sets', () => {
    const sets: CreateSetupSet[] = [
      {
        id: 'title',
        kind: 'choice',
        fieldLabel: 'Title',
        prompt: 'Choose a title',
        options: [{ value: 'guildmaster', label: 'Guildmaster' }],
        value: 'guildmaster',
        isComplete: true,
      },
      {
        id: 'speciesId',
        kind: 'choice',
        fieldLabel: 'Species',
        prompt: 'Choose a species',
        options: SPECIES_OPTIONS,
        value: '',
        visibleWhenComplete: ['title'],
        isComplete: false,
      },
    ]

    render(<GroupedSetupHarness sets={sets} />)

    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Guildmaster')).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Choose a species' })).toBeInTheDocument()
  })

  it('activates the next incomplete set after species invalidates class', async () => {
    const user = userEvent.setup()
    render(<DependentSetupHarness />)

    await user.click(screen.getByRole('radio', { name: 'Dwarf' }))
    await user.click(screen.getByRole('radio', { name: 'Fighter' }))

    await user.click(screen.getByRole('button', { name: 'Change species' }))
    await user.click(screen.getByRole('radio', { name: 'Elf' }))

    const setsAfterSpeciesChange = buildNpcSetupSets({ speciesId: 'elf', classId: '' })
    expect(resolveCreateSetupActiveSetId({ sets: setsAfterSpeciesChange })).toBe('classId')
    expect(screen.getByRole('radiogroup', { name: 'Choose a class' })).toBeInTheDocument()
  })

  it('renders completed summaries without an active control when setup sets are exhausted', () => {
    const sets: CreateSetupSet[] = [
      {
        id: 'membershipTitle',
        kind: 'choice',
        fieldLabel: 'Title',
        prompt: 'Choose a title',
        options: [{ value: 'guildmaster', label: 'Guildmaster' }],
        value: 'guildmaster',
        summaryGroup: 'selections',
        summaryGroupEyebrow: 'Selections',
        isComplete: true,
      },
      {
        id: 'speciesId',
        kind: 'choice',
        fieldLabel: 'Species',
        prompt: 'Choose a species',
        options: SPECIES_OPTIONS,
        value: 'dwarf',
        visibleWhenComplete: ['membershipTitle'],
        summaryGroup: 'selections',
        summaryGroupEyebrow: 'Selections',
        isComplete: true,
      },
    ]

    render(<GroupedSetupHarness sets={sets} />)

    expect(screen.getByText('Selections')).toBeInTheDocument()
    expect(screen.getByText('Guildmaster')).toBeInTheDocument()
    expect(screen.getByText('Dwarf')).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup', { name: 'Choose a title' })).not.toBeInTheDocument()
    expect(screen.queryByRole('radiogroup', { name: 'Choose a species' })).not.toBeInTheDocument()
  })

  it('dismisses reopen without emitting a value change when the same option is re-selected', async () => {
    const user = userEvent.setup()
    const onSetupValueChange = vi.fn()

    function SameValueHarness() {
      const sets: CreateSetupSet[] = [
        {
          id: 'membershipTitle',
          kind: 'choice',
          fieldLabel: 'Title',
          prompt: 'Choose a title',
          options: [{ value: 'none', label: 'No title' }],
          value: 'none',
          isComplete: true,
        },
        {
          id: 'speciesId',
          kind: 'choice',
          fieldLabel: 'Species',
          prompt: 'Choose a species',
          options: SPECIES_OPTIONS,
          value: '',
          visibleWhenComplete: ['membershipTitle'],
          isComplete: false,
        },
      ]
      const model = useCreateSetupSequence(sets)

      return <CreateSetupPanel sets={sets} model={model} onSetupValueChange={onSetupValueChange} />
    }

    render(<SameValueHarness />)

    await user.click(screen.getByRole('button', { name: 'Change title' }))
    await user.click(screen.getByRole('radio', { name: /no title/i }))

    expect(onSetupValueChange).not.toHaveBeenCalled()
    expect(screen.queryByRole('radiogroup', { name: 'Choose a title' })).not.toBeInTheDocument()
  })
})
