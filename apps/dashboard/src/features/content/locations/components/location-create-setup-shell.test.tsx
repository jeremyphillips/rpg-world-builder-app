import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { RadioCardOption } from '@rpg/ui'

import { CreateSetupShell, createSetupModalBodyClasses } from '@/lib/create-setup'

import { LOCATION_CREATE_SETUP_CHANGE_LABEL } from '../lib/location-create-setup-chrome.lib'
import { buildLocationCreateSetupSets } from '../lib/location-create-setup.lib'
import type { LocationCreateSetupChoiceSet } from '../lib/location-create-setup.lib'

const SITE_OPTIONS: RadioCardOption[] = [
  {
    value: 'landmark',
    label: 'Landmark',
    description: 'A notable place or feature in the world.',
  },
  {
    value: 'ruin',
    label: 'Ruin',
    description: 'A remnant of a former structure or settlement.',
  },
]

const CLASSIFICATION_OPTIONS: RadioCardOption[] = [
  {
    value: 'political',
    label: 'Political',
    description: 'Defined by governance or jurisdiction.',
  },
  {
    value: 'geographic',
    label: 'Geographic',
    description: 'Defined by terrain or natural bounds.',
  },
]

const REGION_TYPE_OPTIONS: RadioCardOption[] = [
  {
    value: 'kingdom',
    label: 'Kingdom',
    description: 'A sovereign political territory.',
  },
  {
    value: 'province',
    label: 'Province',
    description: 'A subordinate administrative territory.',
  },
]

function SingleChoiceSetupHarness({ onContinue = vi.fn() }: { onContinue?: () => void }) {
  const [siteType, setSiteType] = useState('')

  const choiceSets: LocationCreateSetupChoiceSet[] = [
    {
      id: 'siteType',
      fieldLabel: 'Site type',
      prompt: 'What kind of site are you creating?',
      options: SITE_OPTIONS,
      value: siteType,
      onValueChange: setSiteType,
    },
  ]

  return (
    <CreateSetupShell
      open
      onOpenChange={vi.fn()}
      headline="Create site"
      sets={buildLocationCreateSetupSets(choiceSets)}
      changeLabel={LOCATION_CREATE_SETUP_CHANGE_LABEL}
      onContinue={onContinue}
    />
  )
}

function TwoChoiceSetupHarness({ onContinue = vi.fn() }: { onContinue?: () => void }) {
  const [classification, setClassification] = useState('')
  const [regionType, setRegionType] = useState('')

  const choiceSets: LocationCreateSetupChoiceSet[] = [
    {
      id: 'classification',
      fieldLabel: 'Classification',
      prompt: 'What kind of region are you creating?',
      options: CLASSIFICATION_OPTIONS,
      value: classification,
      onValueChange: setClassification,
    },
    {
      id: 'regionType',
      fieldLabel: 'Region type',
      prompt: 'Region type',
      options: REGION_TYPE_OPTIONS,
      value: regionType,
      onValueChange: setRegionType,
      dependsOn: ['classification'],
    },
  ]

  return (
    <CreateSetupShell
      open
      onOpenChange={vi.fn()}
      headline="Create region"
      sets={buildLocationCreateSetupSets(choiceSets)}
      changeLabel={LOCATION_CREATE_SETUP_CHANGE_LABEL}
      onContinue={onContinue}
    />
  )
}

