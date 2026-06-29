import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { sampleEpic } from '../test-fixtures'
import { EpicDetailForm } from './epic-detail-form'

const meta = {
  title: 'Bench/Epics/EpicDetailForm',
  component: EpicDetailForm,
} satisfies Meta<typeof EpicDetailForm>

export default meta
type Story = StoryObj<typeof meta>

function FormStory() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <EpicDetailForm epic={sampleEpic} />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

export const Default: Story = {
  args: { epic: sampleEpic },
  render: () => <FormStory />,
}
