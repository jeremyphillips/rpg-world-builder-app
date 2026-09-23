import type { Meta, StoryObj } from '@storybook/react-vite'

import { CharacterConnectionAddModal } from './character-connection-add-modal'
import { connectionSheetDataFixture } from './connection-sheet-data.fixtures'

const noopAsync = async () => undefined

const meta = {
  title: 'Character/Detail/Connections/CharacterConnectionAddModal',
  component: CharacterConnectionAddModal,
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    sheetData: connectionSheetDataFixture,
    existingProjectionKinds: new Set<string>(),
    onOpenChange: () => undefined,
    onAddPerson: noopAsync,
    onAddOrganization: noopAsync,
    onAddPlace: noopAsync,
    onAddProperty: noopAsync,
  },
} satisfies Meta<typeof CharacterConnectionAddModal>

export default meta

type Story = StoryObj<typeof meta>

export const AddPerson: Story = {
  args: { sectionId: 'people' },
}

export const AddOrganization: Story = {
  args: { sectionId: 'organizations' },
}

export const AddPlace: Story = {
  args: { sectionId: 'places' },
}

export const AddProperty: Story = {
  args: { sectionId: 'property' },
}
