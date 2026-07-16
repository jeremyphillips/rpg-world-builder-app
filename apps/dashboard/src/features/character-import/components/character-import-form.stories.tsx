import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { CharacterImportForm } from './character-import-form.client'

const meta = {
  title: 'Dashboard/Character Import/Form',
  component: CharacterImportForm,
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof CharacterImportForm>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
