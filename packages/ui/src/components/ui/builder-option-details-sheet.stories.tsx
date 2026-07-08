import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { BuilderOptionDetailsSheet } from './builder-option-details-sheet.client'
import { Button } from './button.client'
import { Badge } from './badge'

const speciesFixture = {
  title: 'Dwarf',
  eyebrow: 'Species',
  descriptionHtml: '<p>Stout and hardy folk of the mountains.</p>',
  metadata: [
    { label: 'Creature Type', value: 'Humanoid' },
    { label: 'Size', value: 'Medium' },
    { label: 'Speed', value: '30 ft.' },
  ],
  sections: [
    {
      title: 'Traits',
      items: [
        {
          title: 'Darkvision',
          body: '<p>You have Darkvision with a range of 120 feet.</p>',
        },
        {
          title: 'Dwarven Resilience',
          body: '<p>You have Resistance to Poison damage.</p>',
        },
      ],
    },
    {
      title: 'Heritage',
      description: '<p>Choose a heritage option during character creation.</p>',
      items: [{ title: 'Mountain Dwarf', body: '<p>Extra armor training.</p>' }],
    },
  ],
}

const meta = {
  title: 'Primitives/BuilderOptionDetailsSheet',
  component: BuilderOptionDetailsSheet,
  parameters: { layout: 'fullscreen' },
  args: {
    open: false,
    onOpenChange: () => undefined,
    title: speciesFixture.title,
    eyebrow: speciesFixture.eyebrow,
    descriptionHtml: speciesFixture.descriptionHtml,
    metadata: speciesFixture.metadata,
    sections: speciesFixture.sections,
  },
} satisfies Meta<typeof BuilderOptionDetailsSheet>

export default meta
type Story = StoryObj<typeof meta>

export const SpeciesDetails: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(false)

    return (
      <>
        <Button className="m-8" onClick={() => setOpen(true)}>
          Open species details
        </Button>
        <BuilderOptionDetailsSheet
          {...args}
          open={open}
          onOpenChange={setOpen}
          primaryAction={<Button onClick={() => setOpen(false)}>Select species</Button>}
        />
      </>
    )
  },
}

export const SelectedSpecies: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(false)

    return (
      <>
        <Button className="m-8" onClick={() => setOpen(true)}>
          Open species details
        </Button>
        <BuilderOptionDetailsSheet
          {...args}
          open={open}
          onOpenChange={setOpen}
          primaryAction={<Badge variant="secondary">Selected</Badge>}
        />
      </>
    )
  },
}

export const FooterAction: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(false)

    return (
      <>
        <Button className="m-8" onClick={() => setOpen(true)}>
          Open species details
        </Button>
        <BuilderOptionDetailsSheet
          {...args}
          open={open}
          onOpenChange={setOpen}
          primaryAction={<Button onClick={() => setOpen(false)}>Select species</Button>}
          primaryActionPlacement="footer"
        />
      </>
    )
  },
}

export const MetadataOnly: Story = {
  args: {
    title: 'Fighter',
    eyebrow: 'Class',
    descriptionHtml: undefined,
    metadata: [
      { label: 'Hit Die', value: 'd10' },
      { label: 'Primary Abilities', value: 'Strength' },
    ],
    sections: undefined,
  },
  render: function Render(args) {
    const [open, setOpen] = useState(false)

    return (
      <>
        <Button className="m-8" onClick={() => setOpen(true)}>
          Open class metadata
        </Button>
        <BuilderOptionDetailsSheet {...args} open={open} onOpenChange={setOpen} />
      </>
    )
  },
}
