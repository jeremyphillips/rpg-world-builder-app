import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Species } from '@rpg/contracts'

import { ContentDetailLayout } from '../../lib/content-detail-layout'
import { ContentStatRow } from '../../lib/content-stat-row'
import { getContentImageUrl } from '../../lib/content-image-url'

const ORC: Species = {
  id: 'srd-cc-5.2.1:orc',
  slug: 'orc',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
  name: 'Orc',
  creatureType: 'humanoid',
  sizes: ['medium'],
  speed: { walk: 30 },
  traits: [
    {
      id: 'adrenaline-rush',
      name: 'Adrenaline Rush',
      description:
        '<p>You can take the Dash action as a Bonus Action. When you do so, you gain a number of Temporary Hit Points equal to your Proficiency Bonus.</p>',
    },
    {
      id: 'darkvision',
      name: 'Darkvision',
      description: '<p>You have Darkvision with a range of 120 feet.</p>',
      grants: { senses: [{ type: 'darkvision', range: 120 }] },
    },
    {
      id: 'relentless-endurance',
      name: 'Relentless Endurance',
      description:
        '<p>When you are reduced to 0 Hit Points but not killed outright, you can drop to 1 Hit Point instead.</p>',
    },
  ],
}

const ELF: Species = {
  id: 'srd-cc-5.2.1:elf',
  slug: 'elf',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
  name: 'Elf',
  creatureType: 'humanoid',
  sizes: ['medium'],
  speed: { walk: 30 },
  traits: [
    {
      id: 'darkvision',
      name: 'Darkvision',
      description: '<p>You have Darkvision with a range of 60 feet.</p>',
      grants: { senses: [{ type: 'darkvision', range: 60 }] },
    },
    {
      id: 'fey-ancestry',
      name: 'Fey Ancestry',
      description:
        '<p>You have Advantage on saving throws you make to avoid or end the Charmed condition.</p>',
    },
    {
      id: 'trance',
      name: 'Trance',
      description:
        "<p>You don't need to sleep, and magic can't put you to sleep. You can finish a Long Rest in 4 hours.</p>",
    },
  ],
  choiceGroups: [
    {
      id: 'elven-lineage',
      name: 'Elven Lineage',
      kind: 'lineage',
      description: '<p>Choose a lineage that grants you supernatural abilities.</p>',
      options: [
        {
          id: 'drow',
          name: 'Drow',
          description:
            '<p>Your Darkvision increases to 120 feet. You know the Dancing Lights cantrip. At level 3 you gain Faerie Fire; at level 5 you gain Darkness.</p>',
          grants: { senses: [{ type: 'darkvision', range: 120 }] },
        },
        {
          id: 'high-elf',
          name: 'High Elf',
          description:
            '<p>You know the Prestidigitation cantrip (replaceable on Long Rest). At level 3 you gain Detect Magic; at level 5 you gain Misty Step.</p>',
        },
        {
          id: 'wood-elf',
          name: 'Wood Elf',
          description:
            '<p>Your Speed increases to 35 feet. You know the Druidcraft cantrip. At level 3 you gain Longstrider; at level 5 you gain Pass without Trace.</p>',
          grants: { speedOverride: { walk: 35 } },
        },
      ],
    },
  ],
}

const meta = {
  title: 'Content/Species/SpeciesDetail',
  component: ContentDetailLayout,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ContentDetailLayout>

export default meta
type Story = StoryObj<typeof meta>

export const NoChoiceGroups: Story = {
  render: () => (
    <ContentDetailLayout imageUrl={getContentImageUrl(undefined)} imageName={ORC.name}>
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">{ORC.name}</h2>
        <div className="space-y-3">
          <ContentStatRow label="Creature Type" value="Humanoid" />
          <ContentStatRow label="Size" value="Medium" />
          <ContentStatRow label="Speed" value="30 ft." />
          <ContentStatRow label="Senses" value="Darkvision 120 ft." />
        </div>
      </div>
      <section aria-labelledby="traits-heading">
        <h3 id="traits-heading" className="mb-4 text-xl font-semibold tracking-tight">
          Traits
        </h3>
        <ul className="space-y-4" role="list">
          {ORC.traits.map((t) => (
            <li key={t.id} className="space-y-1">
              <p className="font-medium">{t.name}</p>
              {t.description && (
                <p
                  className="text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: t.description }}
                />
              )}
            </li>
          ))}
        </ul>
      </section>
    </ContentDetailLayout>
  ),
}

export const WithLineageChoiceGroup: Story = {
  render: () => (
    <ContentDetailLayout imageUrl={getContentImageUrl(undefined)} imageName={ELF.name}>
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">{ELF.name}</h2>
        <div className="space-y-3">
          <ContentStatRow label="Creature Type" value="Humanoid" />
          <ContentStatRow label="Size" value="Medium" />
          <ContentStatRow label="Speed" value="30 ft." />
          <ContentStatRow label="Senses" value="Darkvision 60 ft." />
        </div>
      </div>
      <section aria-labelledby="traits-heading">
        <h3 id="traits-heading" className="mb-4 text-xl font-semibold tracking-tight">
          Traits
        </h3>
        <ul className="space-y-4" role="list">
          {ELF.traits.map((t) => (
            <li key={t.id} className="space-y-1">
              <p className="font-medium">{t.name}</p>
              {t.description && (
                <p
                  className="text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: t.description }}
                />
              )}
            </li>
          ))}
        </ul>
      </section>
      {ELF.choiceGroups?.map((group) => (
        <section key={group.id} aria-labelledby={`${group.id}-heading`}>
          <h3
            id={`${group.id}-heading`}
            className="mb-2 text-xl font-semibold tracking-tight capitalize"
          >
            {group.name}
          </h3>
          {group.description && (
            <p
              className="mb-4 text-sm text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: group.description }}
            />
          )}
          <ul className="space-y-4" role="list">
            {group.options.map((opt) => (
              <li key={opt.id} className="space-y-1">
                <p className="font-medium">{opt.name}</p>
                {opt.description && (
                  <p
                    className="text-sm text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: opt.description }}
                  />
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </ContentDetailLayout>
  ),
}
