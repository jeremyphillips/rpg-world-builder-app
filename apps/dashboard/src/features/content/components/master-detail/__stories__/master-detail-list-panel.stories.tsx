import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@rpg/ui'
import {
  formDockedActionsBarClasses,
  formStickyScrollBodyClasses,
  formStickyScrollShellWithDockedFooterClasses,
  formStickyTabsClasses,
} from '@rpg/ui/form'

import { CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN } from '../../../classes/lib/class-feature-form-labels'
import { MasterDetailGrid } from '../master-detail-grid'
import { MasterDetailListPanel } from '../master-detail-list-panel'

const meta = {
  title: 'Content/MasterDetailListPanel',
  component: MasterDetailListPanel,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <MasterDetailGrid>
        <Story />
      </MasterDetailGrid>
    ),
  ],
} satisfies Meta<typeof MasterDetailListPanel>

export default meta
type Story = StoryObj<typeof meta>

const items = [
  { id: 'a', title: 'Rage', meta: { eyebrow: 'Level 1', sourceLabel: 'System' } },
  { id: 'b', title: 'Unarmored Defense', meta: { eyebrow: 'Level 1', sourceLabel: 'Homebrew' } },
  { id: 'c', title: 'Reckless Attack', meta: { eyebrow: 'Level 2', sourceLabel: 'Homebrew' } },
]

const longItems = Array.from({ length: 20 }, (_, index) => ({
  id: `feature-${index}`,
  title: `Feature ${index + 1}`,
  meta: { eyebrow: `Level ${index + 1}`, sourceLabel: 'Homebrew' as const },
}))

export const Default: Story = {
  args: {
    items,
    selectedIndex: 0,
    listTitle: 'Features',
    ariaLabel: 'Features',
    addLabel: 'Add feature',
    itemNoun: CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN,
    onAdd: () => {},
    onSelect: () => {},
  },
}

export const LongCollection: Story = {
  args: {
    items: longItems,
    selectedIndex: 0,
    listTitle: 'Features',
    ariaLabel: 'Features',
    addLabel: 'Add feature',
    itemNoun: CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN,
    onAdd: () => {},
    onSelect: () => {},
    countSupplement: <span>20 available</span>,
  },
}

export const ConstrainedViewport: Story = {
  decorators: [
    (Story) => (
      <div className="h-64 [--master-detail-list-max-block-size:12rem]">
        <MasterDetailGrid>
          <Story />
        </MasterDetailGrid>
      </div>
    ),
  ],
  args: {
    items: longItems,
    selectedIndex: 0,
    listTitle: 'Features',
    ariaLabel: 'Features',
    addLabel: 'Add feature',
    itemNoun: CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN,
    onAdd: () => {},
    onSelect: () => {},
    countSupplement: <span>20 available</span>,
  },
}

export const WithStickyFormFooter: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="flex h-[32rem] min-h-0 flex-col overflow-hidden bg-background">
      <div className={formStickyScrollShellWithDockedFooterClasses}>
        <div className={formStickyScrollBodyClasses}>
          <div className="p-6">
            <div
              className={`${formStickyTabsClasses} mb-4 flex h-[var(--rpg-form-sticky-tabs-block-size,3rem)] items-center rounded-md border border-border px-3 text-sm text-muted-foreground`}
            >
              Dummy section tabs
            </div>
            <MasterDetailGrid>
              <MasterDetailListPanel {...args} />
              <div className="self-start rounded-lg border border-border-subtle px-4 py-3 text-sm text-muted-foreground md:col-span-2">
                Detail column stays content-sized beside the bounded list rail.
              </div>
            </MasterDetailGrid>
          </div>
        </div>
        <div className={formDockedActionsBarClasses}>
          <div className="flex justify-end px-6">
            <Button type="button">Save changes</Button>
          </div>
        </div>
      </div>
    </div>
  ),
  args: {
    items: longItems,
    selectedIndex: 0,
    listTitle: 'Features',
    ariaLabel: 'Features',
    addLabel: 'Add feature',
    itemNoun: CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN,
    onAdd: () => {},
    onSelect: () => {},
    countSupplement: <span>20 available</span>,
  },
}

export const WithProtectedSystemRow: Story = {
  args: {
    items: [
      {
        id: 'a',
        title: 'Rage',
        meta: { eyebrow: 'Level 1', sourceLabel: 'System' },
        deletable: false,
      },
      {
        id: 'b',
        title: 'Custom Fury',
        meta: { eyebrow: 'Level 3', sourceLabel: 'Homebrew' },
      },
      {
        id: 'c',
        title: 'Legacy Option',
        meta: { eyebrow: 'Level 5', sourceLabel: 'System' },
        active: false,
        availabilityStatusLabel: 'Unavailable',
        deletable: false,
      },
    ],
    selectedIndex: 0,
    listTitle: 'Features',
    ariaLabel: 'Features',
    addLabel: 'Add feature',
    itemNoun: CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN,
    onAdd: () => {},
    onSelect: () => {},
  },
}

export const Empty: Story = {
  args: {
    items: [],
    selectedIndex: null,
    listTitle: 'Features',
    ariaLabel: 'Features',
    addLabel: 'Add feature',
    itemNoun: CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN,
    onAdd: () => {},
    onSelect: () => {},
  },
}
