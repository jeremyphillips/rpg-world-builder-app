import type { Meta, StoryObj } from '@storybook/react-vite'

import type { GeneratedName } from '@rpg/contracts/name-generator'

import { NameGeneratorResults } from './name-generator-results.client'

const FIXTURE_RESULTS: GeneratedName[] = [
  {
    value: 'Aelar Galanodel',
    conventionId: 'elvish-personal',
    structureId: 'full',
    parts: { given: 'Aelar', family: 'Galanodel' },
  },
  {
    value: 'Ilyrana Amastacia',
    conventionId: 'elvish-personal',
    structureId: 'full',
    parts: { given: 'Ilyrana', family: 'Amastacia' },
  },
]

const meta = {
  title: 'Dashboard/Name Generator/Results',
  component: NameGeneratorResults,
  args: {
    onRegenerate: () => undefined,
  },
} satisfies Meta<typeof NameGeneratorResults>

export default meta

type Story = StoryObj<typeof meta>

export const Idle: Story = {
  args: {
    status: 'idle',
    results: [],
  },
}

export const Loading: Story = {
  args: {
    status: 'loading',
    results: [],
  },
}

export const Success: Story = {
  args: {
    status: 'success',
    results: FIXTURE_RESULTS,
    seed: 'story-seed',
    resultsSummary: {
      title: 'High Elven personal names',
      subtitle: 'Elvish · Elf · Feminine',
    },
  },
}

export const PartialBatch: Story = {
  args: {
    status: 'success',
    results: FIXTURE_RESULTS,
    seed: 'story-seed',
    resultsSummary: {
      title: 'Generated 6 of 10 unique names.',
      tone: 'warning',
    },
  },
}

export const CollectionError: Story = {
  args: {
    status: 'error',
    results: [],
    error: {
      kind: 'collection-load',
      title: 'Names could not be generated',
      description:
        'A required naming collection could not be loaded. Try again or adjust the filters.',
    },
  },
}
