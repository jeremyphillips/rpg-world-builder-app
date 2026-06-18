import type { Meta, StoryObj } from '@storybook/react-vite'
import type { SkillProficiency } from '@rpg/contracts'
import { buttonVariants } from '@rpg/ui'

import { ContentDetailLayout } from '../../lib/content-detail-layout'
import { ContentStatRow } from '../../lib/content-stat-row'
import { getContentImageUrl } from '../../lib/content-image-url'

const ATHLETICS: SkillProficiency = {
  id: 'srd-cc-5.2.1:athletics',
  slug: 'athletics',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
  name: 'Athletics',
  description: 'Difficult situations you face while climbing, jumping, or swimming.',
  ability: 'str',
  suggestedClasses: ['barbarian', 'fighter', 'paladin'],
}

const STEALTH: SkillProficiency = {
  id: 'srd-cc-5.2.1:stealth',
  slug: 'stealth',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
  name: 'Stealth',
  description: 'Escaping notice by moving silently and hiding from view.',
  ability: 'dex',
  suggestedClasses: ['bard', 'monk', 'ranger', 'rogue'],
}

const meta = {
  title: 'Content/SkillProficiencyDetail',
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
          ← Skill Proficiencies
        </a>
      </nav>
      <ContentDetailLayout
        imageUrl={getContentImageUrl(undefined)}
        imageName={ATHLETICS.name}
        actions={
          <a href="#" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Edit
          </a>
        }
      >
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">{ATHLETICS.name}</h2>
          <div className="space-y-3">
            <ContentStatRow label="Governing Ability" value="Strength" />
          </div>
          <p className="text-muted-foreground">{ATHLETICS.description}</p>
        </div>
        <section aria-labelledby="suggested-classes-heading">
          <h3 id="suggested-classes-heading" className="mb-3 text-xl font-semibold tracking-tight">
            Commonly Taken By
          </h3>
          <ul className="flex flex-wrap gap-2" role="list">
            {(ATHLETICS.suggestedClasses ?? []).map((slug) => (
              <li key={slug}>
                <span className="rounded-md border px-2 py-1 text-sm capitalize">{slug}</span>
              </li>
            ))}
          </ul>
        </section>
      </ContentDetailLayout>
    </div>
  ),
}

export const WithStealthSkill: Story = {
  render: () => (
    <div className="space-y-6">
      <ContentDetailLayout imageUrl={getContentImageUrl(undefined)} imageName={STEALTH.name}>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">{STEALTH.name}</h2>
          <div className="space-y-3">
            <ContentStatRow label="Governing Ability" value="Dexterity" />
          </div>
          <p className="text-muted-foreground">{STEALTH.description}</p>
        </div>
      </ContentDetailLayout>
    </div>
  ),
}

export const NoImage: Story = {
  render: () => (
    <ContentDetailLayout imageUrl={getContentImageUrl(undefined)} imageName="Perception">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Perception</h2>
        <p className="text-muted-foreground">
          Lets you spot, hear, or otherwise detect the presence of something.
        </p>
      </div>
    </ContentDetailLayout>
  ),
}
