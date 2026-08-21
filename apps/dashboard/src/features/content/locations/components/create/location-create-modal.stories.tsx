import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'

import {
  BUILDING_FACILITY_AUTHORING_GROUP_ENTRIES,
  BUILDING_FACILITY_TYPE_ENTRIES,
  BUILDING_FORM_ENTRIES,
  buildContentPurposeSelectors,
  type BuildingFacilityType,
  type BuildingForm,
} from '@rpg/contracts'

import { withDashboardProviders } from '../../../../../../.storybook/decorators'
import { STORY_CAMPAIGN_ID } from '../../../lib/fixtures/constants'
import { HARBORFORD } from '../../fixtures'
import { LocationCreateModal, type LocationCreateModalProps } from './location-create-modal'

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
    options: { locations: buildContentPurposeSelectors([]) },
  },
} satisfies LocationCreateModalProps

const civicGroupLabel = BUILDING_FACILITY_AUTHORING_GROUP_ENTRIES.civic.label

type BuildingFacilityGroup =
  | 'Browse all'
  | 'Production'
  | 'Religious'
  | 'Civic'
  | 'Residence'
  | 'Commercial'

async function continueBuildingStory(
  canvasElement: HTMLElement,
  selections: {
    form?: BuildingForm
    facilityGroup?: BuildingFacilityGroup
    facility?: BuildingFacilityType
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
    const facilityLabel = BUILDING_FACILITY_TYPE_ENTRIES[selections.facility].label
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
  parameters: {
    viewport: {
      defaultViewport: 'responsive',
    },
  },
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

export const KeepDetails: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, { form: 'keep' })
    await expect(
      within(canvasElement.ownerDocument.body).getByText('Keep · Browse all'),
    ).toBeVisible()
  },
}

export const OrganizationsTab: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {})
    const canvas = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('tab', { name: 'Organizations' }))
    await expect(canvas.getByText('No organization relationships added.')).toBeVisible()
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

export const WorkshopDetails: Story = {
  args: buildingArgs,
  tags: ['phase-20-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      facilityGroup: 'Production',
      facility: 'workshop',
    })
    await expect(within(canvasElement.ownerDocument.body).getByText('Production')).toBeVisible()
  },
}

export const OfficeDetails: Story = {
  args: buildingArgs,
  tags: ['phase-20-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      facilityGroup: 'Commercial',
      facility: 'office',
    })
    await expect(within(canvasElement.ownerDocument.body).getByText('Commercial')).toBeVisible()
  },
}

export const BakeryDetails: Story = {
  args: buildingArgs,
  tags: ['phase-20-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      facilityGroup: 'Production',
      facility: 'bakery',
    })
    await expect(within(canvasElement.ownerDocument.body).getByText('Production')).toBeVisible()
  },
}

export const AuctionHouseDetails: Story = {
  args: buildingArgs,
  tags: ['phase-20-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      facilityGroup: 'Commercial',
      facility: 'auction_house',
    })
    await expect(within(canvasElement.ownerDocument.body).getByText('Commercial')).toBeVisible()
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

export const HouseResidence: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      form: 'house',
      facilityGroup: 'Residence',
      facility: 'residence',
    })
    await expect(
      within(canvasElement.ownerDocument.body).getByText('House · Residence'),
    ).toBeVisible()
  },
}

export const TowerResidence: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      form: 'tower',
      facilityGroup: 'Residence',
      facility: 'residence',
    })
    await expect(
      within(canvasElement.ownerDocument.body).getByText('Tower · Residence'),
    ).toBeVisible()
  },
}

export const HallTownHall: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      form: 'hall',
      facilityGroup: 'Civic',
      facility: 'town_hall',
    })
    await expect(
      within(canvasElement.ownerDocument.body).getByText(`Hall · ${civicGroupLabel}`),
    ).toBeVisible()
  },
}

