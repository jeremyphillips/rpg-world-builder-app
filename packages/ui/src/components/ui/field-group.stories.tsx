import type { Meta, StoryObj } from '@storybook/react-vite'

import { FieldGroup } from './field-group'
import { SelectField } from './select-field'
import { TextField } from './text-field'

const sampleFields = (
  <>
    <TextField id="demo-name" label="Name" placeholder="Tasha" />
    <SelectField
      id="demo-class"
      label="Class"
      placeholder="Choose a class"
      options={[
        { label: 'Wizard', value: 'wizard' },
        { label: 'Rogue', value: 'rogue' },
      ]}
    />
  </>
)

const meta = {
  title: 'Forms/Layout/FieldGroup',
  component: FieldGroup,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FieldGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    legend: 'Character basics',
    children: sampleFields,
  },
}

export const WithDescription: Story = {
  args: {
    legend: 'Character basics',
    description: 'These show on your character sheet header.',
    children: <TextField id="char-name-2" label="Name" placeholder="Tasha" />,
  },
}

/** Nested subgroup — smaller legend for groups inside another group. */
export const NestedSubgroup: Story = {
  args: {
    legend: 'Weapon',
    children: null,
  },
  render: () => (
    <FieldGroup legend="Weapon">
      <TextField id="weapon-name" label="Name" placeholder="Longsword" />
      <FieldGroup legend="Damage" legendSize="subsection">
        <TextField id="damage-dice" label="Dice" placeholder="1d8" />
      </FieldGroup>
    </FieldGroup>
  ),
}

export const InsetBorder: Story = {
  args: {
    legend: 'Effects & outcomes',
    description: 'Define what the spell does, then choose when each effect applies.',
    fieldsChrome: { variant: 'inset' },
    children: (
      <>
        <FieldGroup legend="Authored effects" legendSize="subsection">
          <TextField id="effect-label" label="Effect label" />
        </FieldGroup>
        <FieldGroup legend="Outcome branches" legendSize="subsection">
          <TextField id="branch-label" label="Branch label" />
        </FieldGroup>
      </>
    ),
  },
}

export const InsetPrimary: Story = {
  args: {
    legend: 'Effects',
    fieldsChrome: { variant: 'inset', tone: 'primary' },
    children: <TextField id="inset-primary" label="Effect" />,
  },
}

export const PanelMuted: Story = {
  args: {
    legend: 'Target',
    fieldsChrome: { variant: 'panel' },
    children: sampleFields,
  },
}

export const PanelTones: Story = {
  args: {
    legend: 'Panel tones',
    children: null,
  },
  render: () => (
    <div className="flex max-w-lg flex-col gap-8">
      <FieldGroup legend="Subtle (default)" fieldsChrome={{ variant: 'panel' }}>
        <TextField id="panel-subtle" label="Field" />
      </FieldGroup>
      <FieldGroup legend="Medium" fieldsChrome={{ variant: 'panel', tone: 'medium' }}>
        <TextField id="panel-medium" label="Field" />
      </FieldGroup>
      <FieldGroup legend="Solid" fieldsChrome={{ variant: 'panel', tone: 'base' }}>
        <TextField id="panel-solid" label="Field" />
      </FieldGroup>
      <FieldGroup legend="Elevated" fieldsChrome={{ variant: 'panel', tone: 'raised' }}>
        <TextField id="panel-elevated" label="Field" />
      </FieldGroup>
      <FieldGroup legend="Emphasis" fieldsChrome={{ variant: 'panel', tone: 'strong' }}>
        <TextField id="panel-emphasis" label="Field" />
      </FieldGroup>
      <FieldGroup legend="Informative" fieldsChrome={{ variant: 'panel', tone: 'informative' }}>
        <TextField id="panel-informative" label="Field" />
      </FieldGroup>
    </div>
  ),
}

