import type { Meta, StoryObj } from '@storybook/react-vite'

import { withDashboardProviders } from '../../../../../../.storybook/decorators'
import { CharacterConnectionEditModal } from './character-connection-edit-modal'
import {
  connectionSheetDataFixture,
  organizationMembershipProjectionFixture,
  personProjectionFixture,
  residenceProjectionFixture,
} from './connection-sheet-data.fixtures'

const noopAsync = async () => undefined

const meta = {
  title: 'Character/Detail/Connections/CharacterConnectionEditModal',
  component: CharacterConnectionEditModal,
  decorators: [withDashboardProviders],
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    sheetData: connectionSheetDataFixture,
    onOpenChange: () => undefined,
    onSave: noopAsync,
    onRemove: noopAsync,
  },
} satisfies Meta<typeof CharacterConnectionEditModal>

export default meta

type Story = StoryObj<typeof meta>

export const EditOrganizationMembership: Story = {
  args: { row: organizationMembershipProjectionFixture },
}

export const EditPersonRelationship: Story = {
  args: { row: personProjectionFixture },
}

export const EditResidence: Story = {
  args: { row: residenceProjectionFixture },
}
