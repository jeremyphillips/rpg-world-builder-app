import type { Meta, StoryObj } from '@storybook/react-vite'

import { ClassReferenceTable } from '../../stories/semantic-classes/class-reference-table'
import { Button } from './button.client'
import { Alert } from './alert'
import { ALERT_CLASS_SPECS, ALERT_DENSITIES, ALERT_VARIANTS } from './alert.variants'

const meta = {
  title: 'Primitives/Alert',
  component: Alert,
  parameters: { semanticClasses: true },
  args: {
    title: 'Subclass choices are disabled',
    description:
      'This feature is saved, but characters will not be prompted to choose a subclass until subclasses are enabled.',
  },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Multiclassing is disabled',
    description: 'Species rules that depend on multiclassing are inactive for this campaign.',
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Changes saved',
    description: 'Your class features were updated successfully.',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Subclass choices are disabled',
    description:
      'This feature is saved, but characters will not be prompted to choose a subclass until subclasses are enabled.',
    actions: <Button size="sm">Enable subclasses</Button>,
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    title: 'Could not save class',
    description: 'Fix the highlighted fields and try again.',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      {ALERT_VARIANTS.map((variant) => (
        <Alert
          key={variant}
          variant={variant}
          title={`${variant.charAt(0).toUpperCase()}${variant.slice(1)} alert`}
          description="Supporting copy uses the shared muted description tone."
        />
      ))}
    </div>
  ),
}

export const ClassReference: Story = {
  tags: ['control-parity'],
  render: () => (
    <ClassReferenceTable
      rows={ALERT_CLASS_SPECS.map((spec) => ({
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
  ),
}

export const Compact: Story = {
  args: {
    density: 'compact',
    variant: 'success',
    title: 'Ready to publish',
    description: 'Required configuration is complete.',
  },
}

export const AllDensities: Story = {
  render: () => (
    <div className="space-y-4">
      {ALERT_DENSITIES.map((density) => (
        <Alert
          key={density}
          density={density}
          variant="warning"
          title={`${density.charAt(0).toUpperCase()}${density.slice(1)} density`}
          description="Supporting copy uses the shared muted description tone."
        />
      ))}
    </div>
  ),
}

export const WithLeading: Story = {
  args: {
    variant: 'warning',
    announcement: 'none',
    title: 'Reconnect to Stormwatch',
    description: 'Your campaign connection needs to be restored.',
    actions: <Button size="sm">Reconnect character</Button>,
  },
  render: (args) => (
    <Alert
      {...args}
      leading={
        <span className="inline-flex size-5 items-center justify-center rounded-full bg-warning-subtle text-warning">
          !
        </span>
      }
    />
  ),
}

export const PersistentDashboardWarning: Story = {
  args: {
    variant: 'warning',
    density: 'comfortable',
    announcement: 'none',
    title: 'Stormwatch — connection needs restore',
    description: 'Your campaign character connection needs to be restored.',
    actions: <Button size="sm">Reconnect character</Button>,
  },
}