export const OutlineTones: Story = {
  args: {
    legend: 'Outline tones',
    children: null,
  },
  render: () => (
    <div className="flex max-w-lg flex-col gap-8">
      <FieldGroup legend="Border (default)" fieldsChrome={{ variant: 'outline' }}>
        <TextField id="outline-border" label="Field" />
      </FieldGroup>
      <FieldGroup legend="Primary" fieldsChrome={{ variant: 'outline', tone: 'primary' }}>
        <TextField id="outline-primary" label="Field" />
      </FieldGroup>
      <FieldGroup legend="Warning" fieldsChrome={{ variant: 'outline', tone: 'warning' }}>
        <TextField id="outline-warning" label="Field" />
      </FieldGroup>
      <FieldGroup legend="Destructive" fieldsChrome={{ variant: 'outline', tone: 'destructive' }}>
        <TextField id="outline-destructive" label="Field" />
      </FieldGroup>
    </div>
  ),
}

export const DividerTop: Story = {
  args: {
    legend: 'Weapons',
    fieldsChrome: { variant: 'divider', edge: 'top' },
    children: sampleFields,
  },
}

export const DividerBottom: Story = {
  args: {
    legend: 'Defenses',
    fieldsChrome: { variant: 'divider', edge: 'bottom' },
    children: sampleFields,
  },
}

export const CalloutInfo: Story = {
  args: {
    legend: 'Hybrid spell',
    description: 'Resolution progression is authored on the resolution envelope.',
    fieldsChrome: { variant: 'callout', tone: 'info' },
    children: <TextField id="callout-field" label="Workaround note" />,
  },
}

export const CalloutWarning: Story = {
  args: {
    legend: 'Incomplete configuration',
    fieldsChrome: { variant: 'callout', tone: 'warning' },
    children: <TextField id="warning-field" label="Missing field" />,
  },
}

export const AccentTop: Story = {
  args: {
    legend: 'How it resolves',
    fieldsChrome: { variant: 'accent', edge: 'top', tone: 'primary' },
    children: <TextField id="accent-top" label="Method" />,
  },
}

export const AccentLegendRail: Story = {
  args: {
    legend: 'Authored effects',
    legendSize: 'subsection',
    fieldsChrome: { variant: 'accent', edge: 'legendRail', tone: 'primary' },
    children: <TextField id="accent-rail" label="Effect" />,
  },
}

export const Collapsible: Story = {
  args: {
    legend: 'Advanced options',
    description: 'Optional tuning for power users.',
    fieldsChrome: { variant: 'collapsible', defaultOpen: false },
    children: sampleFields,
  },
}

/** Mirrors resolution form Target + How it resolves panels and Effects inset. */
export const ResolutionLayout: Story = {
  args: {
    legend: 'Resolution layout',
    children: null,
  },
  render: () => (
    <div className="flex max-w-xl flex-col gap-6">
      <FieldGroup legend="Target" fieldsChrome={{ variant: 'panel' }}>
        <TextField id="resolution-target" label="Target kind" />
        <TextField id="resolution-count" label="Target count" />
      </FieldGroup>
      <FieldGroup legend="How it resolves" fieldsChrome={{ variant: 'panel' }}>
        <TextField id="resolution-method" label="Method" />
      </FieldGroup>
      <FieldGroup
        legend="Effects & outcomes"
        description="Define what the spell does, then choose when each effect applies."
        fieldsChrome={{ variant: 'inset' }}
      >
        <FieldGroup legend="Authored effects" legendSize="subsection">
          <TextField id="resolution-effect" label="Effect" />
        </FieldGroup>
        <FieldGroup
          legend="Outcome branches"
          legendSize="subsection"
          description="Choose which effects apply to each branch."
        >
          <TextField id="resolution-branch" label="Branch" />
        </FieldGroup>
      </FieldGroup>
    </div>
  ),
}

/** Class-proficiencies-style scan list with top dividers. */
export const LongFormDividers: Story = {
  args: {
    legend: 'Long form dividers',
    children: null,
  },
  render: () => (
    <div className="flex max-w-lg flex-col gap-2">
      <FieldGroup legend="Defenses">{sampleFields}</FieldGroup>
      <FieldGroup legend="Weapons" fieldsChrome={{ variant: 'divider', edge: 'top' }}>
        {sampleFields}
      </FieldGroup>
      <FieldGroup
        legend="Granted skills & tools"
        fieldsChrome={{ variant: 'divider', edge: 'top' }}
      >
        {sampleFields}
      </FieldGroup>
    </div>
  ),
}
