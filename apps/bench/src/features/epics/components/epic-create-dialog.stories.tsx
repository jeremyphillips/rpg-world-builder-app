import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { CreateEpicDialog } from './epic-create-dialog'

const meta = {
  title: 'Bench/Epics/CreateEpicDialog',
  component: CreateEpicDialog,
} satisfies Meta<typeof CreateEpicDialog>

export default meta
type Story = StoryObj<typeof meta>

function DialogStory() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <CreateEpicDialog />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

export const Default: Story = {
  render: () => <DialogStory />,
}
