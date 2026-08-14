import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'

import {
  BUILDING_FACILITY_AUTHORING_GROUP_ENTRIES,
  BUILDING_FACILITY_TYPE_ENTRIES,
  BUILDING_FORM_ENTRIES,
  type BuildingFacilityType,
  type BuildingForm,
} from '@rpg/contracts'

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
