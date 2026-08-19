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
  values: { speciesId: string; level: number; classId: string },
  event: CreateSetupValueChangeEvent,
) {
  let next = { ...values }

  for (const invalidatedId of event.invalidatedSetIds) {
    if (invalidatedId === 'classId') {
      next.classId = ''
    }
    if (invalidatedId === 'level') {
      next.level = 1
    }
  }

  if (event.setId === 'speciesId') {
    next = { ...next, speciesId: String(event.nextValue), classId: '' }
  }
  if (event.setId === 'level') {
    next = { ...next, level: Number(event.nextValue) }
  }
  if (event.setId === 'classId') {
    next = { ...next, classId: String(event.nextValue) }
  }

  return next
}

function buildNpcSetupSets(values: {
  speciesId: string
  level: number
  classId: string
}): CreateSetupSet[] {
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
    },
  ]
}

function MixedSetupHarness() {
  const [values, setValues] = useState({ speciesId: '', level: 1, classId: '' })
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
    },
  ]
  const model = useCreateSetupSequence(sets)

  return (
    <CreateSetupPanel
      sets={sets}
      model={model}
      onSetupValueChange={(event) => {
        setValues((current) => {
          const next = { ...current }
          if (event.setId === 'form') next.form = String(event.nextValue)
          if (event.setId === 'facility') next.facility = String(event.nextValue)
          if (event.setId === 'operator') next.operator = String(event.nextValue)
          return next
        })
      }}
    />
  )
}

function GroupedSetupHarness({ sets }: { sets: CreateSetupSet[] }) {
  const model = useCreateSetupSequence(sets)

  return <CreateSetupPanel sets={sets} model={model} onSetupValueChange={vi.fn()} />
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

    const setsAfterClass = buildNpcSetupSets({ speciesId: 'dwarf', level: 2, classId: 'fighter' })
    expect(resolveCreateSetupActiveSetId({ sets: setsAfterClass })).toBe('classId')

    await user.click(screen.getAllByRole('button', { name: 'Change' })[0]!)
    await user.click(screen.getByRole('radio', { name: 'Elf' }))

    const setsAfterSpeciesChange = buildNpcSetupSets({ speciesId: 'elf', level: 1, classId: '' })
    expect(resolveCreateSetupActiveSetId({ sets: setsAfterSpeciesChange })).toBe('classId')
    expect(setsAfterSpeciesChange.find((set) => set.id === 'level')?.isComplete).toBe(true)
    expect(screen.queryByRole('heading', { name: 'Fighter' })).not.toBeInTheDocument()
  })

  it('keeps the default chooser summary when grouped ids are not declared', () => {
    const sets: CreateSetupSet[] = [
      {
        id: 'title',
        kind: 'choice',
        fieldLabel: 'Title',
        prompt: 'Choose a title',
        options: [{ value: 'guildmaster', label: 'Guildmaster' }],
        value: 'guildmaster',
        isComplete: true,
        collapseWhenComplete: true,
      },
      {
        id: 'speciesId',
        kind: 'choice',
        fieldLabel: 'Species',
        prompt: 'Choose a species',
        options: SPECIES_OPTIONS,
        value: 'dwarf',
        visibleWhenComplete: ['title'],
        isComplete: true,
        collapseWhenComplete: true,
        collapseWhenActiveAndComplete: true,
      },
    ]

    render(<GroupedSetupHarness sets={sets} />)

    expect(screen.getByRole('button', { name: 'Guildmaster, Change' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dwarf, Change' })).toBeInTheDocument()
    expect(screen.queryByText('Selections')).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Change' })).toHaveLength(2)
  })

  it('renders a declared grouped summary when every listed choice is collapsed-complete', () => {
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
        collapseWhenComplete: true,
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
        collapseWhenComplete: true,
        collapseWhenActiveAndComplete: true,
      },
    ]

    render(<GroupedSetupHarness sets={sets} />)

    expect(screen.getByText('Selections')).toBeInTheDocument()
    expect(screen.getByText('Guildmaster')).toBeInTheDocument()
    expect(screen.getByText('Dwarf')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Guildmaster' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change title' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change species' })).toBeInTheDocument()
  })

  it('keeps a single completed grouped member on ChooserSummaryCard until the group is complete', () => {
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
        collapseWhenComplete: true,
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
        collapseWhenComplete: true,
        collapseWhenActiveAndComplete: true,
      },
    ]

    render(<GroupedSetupHarness sets={sets} />)

    expect(screen.queryByText('Selections')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guildmaster, Change' })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Choose a species' })).toBeInTheDocument()
  })

  it('does not group a third collapsed choice that is outside the summary group', () => {
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
        collapseWhenComplete: true,
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
        collapseWhenComplete: true,
        collapseWhenActiveAndComplete: true,
      },
      {
        id: 'classId',
        kind: 'choice',
        fieldLabel: 'Class',
        prompt: 'Choose a class',
        options: CLASS_OPTIONS,
        value: 'fighter',
        visibleWhenComplete: ['speciesId'],
        isComplete: true,
        collapseWhenComplete: true,
        collapseWhenActiveAndComplete: true,
      },
    ]

    render(<GroupedSetupHarness sets={sets} />)

    expect(screen.getByText('Selections')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fighter, Change' })).toBeInTheDocument()
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
          collapseWhenComplete: true,
          collapseWhenActiveAndComplete: true,
        },
      ]
      const model = useCreateSetupSequence(sets)

      return <CreateSetupPanel sets={sets} model={model} onSetupValueChange={onSetupValueChange} />
    }

    render(<SameValueHarness />)

    await user.click(screen.getByRole('button', { name: 'No title, Change' }))
    await user.click(screen.getByRole('radio', { name: /no title/i }))

    expect(onSetupValueChange).not.toHaveBeenCalled()
    expect(screen.queryByRole('radiogroup', { name: 'Choose a title' })).not.toBeInTheDocument()
  })
})
