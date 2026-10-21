import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { BooleanField } from './boolean-field.client'
import type { ChoiceTone } from './choice-control.styles'

const meta = {
  title: 'Forms/Controls/BooleanField',
  component: BooleanField,
  args: { label: 'Expertise' },
} satisfies Meta<typeof BooleanField>

export default meta
type Story = StoryObj<typeof meta>

const cardClass = 'rounded-lg border border-border bg-card p-4'

function Matrix({ density }: { density: 'compact' | 'comfortable' }) {
  const tones: ChoiceTone[] = ['default', 'success', 'warning', 'destructive']
  return (
    <div className="flex flex-col gap-6">
      <section data-content-density={density} className={cardClass}>
        <p className="mb-3 text-style-supporting">{density} card</p>
        <div className="flex flex-wrap gap-3">
          {tones.map((tone) => (
            <BooleanField key={`${tone}-off`} label={tone} tone={tone} />
          ))}
          {tones.map((tone) => (
            <BooleanField key={`${tone}-on`} label={tone} tone={tone} defaultChecked />
          ))}
          <BooleanField label="Invalid" invalid />
          <BooleanField label="Invalid checked" tone="success" defaultChecked invalid />
          <BooleanField label="Disabled" disabled />
          <BooleanField label="Disabled checked" tone="warning" defaultChecked disabled />
        </div>
      </section>
    </div>
  )
}

export const Unchecked: Story = {}

export const Checked: Story = { args: { defaultChecked: true } }

export const Success: Story = { args: { tone: 'success', defaultChecked: true } }

export const Warning: Story = { args: { tone: 'warning', defaultChecked: true } }

export const Destructive: Story = { args: { tone: 'destructive', defaultChecked: true } }

export const Invalid: Story = { args: { invalid: true, defaultChecked: true, tone: 'success' } }

export const Disabled: Story = { args: { disabled: true, defaultChecked: true } }

export const Compact: Story = { args: { size: 'sm', tone: 'success', defaultChecked: true } }

export const Comfortable: Story = { args: { size: 'md', defaultChecked: true } }

export const StateMatrix: Story = {
  render: () => (
    <div className="flex flex-col gap-6 bg-background p-4">
      <Matrix density="compact" />
      <Matrix density="comfortable" />
      <div data-heading-inline="" className={cardClass}>
        <BooleanField label="Heading" tone="success" size="md" defaultChecked />
      </div>
    </div>
  ),
}

export const OnCard: Story = {
  render: () => (
    <article data-content-density="compact" className={cardClass}>
      <BooleanField label="Expertise" tone="success" defaultChecked />
    </article>
  ),
}

function FocusSample({ children }: { children: ReactNode }) {
  return <div className="flex gap-3">{children}</div>
}

export const KeyboardFocus: Story = {
  render: () => (
    <FocusSample>
      <BooleanField label="Unchecked" />
      <BooleanField label="Checked" tone="success" defaultChecked />
    </FocusSample>
  ),
}
