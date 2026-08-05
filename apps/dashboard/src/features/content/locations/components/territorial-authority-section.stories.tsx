import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'
import { expect, userEvent, within } from 'storybook/test'

import { STORY_CAMPAIGN_ID } from '@/features/content/lib/fixtures/constants'

import { TerritorialAuthoritySection } from './territorial-authority-section.client'
import {
  TERRITORIAL_AUTHORITY_ADD_LABEL,
  TERRITORIAL_AUTHORITY_CHOOSE_KIND_LIST_MESSAGE,
  TERRITORIAL_AUTHORITY_EMPTY_TEXT,
  TERRITORIAL_AUTHORITY_FIELD,
  TERRITORIAL_AUTHORITY_SECTION_DESCRIPTION,
  TERRITORIAL_AUTHORITY_SEARCH_DISABLED_PLACEHOLDER,
} from '../lib/territorial-authority.lib'

function SectionStory() {
  const form = useForm({
    defaultValues: {
      authoringType: 'region',
      [TERRITORIAL_AUTHORITY_FIELD]: [],
    },
  })

  return (
    <FormProvider {...form}>
      <TerritorialAuthoritySection campaignId={STORY_CAMPAIGN_ID} />
    </FormProvider>
  )
}

const meta = {
  title: 'Dashboard/Content/Locations/TerritorialAuthoritySection',
  component: TerritorialAuthoritySection,
  render: () => <SectionStory />,
} satisfies Meta<typeof TerritorialAuthoritySection>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(TERRITORIAL_AUTHORITY_SECTION_DESCRIPTION)).toBeInTheDocument()
    await expect(
      canvas.getByRole('button', { name: TERRITORIAL_AUTHORITY_ADD_LABEL }),
    ).toBeInTheDocument()
    await expect(canvas.getByText(TERRITORIAL_AUTHORITY_EMPTY_TEXT)).toBeInTheDocument()
  },
}

export const OpensPicker: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: TERRITORIAL_AUTHORITY_ADD_LABEL }))

    const dialog = canvas.getByRole('dialog')
    await expect(
      within(dialog).getByRole('heading', { name: 'Add territorial authority' }),
    ).toBeInTheDocument()

    const search = within(dialog).getByRole('searchbox', {
      name: TERRITORIAL_AUTHORITY_SEARCH_DISABLED_PLACEHOLDER,
    })
    expect(search).toBeDisabled()
    await expect(
      within(dialog).getByText(TERRITORIAL_AUTHORITY_CHOOSE_KIND_LIST_MESSAGE),
    ).toBeInTheDocument()
  },
}