describe('location create setup', () => {
  it('omits the modal subhead by default', () => {
    render(<SingleChoiceSetupHarness />)

    expect(screen.getByRole('heading', { name: 'Create site' })).toBeInTheDocument()
    expect(
      screen.queryByText('Choose the type that best describes this place.'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('radiogroup', { name: 'What kind of site are you creating?' }),
    ).toBeInTheDocument()
  })

  it('renders an opt-in subhead when provided', () => {
    render(
      <CreateSetupShell
        open
        onOpenChange={vi.fn()}
        headline="Create site"
        subhead="Choose the options that best describe this site."
        sets={buildLocationCreateSetupSets([
          {
            id: 'siteType',
            fieldLabel: 'Site type',
            prompt: 'What kind of site are you creating?',
            options: SITE_OPTIONS,
            value: '',
            onValueChange: vi.fn(),
          },
        ])}
        changeLabel={LOCATION_CREATE_SETUP_CHANGE_LABEL}
        onContinue={vi.fn()}
      />,
    )

    expect(screen.getByText('Choose the options that best describe this site.')).toBeInTheDocument()
  })

  it('keeps a single choice set expanded after selection and omits summary chrome', async () => {
    const user = userEvent.setup()
    const onContinue = vi.fn()

    render(<SingleChoiceSetupHarness onContinue={onContinue} />)

    expect(
      screen.getByRole('radiogroup', { name: 'What kind of site are you creating?' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Landmark') }))

    expect(
      screen.getByRole('radiogroup', { name: 'What kind of site are you creating?' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: LOCATION_CREATE_SETUP_CHANGE_LABEL }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('A notable place or feature in the world.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => {
      expect(onContinue).toHaveBeenCalledTimes(1)
    })
  })

  it('spaces choice-set sections with a 16px vertical gap', async () => {
    const user = userEvent.setup()
    render(<TwoChoiceSetupHarness />)

    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Political') }))

    const summary = screen
      .getByRole('button', {
        name: `Political, ${LOCATION_CREATE_SETUP_CHANGE_LABEL}`,
      })
      .closest('article')
    expect(summary).not.toBeNull()

    const choiceSetStack = summary?.parentElement
    expect(choiceSetStack).toContainElement(screen.getByRole('radiogroup', { name: 'Region type' }))
    expect(choiceSetStack?.className).toMatch(/\bflex-col\b/)
    expect(choiceSetStack?.className).toMatch(/\bgap-4\b/)
    expect(createSetupModalBodyClasses).toContain('gap-4')
  })

  it('collapses completed predecessors, reveals the next set, and uses compact Change', async () => {
    const user = userEvent.setup()

    render(<TwoChoiceSetupHarness />)

    expect(
      screen.getByRole('radiogroup', { name: 'What kind of region are you creating?' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup', { name: 'Region type' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Political') }))

    expect(
      screen.getByRole('button', { name: `Political, ${LOCATION_CREATE_SETUP_CHANGE_LABEL}` }),
    ).toBeInTheDocument()
    expect(screen.getByText('Classification')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: LOCATION_CREATE_SETUP_CHANGE_LABEL }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Defined by governance or jurisdiction.')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('radiogroup', { name: 'What kind of region are you creating?' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Region type' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Kingdom') }))

    expect(screen.getByRole('radiogroup', { name: 'Region type' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: `Political, ${LOCATION_CREATE_SETUP_CHANGE_LABEL}` }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  it('reopens an earlier choice set and collapses the terminal set', async () => {
    const user = userEvent.setup()

    render(<TwoChoiceSetupHarness />)

    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Political') }))
    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Kingdom') }))
    await user.click(screen.getByRole('button', { name: LOCATION_CREATE_SETUP_CHANGE_LABEL }))

    expect(
      screen.getByRole('radiogroup', { name: 'What kind of region are you creating?' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup', { name: 'Region type' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Kingdom' })).not.toBeInTheDocument()
  })

  it('clears dependsOn downstream values when an upstream choice changes', async () => {
    const user = userEvent.setup()

    render(<TwoChoiceSetupHarness />)

    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Political') }))
    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Kingdom') }))
    await user.click(screen.getByRole('button', { name: LOCATION_CREATE_SETUP_CHANGE_LABEL }))
    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Geographic') }))

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    expect(screen.getByRole('radiogroup', { name: 'Region type' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Kingdom' })).not.toBeInTheDocument()
  })
})
