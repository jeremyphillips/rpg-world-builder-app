import type { Meta, StoryObj } from '@storybook/react-vite'

import { sampleEpic, sampleEpicTickets } from '../test-fixtures'
import { RecommendNextButton } from './recommend-next-button'

const meta = {
  title: 'Bench/Epics/RecommendNextButton',
  component: RecommendNextButton,
} satisfies Meta<typeof RecommendNextButton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    tickets: sampleEpicTickets,
    epics: [sampleEpic],
    epicId: sampleEpic.id,
    onSelectTicket: () => undefined,
  },
}

export const NoEligibleTickets: Story = {
  args: {
    tickets: sampleEpicTickets.map((ticket) => ({ ...ticket, status: 'done' as const })),
    epics: [sampleEpic],
    epicId: sampleEpic.id,
    onSelectTicket: () => undefined,
  },
}
