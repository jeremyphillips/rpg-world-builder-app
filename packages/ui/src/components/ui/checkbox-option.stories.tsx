import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Text } from './text'

import { CheckboxOption } from './checkbox-option.client'
import type { ChoiceTone } from './choice-control.styles'

const meta = {
  title: 'Forms/Controls/CheckboxOption',
  component: CheckboxOption,
  args: { label: 'Expertise' },
} satisfies Meta<typeof CheckboxOption>

export default meta
type Story = StoryObj<typeof meta>

const cardClass = 'rounded-lg border border-border bg-card p-4'

function Matrix({ density }: { density: 'compact' | 'comfortable' }) {
  const tones: ChoiceTone[] = ['default', 'success', 'warning', 'destructive']
  return (
    <div className="flex flex-col gap-6">
      <section data-content-density={density} className={cardClass}>
        <Text variant="supporting" className="mb-3">
          {density} card
        </Text>
        <div className="flex flex-wrap gap-3">
          {tones.map((tone) => (
            <CheckboxOption key={`${tone}-off`} shell="outlined" label={tone} tone={tone} />
          ))}
          {tones.map((tone) => (
            <CheckboxOption
              key={`${tone}-on`}
              shell="outlined"
              label={tone}
              tone={tone}
              defaultChecked
            />
          ))}
          <CheckboxOption shell="outlined" label="Invalid" invalid />
          <CheckboxOption
            shell="outlined"
            label="Invalid checked"
            tone="success"
            defaultChecked
            invalid
          />
          <CheckboxOption shell="outlined" label="Disabled" disabled />
          <CheckboxOption
            shell="outlined"
            label="Disabled checked"
            tone="warning"
            defaultChecked
            disabled
          />
        </div>
      </section>
    </div>
  )
}

export const Plain: Story = {}

export const OutlinedUnchecked: Story = { args: { shell: 'outlined' } }

export const OutlinedChecked: Story = { args: { shell: 'outlined', defaultChecked: true } }

export const OutlinedSuccess: Story = {
  args: { shell: 'outlined', tone: 'success', defaultChecked: true },
}

export const OutlinedInvalid: Story = {
  args: { shell: 'outlined', invalid: true, defaultChecked: true, tone: 'success' },
}

export const OutlinedStateMatrix: Story = {
  render: () => (
    <div className="flex flex-col gap-6 bg-background p-4">
      <Matrix density="compact" />
      <Matrix density="comfortable" />
      <div data-heading-inline="" className={cardClass}>
        <CheckboxOption shell="outlined" label="Heading" tone="success" size="md" defaultChecked />
      </div>
    </div>
  ),
}

export const OutlinedOnCard: Story = {
  render: () => (
    <article data-content-density="compact" className={cardClass}>
      <CheckboxOption shell="outlined" label="Expertise" tone="success" defaultChecked />
    </article>
  ),
}

function FocusSample({ children }: { children: ReactNode }) {
  return <div className="flex gap-3">{children}</div>
}

export const OutlinedKeyboardFocus: Story = {
  render: () => (
    <FocusSample>
      <CheckboxOption shell="outlined" label="Unchecked" />
      <CheckboxOption shell="outlined" label="Checked" tone="success" defaultChecked />
    </FocusSample>
  ),
}
