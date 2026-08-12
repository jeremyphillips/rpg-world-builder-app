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
      items: [
        {
          title: 'Drow',
          summaryLines: [
            'L1: Darkvision 120 ft · Dancing Lights cantrip',
            'L3: Faerie Fire spell',
            'L5: Darkness spell',
          ],
        },
      ],
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
          primaryAction={
            <Badge appearance="soft" tone="neutral">
              Selected
            </Badge>
          }
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

export const ClassProficiencyChoices: Story = {
  args: {
    title: 'Fighter',
    eyebrow: 'Class',
    descriptionHtml: '<p>A master of martial combat.</p>',
    metadata: [
      { label: 'Hit Die', value: 'd10' },
      { label: 'Primary Abilities', value: 'Strength, Dexterity' },
      { label: 'Saving Throws', value: 'Strength, Constitution' },
    ],
    sections: [
      {
        title: 'Proficiencies',
        items: [
          {
            title: 'Armor Training',
            body: 'Light armor, Medium armor, Heavy armor, Shields',
          },
          {
            title: 'Weapons',
            body: 'Simple weapons, Martial weapons',
          },
          {
            title: 'Skills',
            optionPool: {
              summary: 'Choose 2 from 5 options',
              optionLabels: ['Acrobatics', 'Athletics', 'History', 'Intimidation', 'Perception'],
            },
          },
        ],
      },
      {
        title: 'Fighter Class Features',
        items: [
          {
            title: 'Fighting Style',
            body: '<p>You gain a Fighting Style feat of your choice.</p>',
          },
          {
            title: 'Second Wind',
            body: '<p>Regain hit points as a Bonus Action.</p>',
          },
        ],
      },
    ],
  },
  render: function Render(args) {
    const [open, setOpen] = useState(false)

    return (
      <>
        <Button className="m-8" onClick={() => setOpen(true)}>
          Open class details
        </Button>
        <BuilderOptionDetailsSheet
          {...args}
          open={open}
          onOpenChange={setOpen}
          primaryAction={<Button onClick={() => setOpen(false)}>Select class</Button>}
        />
      </>
    )
  },
}
