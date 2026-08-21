import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { fn } from 'storybook/test'
import type { RadioCardOption } from '@rpg/ui'

import { CreateSetupShell } from '@/lib/create-setup'

import { resolveLocationCreateSetupDefaultSubhead } from '../../../../lib/create/setup/location-create-setup-chrome.lib'
import {
  buildLocationCreateSetupSets,
  type LocationCreateSetupChoiceSet,
} from '../../../../lib/create/setup/location-create-setup.lib'

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
  title: 'Content/Locations/LocationCreateSetup',
  component: CreateSetupShell,
  args: {
    open: true,
    onOpenChange: fn(),
    onSetupValueChange: fn(),
    onContinue: fn(),
    headline: 'Create site',
    sets: [],
  },
} satisfies Meta<typeof CreateSetupShell>

export default meta
type Story = StoryObj<typeof meta>

export const SingleChoiceSet: Story = {
  render: (args) => {
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
        {...args}
        headline="Create site"
        sets={buildLocationCreateSetupSets(choiceSets)}
        onSetupValueChange={(event) => {
          if (event.setId === 'siteType') setSiteType(String(event.nextValue))
        }}
      />
    )
  },
}

export const WithDefaultSubhead: Story = {
  render: (args) => {
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
        {...args}
        headline="Create site"
        subhead={resolveLocationCreateSetupDefaultSubhead('site')}
        sets={buildLocationCreateSetupSets(choiceSets)}
        onSetupValueChange={(event) => {
          if (event.setId === 'siteType') setSiteType(String(event.nextValue))
        }}
      />
    )
  },
}

export const TwoChoiceSets: Story = {
  render: (args) => {
    const [classification, setClassification] = useState('')
    const [regionType, setRegionType] = useState('')

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
        isComplete: Boolean(regionType),
        dependsOn: ['classification'],
      },
    ]

    return (
      <CreateSetupShell
        {...args}
        headline="Create region"
        sets={buildLocationCreateSetupSets(choiceSets)}
        onSetupValueChange={(event) => {
          if (event.setId === 'classification') setClassification(String(event.nextValue))
          if (event.setId === 'regionType') setRegionType(String(event.nextValue))
        }}
      />
    )
  },
}
