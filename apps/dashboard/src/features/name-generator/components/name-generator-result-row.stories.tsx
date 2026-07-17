import type { Meta, StoryObj } from '@storybook/react-vite'

import type { GeneratedName } from '@rpg/contracts/name-generator'

import { NameGeneratorResultRow } from './name-generator-result-row.client'

const FIXTURE_RESULT: GeneratedName = {
  value: 'Aelar Galanodel',
  conventionId: 'elvish-personal',
  structureId: 'full',
  parts: {
    given: 'Aelar',
    family: 'Galanodel',
  },
}

const meta = {
  title: 'Dashboard/Name Generator/Result Row',
  component: NameGeneratorResultRow,
  args: {
    result: FIXTURE_RESULT,
    rowKey: 'elvish-personal:full:story:0',
  },
} satisfies Meta<typeof NameGeneratorResultRow>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
