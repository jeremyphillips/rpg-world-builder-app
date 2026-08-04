import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { expect, userEvent, within } from 'storybook/test'

import { STORY_CAMPAIGN_ID } from '@/features/content/lib/fixtures/constants'

import { LocationPartyAssociationsSection } from './location-party-associations-section.client'
import { LOCATION_PARTY_ASSOCIATIONS_FIELD } from '../lib/location-party-associations.lib'

function SectionStory() {
  const form = useForm({
    defaultValues: {
      [LOCATION_PARTY_ASSOCIATIONS_FIELD]: [],
    },
  })

  return (
    <FormProvider {...form}>
      <LocationPartyAssociationsSection />
    </FormProvider>
  )
}

const meta = {
  title: 'Dashboard/Content/Locations/LocationPartyAssociationsSection',
  component: LocationPartyAssociationsSection,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={[`/campaigns/${STORY_CAMPAIGN_ID}/content/locations/new`]}>
        <Routes>
          <Route path="/campaigns/:campaignId/content/locations/new" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
  render: () => <SectionStory />,
} satisfies Meta<typeof LocationPartyAssociationsSection>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('People & organizations')).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: 'Add relationship' })).toBeInTheDocument()
  },
}

export const OpensPicker: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Add relationship' }))
    await expect(
      canvas.getByText('Add relationship', { selector: 'h2, [role="dialog"] *' }),
    ).toBeTruthy()
  },
}