export const HallGuildhall: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      form: 'hall',
      facilityGroup: 'Civic',
      facility: 'guildhall',
    })
    await expect(
      within(canvasElement.ownerDocument.body).getByText(`Hall · ${civicGroupLabel}`),
    ).toBeVisible()
  },
}

export const KeepArmory: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      form: 'keep',
      facilityGroup: 'Civic',
      facility: 'armory',
    })
    await expect(
      within(canvasElement.ownerDocument.body).getByText(`Keep · ${civicGroupLabel}`),
    ).toBeVisible()
  },
}

export const TowerWatchPost: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      form: 'tower',
      facilityGroup: 'Civic',
      facility: 'watchtower',
    })
    await expect(
      within(canvasElement.ownerDocument.body).getByText(`Tower · ${civicGroupLabel}`),
    ).toBeVisible()
  },
}

export const TowerBeaconStation: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      form: 'tower',
      facilityGroup: 'Civic',
      facility: 'lighthouse',
    })
    await expect(
      within(canvasElement.ownerDocument.body).getByText(`Tower · ${civicGroupLabel}`),
    ).toBeVisible()
  },
}

export const KeepCheckpoint: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      form: 'keep',
      facilityGroup: 'Civic',
      facility: 'checkpoint',
    })
    await expect(
      within(canvasElement.ownerDocument.body).getByText(`Keep · ${civicGroupLabel}`),
    ).toBeVisible()
  },
}

export const HallArchive: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      form: 'hall',
      facilityGroup: 'Civic',
      facility: 'archive',
    })
    await expect(
      within(canvasElement.ownerDocument.body).getByText(`Hall · ${civicGroupLabel}`),
    ).toBeVisible()
  },
}

export const HallBathhouse: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      form: 'hall',
      facilityGroup: 'Civic',
      facility: 'bathhouse',
    })
    await expect(
      within(canvasElement.ownerDocument.body).getByText('Hall · Bathhouse'),
    ).toBeVisible()
  },
}

export const HouseBathhouse: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      form: 'house',
      facilityGroup: 'Commercial',
      facility: 'bathhouse',
    })
    await expect(
      within(canvasElement.ownerDocument.body).getByText('House · Bathhouse'),
    ).toBeVisible()
  },
}

export const TowerObservatory: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      form: 'tower',
      facilityGroup: 'Civic',
      facility: 'observatory',
    })
    await expect(
      within(canvasElement.ownerDocument.body).getByText('Tower · Observatory'),
    ).toBeVisible()
  },
}

export const HallObservatory: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      form: 'hall',
      facilityGroup: 'Civic',
      facility: 'observatory',
    })
    await expect(
      within(canvasElement.ownerDocument.body).getByText('Hall · Observatory'),
    ).toBeVisible()
  },
}

export const HallEmbassy: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      form: 'hall',
      facilityGroup: 'Civic',
      facility: 'embassy',
    })
    await expect(within(canvasElement.ownerDocument.body).getByText('Hall · Embassy')).toBeVisible()
  },
}

export const HouseEmbassy: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      form: 'house',
      facilityGroup: 'Civic',
      facility: 'embassy',
    })
    await expect(
      within(canvasElement.ownerDocument.body).getByText('House · Embassy'),
    ).toBeVisible()
  },
}

export const HouseSchoolhouse: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      form: 'house',
      facilityGroup: 'Civic',
      facility: 'schoolhouse',
    })
    await expect(
      within(canvasElement.ownerDocument.body).getByText('House · Schoolhouse'),
    ).toBeVisible()
  },
}

export const HouseBarn: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      form: 'house',
      facilityGroup: 'Production',
      facility: 'barn',
    })
    await expect(within(canvasElement.ownerDocument.body).getByText('House · Barn')).toBeVisible()
  },
}

