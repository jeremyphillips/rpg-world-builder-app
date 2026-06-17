import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CharacterClass, Subclass } from '@rpg/contracts'

import { ContentDetailLayout } from '../../lib/content-detail-layout'
import { getContentImageUrl } from '../../lib/content-image-url'
import { buttonVariants } from '@rpg/ui'

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x500/1e293b/94a3b8?text=Class+Art'

const FIGHTER: CharacterClass = {
  id: 'srd-cc-5.2.1:fighter',
  slug: 'fighter',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
  name: 'Fighter',
  description: 'A master of martial combat, skilled with a variety of weapons and armor.',
  primaryAbilities: ['str', 'dex'],
  hitDie: 10,
  asiLevels: [4, 6, 8, 12, 14, 16, 19],
  subclassLevels: [3],
  proficiencies: {
    savingThrows: ['str', 'con'],
    armor: ['light', 'medium', 'heavy', 'shields'],
    weapons: { categories: ['simple', 'martial'] },
    skills: { choose: 2, from: ['acrobatics', 'athletics'] },
  },
  features: [
    { id: 'fighting-style', name: 'Fighting Style', level: 1, description: '' },
    { id: 'second-wind', name: 'Second Wind', level: 1, description: '' },
    { id: 'extra-attack', name: 'Extra Attack', level: 5, description: '' },
  ],
}

const CHAMPION: Subclass = {
  id: 'srd-cc-5.2.1:champion',
  slug: 'champion',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
  name: 'Champion',
  description: 'The archetypal Champion focuses on the development of raw physical power.',
  classId: 'srd-cc-5.2.1:fighter',
}

const meta = {
  title: 'Content/ClassDetail',
  component: ContentDetailLayout,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ContentDetailLayout>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="space-y-6">
      <nav>
        <a href="#" className="text-sm text-muted-foreground hover:underline">
          ← Classes
        </a>
      </nav>
      <ContentDetailLayout
        imageUrl={PLACEHOLDER_IMAGE}
        imageName={FIGHTER.name}
        actions={
          <a href="#" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Edit
          </a>
        }
      >
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">{FIGHTER.name}</h2>
          <p className="text-muted-foreground">{FIGHTER.description}</p>
        </div>
        <section>
          <h3 className="mb-4 text-xl font-semibold tracking-tight">
            {FIGHTER.name} Class Features
          </h3>
          <ul className="space-y-4">
            {FIGHTER.features.map((f) => (
              <li key={f.id}>
                <p className="font-medium">
                  Level {f.level}: {f.name}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </ContentDetailLayout>
      <section>
        <h3 className="mb-4 text-xl font-semibold tracking-tight">Subclasses</h3>
        <ul className="space-y-2">
          <li>
            <p className="font-medium">{CHAMPION.name}</p>
            <p className="text-sm text-muted-foreground">{CHAMPION.description}</p>
          </li>
        </ul>
      </section>
    </div>
  ),
}

export const NoImage: Story = {
  render: () => (
    <ContentDetailLayout imageUrl={getContentImageUrl(undefined)} imageName="Barbarian">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Barbarian</h2>
        <p className="text-muted-foreground">A fierce warrior who can enter a battle rage.</p>
      </div>
    </ContentDetailLayout>
  ),
}
