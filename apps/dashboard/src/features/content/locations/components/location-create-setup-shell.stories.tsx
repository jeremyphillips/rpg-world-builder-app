import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { fn } from 'storybook/test'
import type { RadioCardOption } from '@rpg/ui'

import { LocationCreateSetupShell } from './location-create-setup-shell.client'

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

const meta = {
  title: 'Content/Locations/LocationCreateSetupShell',
  component: LocationCreateSetupShell,
  args: {
    open: true,
    onOpenChange: fn(),
    onContinue: fn(),
    headline: 'Create site',
    description: 'Choose the type that best describes this place.',
    choiceSets: [],
  },
} satisfies Meta<typeof LocationCreateSetupShell>

export default meta
type Story = StoryObj<typeof meta>

export const SingleChoiceSet: Story = {
  render: (args) => {
    const [siteType, setSiteType] = useState('')

    return (
      <LocationCreateSetupShell
        {...args}
        headline="Create site"
        description="Choose the type that best describes this place."
        choiceSets={[
          {
            id: 'siteType',
            fieldLabel: 'Site type',
            prompt: 'What kind of site are you creating?',
            options: SITE_OPTIONS,
            value: siteType,
            onValueChange: setSiteType,
          },
        ]}
      />
    )
  },
}

export const TwoChoiceSets: Story = {
  render: (args) => {
    const [classification, setClassification] = useState('')
    const [regionType, setRegionType] = useState('')

    return (
      <LocationCreateSetupShell
        {...args}
        headline="Create region"
        description="Choose the region classification before authoring."
        choiceSets={[
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
          },
        ]}
      />
    )
  },
}
