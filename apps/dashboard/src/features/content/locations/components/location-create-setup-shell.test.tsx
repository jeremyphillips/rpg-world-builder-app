import { useState } from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { RadioCardOption } from '@rpg/ui'

import { CreateSetupShell, type CreateSetupValueChangeEvent } from '@/lib/create-setup'

import { LOCATION_CREATE_SETUP_CHANGE_LABEL } from '../lib/create/setup/location-create-setup-chrome.lib'
import { buildLocationCreateSetupSets } from '../lib/create/setup/location-create-setup.lib'
import type { LocationCreateSetupChoiceSet } from '../lib/create/setup/location-create-setup.lib'

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
      isComplete: Boolean(siteType),
    },
  ]

  return (
    <CreateSetupShell
      open
      onOpenChange={vi.fn()}
      headline="Create site"
      sets={buildLocationCreateSetupSets(choiceSets)}
      changeLabel={LOCATION_CREATE_SETUP_CHANGE_LABEL}
      onSetupValueChange={(event) => {
        if (event.setId === 'siteType') setSiteType(String(event.nextValue))
      }}
      onContinue={onContinue}
    />
  )
}

function TwoChoiceSetupHarness({ onContinue = vi.fn() }: { onContinue?: () => void }) {
  const [classification, setClassification] = useState('')
  const [regionType, setRegionType] = useState('')

  const handleSetupValueChange = (event: CreateSetupValueChangeEvent) => {
    if (event.setId === 'classification') {
      setClassification(String(event.nextValue))
      if (event.invalidatedSetIds.includes('regionType')) {
        setRegionType('')
      }
      return
    }
    if (event.setId === 'regionType') {
      setRegionType(String(event.nextValue))
    }
  }

  const choiceSets: LocationCreateSetupChoiceSet[] = [
    {
      id: 'classification',
      fieldLabel: 'Classification',
      prompt: 'What kind of region are you creating?',
      options: CLASSIFICATION_OPTIONS,
      value: classification,
      isComplete: Boolean(classification),
    },
    {
      id: 'regionType',
      fieldLabel: 'Region type',
      prompt: 'Region type',
      options: REGION_TYPE_OPTIONS,
      value: regionType,
      dependsOn: ['classification'],
      isComplete: Boolean(regionType),
    },
  ]

  return (
    <CreateSetupShell
      open
      onOpenChange={vi.fn()}
      headline="Create region"
      sets={buildLocationCreateSetupSets(choiceSets)}
      changeLabel={LOCATION_CREATE_SETUP_CHANGE_LABEL}
      onSetupValueChange={handleSetupValueChange}
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
            isComplete: false,
          },
        ])}
        changeLabel={LOCATION_CREATE_SETUP_CHANGE_LABEL}
        onSetupValueChange={vi.fn()}
        onContinue={vi.fn()}
      />,
    )

    expect(screen.getByText('Choose the options that best describe this site.')).toBeInTheDocument()
  })

  it('summarizes a completed single choice and enables Continue after selection', async () => {
    const user = userEvent.setup()
    const onContinue = vi.fn()

    render(<SingleChoiceSetupHarness onContinue={onContinue} />)

    expect(
      screen.getByRole('radiogroup', { name: 'What kind of site are you creating?' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Landmark') }))

    expect(
      screen.queryByRole('radiogroup', { name: 'What kind of site are you creating?' }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Landmark')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: LOCATION_CREATE_SETUP_CHANGE_LABEL }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => {
      expect(onContinue).toHaveBeenCalledTimes(1)
    })
  })

  it('spaces choice-set sections with a 16px vertical gap', () => {
    render(<TwoChoiceSetupHarness />)

    expect(document.querySelector('[class*="gap-4"]')).toBeTruthy()
  })

  it('renders a partial summary row and reveals the next set', async () => {
    const user = userEvent.setup()

    render(<TwoChoiceSetupHarness />)

    expect(
      screen.getByRole('radiogroup', { name: 'What kind of region are you creating?' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup', { name: 'Region type' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Political') }))

    expect(screen.getByText('Classification')).toBeInTheDocument()
    expect(screen.getByText('Political')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change classification' })).toBeInTheDocument()
    expect(
      screen.queryByRole('radiogroup', { name: 'What kind of region are you creating?' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Region type' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Kingdom') }))

    expect(screen.queryByRole('radiogroup', { name: 'Region type' })).not.toBeInTheDocument()
    expect(screen.getByText('Kingdom')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change classification' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  it('reopens an earlier choice set and hides the terminal control', async () => {
    const user = userEvent.setup()

    render(<TwoChoiceSetupHarness />)

    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Political') }))
    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Kingdom') }))
    await user.click(screen.getByRole('button', { name: 'Change classification' }))

    expect(
      screen.getByRole('radiogroup', { name: 'What kind of region are you creating?' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup', { name: 'Region type' })).not.toBeInTheDocument()
    expect(screen.queryByText('Kingdom')).not.toBeInTheDocument()
  })

  it('clears dependsOn downstream values when an upstream choice changes', async () => {
    const user = userEvent.setup()

    render(<TwoChoiceSetupHarness />)

    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Political') }))
    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Kingdom') }))
    await user.click(screen.getByRole('button', { name: 'Change classification' }))
    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Geographic') }))

    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Region type' })).toBeInTheDocument()
    expect(
      within(screen.getByRole('radiogroup', { name: 'Region type' })).queryByRole('radio', {
        checked: true,
      }),
    ).not.toBeInTheDocument()
  })
})
