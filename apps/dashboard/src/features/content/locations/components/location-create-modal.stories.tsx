import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'

import { BUILDING_FORM_ENTRIES, type BuildingForm } from '@rpg/contracts'

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
    form?: BuildingForm
    facilityGroup?: 'Browse all' | 'Production' | 'Religious' | 'Civic' | 'Residence'
    facility?: 'brewery' | 'temple' | 'town_hall' | 'residence'
  },
) {
  const canvas = within(canvasElement.ownerDocument.body)
  if (selections.form) {
    const formLabel = BUILDING_FORM_ENTRIES[selections.form].label
    await userEvent.click(canvas.getByRole('radio', { name: (name) => name.startsWith(formLabel) }))
  }
  const facilityGroup = selections.facilityGroup ?? 'Browse all'
  await userEvent.click(
    canvas.getByRole('radio', { name: (name) => name.startsWith(facilityGroup) }),
  )
  await userEvent.click(canvas.getByRole('button', { name: 'Continue' }))
  if (selections.facility) {
    const facilityLabel =
      selections.facility === 'brewery'
        ? 'Brewery'
        : selections.facility === 'temple'
          ? 'Temple'
          : selections.facility === 'town_hall'
            ? 'Town hall'
            : 'Residence'
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
    await continueBuildingStory(canvasElement, { form: 'house' })
    await expect(
      within(canvasElement.ownerDocument.body).getByText('House · Browse all'),
    ).toBeVisible()
  },
}

export const TowerDetails: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, { form: 'tower' })
    await expect(
      within(canvasElement.ownerDocument.body).getByText('Tower · Browse all'),
    ).toBeVisible()
  },
}

export const HallDetails: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, { form: 'hall' })
    await expect(
      within(canvasElement.ownerDocument.body).getByText('Hall · Browse all'),
    ).toBeVisible()
  },
}

export const OrganizationsTab: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {})
    const canvas = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('tab', { name: 'Organizations (optional)' }))
    await expect(canvas.getByText('No Organization relationships will be created.')).toBeVisible()
  },
}

export const BreweryDetails: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      facilityGroup: 'Production',
      facility: 'brewery',
    })
    await expect(within(canvasElement.ownerDocument.body).getByText('Production')).toBeVisible()
  },
}

export const TempleDetails: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      facilityGroup: 'Religious',
      facility: 'temple',
    })
    await expect(within(canvasElement.ownerDocument.body).getByText('Religious')).toBeVisible()
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