export const FormUnspecifiedGranary: Story = {
  args: buildingArgs,
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      facilityGroup: 'Production',
      facility: 'granary',
    })
    await expect(within(canvasElement.ownerDocument.body).getByText('Granary')).toBeVisible()
  },
}

export const HouseGranary: Story = {
  args: buildingArgs,
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      form: 'house',
      facilityGroup: 'Production',
      facility: 'granary',
    })
    await expect(
      within(canvasElement.ownerDocument.body).getByText('House · Granary'),
    ).toBeVisible()
  },
}

export const FormUnspecifiedGreenhouse: Story = {
  args: buildingArgs,
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      facilityGroup: 'Production',
      facility: 'greenhouse',
    })
    await expect(within(canvasElement.ownerDocument.body).getByText('Greenhouse')).toBeVisible()
  },
}

export const HallGreenhouse: Story = {
  args: buildingArgs,
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      form: 'hall',
      facilityGroup: 'Production',
      facility: 'greenhouse',
    })
    await expect(
      within(canvasElement.ownerDocument.body).getByText('Hall · Greenhouse'),
    ).toBeVisible()
  },
}

export const FormUnspecifiedArena: Story = {
  args: buildingArgs,
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      facilityGroup: 'Civic',
      facility: 'arena',
    })
    await expect(within(canvasElement.ownerDocument.body).getByText('Arena')).toBeVisible()
  },
}

export const HallArena: Story = {
  args: buildingArgs,
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      form: 'hall',
      facilityGroup: 'Civic',
      facility: 'arena',
    })
    await expect(within(canvasElement.ownerDocument.body).getByText('Hall · Arena')).toBeVisible()
  },
}

export const KeepArena: Story = {
  args: buildingArgs,
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      form: 'keep',
      facilityGroup: 'Civic',
      facility: 'arena',
    })
    await expect(within(canvasElement.ownerDocument.body).getByText('Keep · Arena')).toBeVisible()
  },
}

export const HallWatchPost: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      form: 'hall',
      facilityGroup: 'Civic',
      facility: 'watchtower',
    })
    await expect(
      within(canvasElement.ownerDocument.body).getByText(`Hall · ${civicGroupLabel}`),
    ).toBeVisible()
  },
}

export const HallBeaconStation: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      form: 'hall',
      facilityGroup: 'Civic',
      facility: 'lighthouse',
    })
    await expect(
      within(canvasElement.ownerDocument.body).getByText(`Hall · ${civicGroupLabel}`),
    ).toBeVisible()
  },
}

export const HouseCheckpoint: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      form: 'house',
      facilityGroup: 'Civic',
      facility: 'checkpoint',
    })
    await expect(
      within(canvasElement.ownerDocument.body).getByText(`House · ${civicGroupLabel}`),
    ).toBeVisible()
  },
}

export const KeepLibrary: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      form: 'keep',
      facilityGroup: 'Civic',
      facility: 'library',
    })
    await expect(
      within(canvasElement.ownerDocument.body).getByText(`Keep · ${civicGroupLabel}`),
    ).toBeVisible()
  },
}

export const FormUnspecifiedWatchPost: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      facilityGroup: 'Civic',
      facility: 'watchtower',
    })
    await expect(within(canvasElement.ownerDocument.body).getByText(civicGroupLabel)).toBeVisible()
  },
}

export const FormUnspecifiedBeaconStation: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      facilityGroup: 'Civic',
      facility: 'lighthouse',
    })
    await expect(within(canvasElement.ownerDocument.body).getByText(civicGroupLabel)).toBeVisible()
  },
}

export const TowerTownHall: Story = {
  args: buildingArgs,
  tags: ['phase-7-building-flows'],
  play: async ({ canvasElement }) => {
    await continueBuildingStory(canvasElement, {
      form: 'tower',
      facilityGroup: 'Civic',
      facility: 'town_hall',
    })
    await expect(
      within(canvasElement.ownerDocument.body).getByText(`Tower · ${civicGroupLabel}`),
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
