import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { ClassReferenceTable } from '../../stories/semantic-classes/class-reference-table'
import { Checkbox } from './checkbox.client'
import { CHOICE_CONTROL_KIND_SPECS, UI_CHOICE_CONTROL_BLOCK_CLASS } from './choice-control.styles'
import { checkboxControlClasses } from './choice-control.variants'

const meta = {
  title: 'Forms/Controls/Checkbox',
  component: Checkbox,
  parameters: {
    semanticClasses: true,
    docs: {
      description: {
        component: `${UI_CHOICE_CONTROL_BLOCK_CLASS} with \`ui-choice-control--checkbox\` owns indicator geometry and checked fill in choice-control.css.`,
      },
    },
  },
  args: { 'aria-label': 'Accept terms' },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Checked: Story = { args: { defaultChecked: true } }

export const Error: Story = { args: { 'aria-invalid': true } }

export const Disabled: Story = { args: { disabled: true, defaultChecked: true } }

export const ClassReference: Story = {
  tags: ['control-parity'],
  parameters: { semanticClasses: true },
  render: () => {
    const spec = CHOICE_CONTROL_KIND_SPECS.find((entry) => entry.kind === 'checkbox')!
    return (
      <ClassReferenceTable
        rows={[
          {
            key: spec.kind,
            sample: <Checkbox aria-label="Reference" data-semantic-class-target defaultChecked />,
            propsLabel: 'Checkbox',
            className: checkboxControlClasses(),
            keyValues: `control size: ${spec.controlSize}`,
            useCase: spec.useCase,
          },
        ]}
      />
    )
  },
}

export const ToneSuccess: Story = { args: { defaultChecked: true, tone: 'success' } }

export const ToneWarning: Story = { args: { defaultChecked: true, tone: 'warning' } }

export const ToneDestructive: Story = { args: { defaultChecked: true, tone: 'destructive' } }

export const CircleUnchecked: Story = {
  args: { appearance: 'circle', tone: 'success', 'aria-label': 'Equip longsword' },
}

export const CircleChecked: Story = {
  args: {
    appearance: 'circle',
    tone: 'success',
    'aria-label': 'Unequip longsword',
    defaultChecked: true,
  },
}

export const CircleCheckedDisabled: Story = {
  args: {
    appearance: 'circle',
    tone: 'success',
    'aria-label': 'Equipped longsword',
    defaultChecked: true,
    disabled: true,
  },
}

export const CircleInvalid: Story = {
  args: { appearance: 'circle', tone: 'success', 'aria-label': 'Equip item', 'aria-invalid': true },
}

const cardChromeClasses =
  'flex flex-wrap items-center gap-6 rounded-lg border border-border bg-card p-6'

function CircleOnCardRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-style-caption">{label}</span>
      {children}
    </div>
  )
}

/** Rest / hover / focus on the same surface as entity equipment rows (`bg-card`). */
export const CircleOnCardSurface: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Hover and Tab through each control: rest shows only the 16px indicator; hover adds a 24px lift fill and border; focus uses the default standalone ring (`--ui-focus-ring-standalone`).',
      },
    },
  },
  render: () => (
    <div className={cardChromeClasses}>
      <CircleOnCardRow label="Unchecked">
        <Checkbox appearance="circle" tone="success" aria-label="Equip item" />
      </CircleOnCardRow>
      <CircleOnCardRow label="Checked">
        <Checkbox appearance="circle" tone="success" aria-label="Unequip item" defaultChecked />
      </CircleOnCardRow>
      <CircleOnCardRow label="Checked disabled">
        <Checkbox
          appearance="circle"
          tone="success"
          aria-label="Equipped item"
          defaultChecked
          disabled
        />
      </CircleOnCardRow>
      <CircleOnCardRow label="Focus (Tab here)">
        <Checkbox
          appearance="circle"
          tone="success"
          aria-label="Focus demo checked"
          defaultChecked
          autoFocus
        />
      </CircleOnCardRow>
    </div>
  ),
}

/** Hover and keyboard focus expand the same checkbox into Equip / Unequip. */
export const CircleExpandOnCard: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Resting footprint stays 24px. Hover or Tab reveals the action word to the right. The embedded focus ring follows the pill. Disabled stays collapsed.',
      },
    },
  },
  render: () => (
    <div className="flex max-w-sm flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex min-w-0 items-center gap-1">
        <span className="min-w-0 truncate text-style-label">Battleaxe</span>
        <Checkbox
          appearance="circle"
          tone="success"
          focusContext="embedded"
          expandLabel="Unequip"
          expandLabelReserve="Equip"
          aria-label="Equipped: Battleaxe"
          defaultChecked
        />
        <span className="ms-auto text-style-caption">Rest / hover</span>
      </div>
      <div className="flex min-w-0 items-center gap-1">
        <span className="min-w-0 truncate text-style-label">
          +1 Flaming Battleaxe of Very Long Names
        </span>
        <Checkbox
          appearance="circle"
          tone="success"
          focusContext="embedded"
          expandLabel="Equip"
          expandLabelReserve="Unequip"
          aria-label="Equipped: +1 Flaming Battleaxe of Very Long Names"
        />
        <button type="button" className="text-style-caption">
          Edit
        </button>
      </div>
      <div className="flex min-w-0 items-center justify-end gap-1">
        <span className="min-w-0 truncate text-style-label">Edge</span>
        <Checkbox
          appearance="circle"
          tone="success"
          focusContext="embedded"
          expandLabel="Unequip"
          expandLabelReserve="Equip"
          aria-label="Equipped: Edge"
          defaultChecked
        />
      </div>
      <div className="flex min-w-0 items-center gap-1">
        <span className="text-style-label">Disabled</span>
        <Checkbox
          appearance="circle"
          tone="success"
          focusContext="embedded"
          expandLabel="Unequip"
          expandLabelReserve="Equip"
          aria-label="Equipped: Disabled"
          defaultChecked
          disabled
        />
      </div>
    </div>
  ),
}

/** Dense heading inline slot — embedded focus avoids standalone ring bleed into truncated titles. */
export const CircleEmbeddedInHeading: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Mirrors entity `headingInline` (`gap-1`, truncated title). Use `focusContext="embedded"` for dense inline chrome; spacious layouts keep the default standalone ring.',
      },
    },
  },
  render: () => (
    <div className={cardChromeClasses}>
      <div className="flex min-w-0 max-w-xs items-center gap-1">
        <span className="min-w-0 truncate text-style-label">
          +1 Flaming Battleaxe of Very Long Names
        </span>
        <span className="inline-flex shrink-0 self-center">
          <Checkbox
            appearance="circle"
            tone="success"
            focusContext="embedded"
            aria-label="Unequip +1 Flaming Battleaxe of Very Long Names"
            defaultChecked
          />
        </span>
      </div>
      <div className="flex min-w-0 max-w-xs items-center gap-1">
        <span className="min-w-0 truncate text-style-label">
          +1 Flaming Battleaxe of Very Long Names
        </span>
        <span className="inline-flex shrink-0 self-center">
          <Checkbox
            appearance="circle"
            tone="success"
            focusContext="standalone"
            aria-label="Standalone focus comparison"
            defaultChecked
            autoFocus
          />
        </span>
      </div>
    </div>
  ),
}
