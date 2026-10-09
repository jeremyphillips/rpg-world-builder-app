import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { beforeAll, describe, expect, it } from 'vitest'

import {
  quickNpcAuthoringTabDefaultValues,
  type QuickNpcAuthoringTabFormValues,
} from '../../../lib/quick-npc/quick-npc-form-fields'
import type { QuickNpcRequirementOptionSets } from '../../../lib/quick-npc/quick-npc-requirement-options.lib'
import { QuickNpcRequirementsFields } from '../quick-npc-requirements-fields'

const spellOptionSets: QuickNpcRequirementOptionSets = {
  weapons: [],
  spells: [
    {
      option: { value: 'srd-cc-5.2.1:fire-bolt', label: 'Fire Bolt' },
      compactSummary: {
        groups: [
          { kind: 'classification', levelLabel: 'Cantrip', schoolLabel: 'Evocation' },
          { kind: 'castingTime', label: 'Action' },
          { kind: 'range', label: '120 ft' },
        ],
      },
    },
  ],
}

function RequirementsFieldsHarness({
  optionSets = spellOptionSets,
}: {
  optionSets?: QuickNpcRequirementOptionSets
}) {
  const form = useForm<QuickNpcAuthoringTabFormValues>({
    defaultValues: quickNpcAuthoringTabDefaultValues,
  })

  return (
    <FormProvider {...form}>
      <QuickNpcRequirementsFields optionSets={optionSets} />
    </FormProvider>
  )
}

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => {}
    HTMLElement.prototype.releasePointerCapture = () => {}
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {}
  }
})

describe('QuickNpcRequirementsFields', () => {
  it('renders nothing when spell requirements are unavailable', () => {
    const { container } = render(
      <RequirementsFieldsHarness optionSets={{ weapons: [], spells: [] }} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('lists reachable spells in the combobox panel', async () => {
    const user = userEvent.setup()
    render(<RequirementsFieldsHarness />)

    await user.click(screen.getByRole('combobox', { name: 'Spells' }))
    await user.type(screen.getByRole('searchbox', { name: 'Search Spells' }), 'fire')

    expect(screen.getByRole('option', { name: /Fire Bolt/i })).toBeInTheDocument()
  })
})
