import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import type { Equipment, Spell } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import { EntityCard } from '../../entity/surfaces/cards/content/entity-card'
import { projectArrayItemEntitySummary } from '../../entity/surfaces/cards/disclosure/array-item-entity-summary.lib'
import { GRANT_ROW_TYPE_LABELS } from './grant-form-schema'
import {
  buildGrantEquipmentReferencePresentationFromAuthoring,
  buildGrantSpellReferencePresentationFromAuthoring,
  formatGrantRowToolbarAriaLabel,
  omitRedundantGrantDetail,
  resolveGrantRowPresentation,
  type GrantRowHeaderContext,
} from './grant-row-presentation.lib'

const headerContext = {
  rowLabels: GRANT_ROW_TYPE_LABELS,
  equipmentReferences: buildGrantEquipmentReferencePresentationFromAuthoring({
    status: 'ready',
    scope: { rulesetId: 'srd-cc-5.2.1', campaignId: 'campaign-1' },
    equipmentById: new Map(
      [{ id: 'srd-cc-5.2.1:longsword', slug: 'longsword', name: 'Longsword' } as Equipment].map(
        (item) => [item.id, item],
      ),
    ),
  }),
  resolveSkillName: (slug: string) =>
    slug === 'athletics' ? 'Athletics' : 'Skill proficiency reference unavailable',
  spellReferences: buildGrantSpellReferencePresentationFromAuthoring({
    status: 'ready',
    spellsById: new Map(
      [
        { id: 'srd-cc-5.2.1:aid', name: 'Aid', level: 2 },
        { id: 'srd-cc-5.2.1:animate-dead', name: 'Animate Dead', level: 3 },
      ].map((spell) => [spell.id, spell as Spell]),
    ),
  }),
} satisfies GrantRowHeaderContext

const FIXTURES: Array<{ label: string; values: Record<string, unknown> }> = [
  {
    label: 'Armor training',
    values: {
      grantType: 'armorTraining',
      proficiencySource: 'category',
      armorTrainingCategories: ['medium'],
    },
  },
  {
    label: 'Spells',
    values: {
      grantType: 'spells',
      spellAbility: 'cha',
      spellAvailability: true,
      spellIds: ['srd-cc-5.2.1:aid', 'srd-cc-5.2.1:animate-dead'],
    },
  },
  {
    label: 'Movement',
    values: {
      grantType: 'movement',
      movementMode: 'walk',
      movementOperation: 'increase',
      movementFeet: '5',
    },
  },
  {
    label: 'Weapon proficiency',
    values: {
      grantType: 'weaponProficiency',
      proficiencySource: 'specific',
      weaponProficiencySpecific: ['longsword'],
    },
  },
]

function GrantRowPresentationDemo({ values }: { values: Record<string, unknown> }) {
  const [collapsed, setCollapsed] = useState(true)
  const presentation = resolveGrantRowPresentation(values, headerContext)
  if (!presentation) return null

  const heading = presentation.heading
  const detail = omitRedundantGrantDetail(heading, presentation.detail)
  const toolbarAriaLabel = formatGrantRowToolbarAriaLabel({ heading, detail })
  const entity = projectArrayItemEntitySummary({
    header: {
      primary: heading,
      fallback: 'Grant',
      ariaLabel: `Grants · ${heading}`,
      showDivider: false,
      showFallbackInTitle: false,
      srOnly: false,
    },
    summary: presentation.description,
    classification: detail,
  })

  return (
    <EntityCard
      variant="disclosure"
      itemId={heading}
      toolbarAriaLabel={toolbarAriaLabel}
      entity={entity}
      density="compact"
      collapsed={collapsed}
      onToggleCollapse={() => setCollapsed((current) => !current)}
    >
      <Text variant="supporting">Grant body fields render here when expanded.</Text>
    </EntityCard>
  )
}

function GrantRowPresentationGallery() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-3">
      {FIXTURES.map((fixture) => (
        <GrantRowPresentationDemo key={fixture.label} values={fixture.values} />
      ))}
    </div>
  )
}

const meta = {
  title: 'Content/Forms/GrantRowPresentation',
  component: GrantRowPresentationGallery,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof GrantRowPresentationGallery>

export default meta
type Story = StoryObj<typeof GrantRowPresentationGallery>

export const Gallery: Story = {
  render: () => <GrantRowPresentationGallery />,
}

export const SpellsPrepared: Story = {
  render: () => (
    <div className="max-w-lg">
      <GrantRowPresentationDemo
        values={{
          grantType: 'spells',
          spellAbility: 'wis',
          spellAvailability: true,
          spellIds: ['srd-cc-5.2.1:aid', 'srd-cc-5.2.1:animate-dead'],
        }}
      />
    </div>
  ),
}
