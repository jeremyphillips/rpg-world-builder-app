import type { Meta, StoryObj } from '@storybook/react-vite'

import { NameGeneratorPage } from './name-generator-page.client'

const meta = {
  title: 'Dashboard/Name Generator/Page',
  component: NameGeneratorPage,
} satisfies Meta<typeof NameGeneratorPage>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
