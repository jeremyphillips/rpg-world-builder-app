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

export const DefaultCard: Story = {
  name: 'Default (strong / flat / comfortable)',
  render: () => (
    <Card
      className="w-80"
      header={{
        title: 'Default Card',
        description: 'Strong tone, flat elevation, comfortable density.',
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

export const Default: Story = DefaultCard

export const ToneComparison: Story = {
  render: () => (
    <div className="grid max-w-2xl gap-4 md:grid-cols-2">
      <Card header={{ title: 'Strong / flat', description: 'Default generic card.' }} />
      <Card
        tone="quiet"
        header={{ title: 'Quiet / flat', description: 'Entity row and catalog frames.' }}
      />
    </div>
  ),
}

export const ElevationComparison: Story = {
  render: () => (
    <div className="grid max-w-4xl gap-6">
      {(['strong', 'quiet'] as const).map((tone) => (
        <div key={tone} className="space-y-2">
          <p className="text-style-label">{tone} tone</p>
          <div className="grid gap-4 md:grid-cols-3">
            {(['flat', 'subtle', 'raised'] as const).map((elevation) => (
              <Card
                key={elevation}
                tone={tone}
                elevation={elevation}
                header={{
                  title: elevation,
                  description: `${tone} · ${elevation}`,
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
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

export const NavigableCompact: Story = {
  render: () => (
    <Card
      className="max-w-md"
      link={<a href="#creature-types">Creature types</a>}
      density="compact"
      tone="quiet"
      header={{
        title: 'Creature types',
        description: 'Taxonomic classification shared by species and monsters.',
      }}
    >
      <p className="text-xs text-muted-foreground">12 terms · 1 unavailable</p>
    </Card>
  ),
}

export const NavigableStrong: Story = {
  render: () => (
    <div className="h-40 max-w-xs">
      <Card
        link={<a href="#weapons">Weapons</a>}
        stretch
        className="h-full"
        density="comfortable"
        tone="strong"
        header={{ title: 'Weapons' }}
      />
    </div>
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
        <h2 className="text-style-label">Content card — comfortable 16px, spacious 19px</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <ContentCard
            density="comfortable"
            heading="Harbor District"
            subheading="Comfortable supporting copy"
          />
          <ContentCard
            density="spacious"
            heading="Harbor District"
            subheading="Spacious supporting copy"
          />
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-style-label">Reference — radio comfortable (16px bold title)</h2>
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
