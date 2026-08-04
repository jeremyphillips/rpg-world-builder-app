import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'
import { expect, userEvent, within } from 'storybook/test'

import { STORY_CAMPAIGN_ID } from '@/features/content/lib/fixtures/constants'

import { LocationPartyAssociationsSection } from './location-party-associations-section.client'
import {
  LOCATION_PARTY_ASSOCIATIONS_FIELD,
  LOCATION_PARTY_CHOOSE_RELATIONSHIP_LIST_MESSAGE,
  LOCATION_PARTY_EMPTY_TEXT,
  LOCATION_PARTY_SECTION_DESCRIPTION,
  LOCATION_PARTY_SEARCH_DISABLED_PLACEHOLDER,
} from '../lib/location-party-associations.lib'
import type { LocationAuthoringType } from '../lib/location-authoring-type'

function SectionStory({ authoringType = 'building' }: { authoringType?: LocationAuthoringType }) {
  const form = useForm({
    defaultValues: {
      authoringType,
      [LOCATION_PARTY_ASSOCIATIONS_FIELD]: [],
    },
  })

  return (
    <FormProvider {...form}>
      <LocationPartyAssociationsSection campaignId={STORY_CAMPAIGN_ID} />
    </FormProvider>
  )
}

const meta = {
  title: 'Dashboard/Content/Locations/LocationPartyAssociationsSection',
  component: LocationPartyAssociationsSection,
  render: () => <SectionStory />,
} satisfies Meta<typeof LocationPartyAssociationsSection>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {
  render: () => <SectionStory authoringType="building" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(LOCATION_PARTY_SECTION_DESCRIPTION)).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: 'Add relationship' })).toBeInTheDocument()
    await expect(canvas.getByText(LOCATION_PARTY_EMPTY_TEXT)).toBeInTheDocument()
  },
}

export const OpensPicker: Story = {
  render: () => <SectionStory authoringType="building" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Add relationship' }))

    const dialog = canvas.getByRole('dialog')
    await expect(
      within(dialog).getByRole('heading', { name: 'Add relationship' }),
    ).toBeInTheDocument()
    await expect(within(dialog).getByText('Choose relationship…')).toBeInTheDocument()

    const search = within(dialog).getByRole('searchbox', {
      name: LOCATION_PARTY_SEARCH_DISABLED_PLACEHOLDER,
    })
    expect(search).toBeDisabled()

    const relationshipLabel = within(dialog).getByText('Relationship')
    expect(
      relationshipLabel.compareDocumentPosition(search) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()

    await expect(within(dialog).getByRole('button', { name: 'Characters' })).toBeDisabled()
    await expect(within(dialog).getByRole('button', { name: 'Organizations' })).toBeDisabled()
    await expect(
      within(dialog).getByText(LOCATION_PARTY_CHOOSE_RELATIONSHIP_LIST_MESSAGE),
    ).toBeInTheDocument()
  },
}
