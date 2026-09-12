import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { masterDetailEmptySelectionLabel } from '../../../lib/master-detail/master-detail-constants'
import type { UseMasterDetailArrayResult } from '../../../lib/master-detail/use-master-detail-array'
import { MasterDetailEditorPanel } from '../master-detail-editor-panel'

const itemFields = [{ type: 'text' as const, name: 'name', label: 'Name', required: true }]

const selectedEditor: UseMasterDetailArrayResult = {
  fields: [{ id: 'field-a' }, { id: 'field-b' }],
  selectedFieldId: 'field-a',
  selectedIndex: 0,
  select: () => {},
  handleAdd: () => {},
  lastAddedFieldId: null,
  clearLastAddedFieldId: () => {},
  deleteIndex: null,
  requestRemove: () => {},
  cancelRemove: () => {},
  confirmRemove: () => {},
  hasRowError: () => false,
  autoSelectFirstInvalid: () => {},
  move: () => {},
  moveUp: () => {},
  moveDown: () => {},
  normalizeOrder: () => {},
}

const unselectedEditor: UseMasterDetailArrayResult = {
  ...selectedEditor,
  selectedFieldId: null,
  selectedIndex: null,
}

function PanelStory({
  editor,
  showValidationBanner,
}: {
  editor: UseMasterDetailArrayResult
  showValidationBanner: boolean
}) {
  const form = useForm({
    defaultValues: { traits: [{ name: 'Rage' }, { name: 'Reckless Attack' }] },
  })
  return (
    <FormProvider {...form}>
      <MasterDetailEditorPanel
        editor={editor}
        itemFields={itemFields}
        fieldName="traits"
        idPrefix="class-feature"
        itemNoun="feature"
        selectedIdentity={{
          title: 'Rage',
          meta: { eyebrow: 'Level 1', sourceLabel: 'System' },
          deletable: true,
        }}
        showValidationBanner={showValidationBanner}
        emptySelectionLabel={masterDetailEmptySelectionLabel('feature')}
      />
    </FormProvider>
  )
}

const meta = {
  title: 'Content/MasterDetailEditorPanel',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj

export const SelectedRow: Story = {
  render: () => <PanelStory editor={selectedEditor} showValidationBanner={false} />,
}

export const EmptySelection: Story = {
  render: () => <PanelStory editor={unselectedEditor} showValidationBanner={false} />,
}

export const ValidationBanner: Story = {
  render: () => <PanelStory editor={unselectedEditor} showValidationBanner />,
}
