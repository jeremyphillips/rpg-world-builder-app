import type { Meta, StoryObj } from '@storybook/react-vite'

import { ReviewAdvisoryWarnings } from './review-advisory-warnings'

const meta = {
  title: 'Character Builder/ReviewAdvisoryWarnings',
  component: ReviewAdvisoryWarnings,
} satisfies Meta<typeof ReviewAdvisoryWarnings>

export default meta
type Story = StoryObj<typeof ReviewAdvisoryWarnings>

export const WithNotes: Story = {
  args: {
    notes: ['Unarmored Defense may change AC; not reflected in preview.'],
  },
}

export const WithAdvisoriesAndNotes: Story = {
  args: {
    advisories: [
      {
        code: 'equipment_not_proficient',
        subject: {
          kind: 'equipment',
          equipmentId: 'srd-cc-5.2.1:greatsword',
          label: 'Greatsword',
          equipmentClass: 'weapon',
        },
      },
    ],
    notes: ['Unarmored Defense may change AC; not reflected in preview.'],
  },
}

export const Empty: Story = {
  args: {
    notes: [],
  },
}
