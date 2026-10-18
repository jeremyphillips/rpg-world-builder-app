import type { Meta, StoryObj } from '@storybook/react-vite'

import { ClassReferenceTable } from '../../stories/semantic-classes/class-reference-table'
import { Button } from './button.client'
import { Card } from './card'
import { ContentCard } from './content-card.client'
import { CARD_CLASS_SPECS, UI_CARD_CONTENT_CLASS } from './card.variants'
import { Input } from './input.client'
import { RadioOptionCard } from './radio-option-card.client'
import { RadioGroup } from './radio-group.client'

const meta = {
  title: 'Primitives/Card',
  component: Card,
  parameters: { semanticClasses: true },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card
      className="w-80"
      header={{
        title: 'Create campaign',
        description: 'Start a new world for your party.',
      }}
      footer={
        <>
          <Button variant="ghost">Cancel</Button>
          <Button>Create</Button>
        </>
      }
    >
      <div className="space-y-2">
        <label htmlFor="campaign-name" className="text-style-label">
          Name
        </label>
        <Input id="campaign-name" placeholder="The Sunless Citadel" />
      </div>
    </Card>
  ),
}

export const Interactive: Story = {
  render: () => (
    <Card
      interactive
      className="w-80"
      header={{
        title: 'Equipment',
        description: 'Open a catalog family.',
      }}
    />
  ),
}

export const DensityTypography: Story = {
  parameters: { semanticClasses: true },
  render: () => (
    <div className="flex max-w-4xl flex-col gap-8">
      <section className="space-y-3">
        <h2 className="text-style-label">Generic Card — compact / comfortable / spacious</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {(['compact', 'comfortable', 'spacious'] as const).map((density) => (
            <Card
              key={density}
              density={density}
              header={{
                title: 'Equipment',
                description: 'Manage catalog content for this family.',
              }}
            />
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-style-label">Reference — entity comfortable (19px title)</h2>
        <ContentCard
          density="comfortable"
          heading="Harbor District"
          subheading="Settlement overview"
        />
      </section>
      <section className="space-y-3">
        <h2 className="text-style-label">Reference — radio default (16px bold title)</h2>
        <RadioGroup defaultValue="a" className="max-w-sm">
          <RadioOptionCard value="a" label="Fighter" description="Martial prowess" />
        </RadioGroup>
      </section>
    </div>
  ),
}

export const ClassReference: Story = {
  tags: ['control-parity'],
  parameters: { semanticClasses: true },
  render: () => (
    <ClassReferenceTable
      rows={CARD_CLASS_SPECS.map((spec) => ({
        key: spec.key,
        sample: (
          <div data-semantic-class-target className={spec.className}>
            <div className={UI_CARD_CONTENT_CLASS}>{spec.useCase}</div>
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
