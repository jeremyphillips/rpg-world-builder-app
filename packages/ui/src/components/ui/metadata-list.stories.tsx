import type { Meta, StoryObj } from '@storybook/react-vite'

import { ClassReferenceTable } from '../../stories/semantic-classes/class-reference-table'
import { Text } from './text'
import { MetadataList } from './metadata-list'
import { METADATA_LIST_CLASS_SPECS } from './metadata-list.styles'

const spellItems = [
  { label: 'Level', value: '1st' },
  { label: 'School', value: 'Enchantment' },
  { label: 'Casting Time', value: '1 Action' },
  { label: 'Range', value: '30 ft.' },
  { label: 'Duration', value: '1 hour' },
  { label: 'Components', value: 'V, S' },
  { label: 'Ritual', value: 'No' },
  { label: 'Concentration', value: 'No' },
]

const meta = {
  title: 'Primitives/MetadataList',
  component: MetadataList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Aligned read-only metadata. size sets type and row gap. columnGap sets the column gap. valueTrack sets the columns. emphasis sets label/value color and weight. divider sets the bottom rule. Defaults match content stat lists: ruled, label emphasis, content track.',
      },
    },
  },
} satisfies Meta<typeof MetadataList>

export default meta
type Story = StoryObj<typeof meta>

export const SpellDetails: Story = {
  args: {
    size: 'sm',
    items: spellItems,
  },
}

export const RailFacts: Story = {
  args: {
    size: 'sm',
    columnGap: 'sm',
    valueTrack: 'fill',
    emphasis: 'value',
    divider: false,
    items: [
      { label: 'Hit die', value: 'd8' },
      { label: 'Primary ability', value: 'Strength' },
      { label: 'Saving throws', value: 'Strength, Constitution' },
    ],
  },
}

export const FileMetadata: Story = {
  args: {
    size: 'xs',
    columnGap: 'sm',
    valueTrack: 'fill',
    emphasis: 'value',
    divider: false,
    'aria-labelledby': 'file-heading',
    items: [
      { label: 'File name', value: 'crest-of-dawn.png' },
      { label: 'Dimensions', value: '1024 × 1024' },
      { label: 'File size', value: '240 KB' },
    ],
  },
}

export const CampaignReview: Story = {
  args: {
    emphasis: 'value',
    divider: false,
    items: [
      { label: 'Name', value: 'The Shattered Coast' },
      { label: 'Template', value: 'Frontier campaign' },
    ],
  },
}

export const AdminAccountSummary: Story = {
  args: {
    size: 'sm',
    emphasis: 'value',
    valueTrack: 'fill',
    divider: false,
    items: [
      { label: 'Access', value: 'Member' },
      { label: 'Joined', value: 'Mar 2, 2024' },
      { label: 'Last signed in', value: 'Oct 21, 2026' },
      { label: 'Last active', value: 'Today' },
    ],
  },
}

export const RichValue: Story = {
  args: {
    size: 'sm',
    emphasis: 'value',
    valueTrack: 'fill',
    divider: false,
    items: [
      {
        label: 'Campaigns',
        value: (
          <>
            2 owned, 1 joined
            <a href="#campaigns">View campaigns</a>
          </>
        ),
      },
      {
        label: 'Invitations',
        value: (
          <span className="flex flex-col gap-1">
            <span>Pending: 1</span>
            <span>Accepted, incomplete: 2</span>
          </span>
        ),
      },
    ],
  },
}

export const FillStress: Story = {
  args: {
    size: 'sm',
    columnGap: 'sm',
    valueTrack: 'fill',
    emphasis: 'value',
    divider: false,
    items: [
      {
        label: 'Unusually long metadata label',
        value: 'Short',
      },
      {
        label: 'Range',
        value:
          'A long value that must wrap inside the value column when the parent is only as wide as a preview rail.',
      },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-[17.5rem] border border-border-subtle p-3">
        <Story />
      </div>
    ),
  ],
}

export const ClassReference: Story = {
  args: { items: spellItems },
  tags: ['control-parity'],
  render: () => (
    <div className="space-y-3">
      <Text variant="supporting">
        size owns type and row gap. columnGap owns the column gap. valueTrack owns the columns.
        emphasis owns label and value color and weight. divider owns the bottom rule.
      </Text>
      <ClassReferenceTable
        rows={METADATA_LIST_CLASS_SPECS.map((spec) => ({
          key: spec.key,
          sample: (
            <div data-semantic-class-target className={spec.className}>
              {spec.useCase}
            </div>
          ),
          propsLabel: spec.key,
          className: spec.className,
          keyValues: spec.keyValues,
          useCase: spec.useCase,
        }))}
      />
    </div>
  ),
}
