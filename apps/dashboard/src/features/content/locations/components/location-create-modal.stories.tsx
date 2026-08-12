import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'

import { withDashboardProviders } from '../../../../../.storybook/decorators'
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { HARBORFORD } from '../fixtures'
import { LocationCreateModal, type LocationCreateModalProps } from './location-create-modal.client'

const buildingArgs = {
  open: true,
  onOpenChange: () => undefined,
  campaignId: STORY_CAMPAIGN_ID,
  intent: {
    authoringType: 'building',
    parentLocationId: HARBORFORD.id,
    parentKind: HARBORFORD.kind,
  },
  formOptionsCtx: {
    campaignId: STORY_CAMPAIGN_ID,
    options: { locationEntities: [] },
  },
} satisfies LocationCreateModalProps

async function continueBuildingStory(
  canvasElement: HTMLElement,
  selections: {
    form?: 'house'
    facilityGroup?: 'Browse all' | 'Production' | 'Religious'
    facility?: 'brewery' | 'temple'
    operator: 'none' | 'create'
  },
) {
  const canvas = within(canvasElement.ownerDocument.body)
  if (selections.form) {
    await userEvent.click(canvas.getByRole('radio', { name: (name) => name.startsWith('House') }))
  }
  const facilityGroup = selections.facilityGroup ?? 'Browse all'
  await userEvent.click(
    canvas.getByRole('radio', { name: (name) => name.startsWith(facilityGroup) }),
  )
  await userEvent.click(
    canvas.getByRole('radio', {
      name: selections.operator === 'create' ? 'Create an organization' : 'No organization',
    }),
  )
  await userEvent.click(canvas.getByRole('button', { name: 'Continue' }))
  if (selections.facility) {
    const facilityLabel = selections.facility === 'brewery' ? 'Brewery' : 'Temple'
    await userEvent.click(canvas.getByRole('combobox', { name: 'Facility type' }))
    await userEvent.click(
      canvas.getByRole('option', { name: (name) => name.startsWith(facilityLabel) }),
    )
  }
  const nameFields = await canvas.findAllByRole('textbox', { name: 'Name' })
  await expect(nameFields[0]).toBeVisible()
}

const meta = {
  title: 'Content/Locations/LocationCreateModal',
  component: LocationCreateModal,
  decorators: [withDashboardProviders],
} satisfies Meta<typeof LocationCreateModal>

export default meta
type Story = StoryObj<typeof LocationCreateModal>

export const BuildingSetup: Story = {
  args: buildingArgs,
}

export const HouseDetails: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, { form: 'house', operator: 'none' })
    await expect(
      within(canvasElement.ownerDocument.body).getByText('House · Browse all · No organization'),
    ).toBeVisible()
  },
}

export const BlacksmithDetails: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, { operator: 'create' })
    await expect(
      within(canvasElement.ownerDocument.body).getByText('Create organization'),
    ).toBeVisible()
  },
}

export const BreweryDetails: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      facilityGroup: 'Production',
      facility: 'brewery',
      operator: 'create',
    })
    await expect(
      within(canvasElement.ownerDocument.body).getByText('Production · Create organization'),
    ).toBeVisible()
  },
}

export const TempleDetails: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      facilityGroup: 'Religious',
      facility: 'temple',
      operator: 'create',
    })
    await expect(
      within(canvasElement.ownerDocument.body).getByText('Religious · Create organization'),
    ).toBeVisible()
  },
}

export const SettlementSetup: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    campaignId: STORY_CAMPAIGN_ID,
    intent: {
      authoringType: 'settlement',
      parentLocationId: HARBORFORD.id,
      parentKind: HARBORFORD.kind,
    },
  },
}

export const RegionSetup: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    campaignId: STORY_CAMPAIGN_ID,
    intent: {
      authoringType: 'region',
      parentLocationId: HARBORFORD.id,
      parentKind: HARBORFORD.kind,
    },
  },
}
