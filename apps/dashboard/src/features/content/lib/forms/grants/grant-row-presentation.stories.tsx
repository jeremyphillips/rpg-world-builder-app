import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { DisclosureEntityCard } from '../../entity/surfaces/cards/disclosure/disclosure-entity-card'
import { projectArrayItemEntitySummary } from '../../entity/surfaces/cards/disclosure/array-item-entity-summary.lib'
import { GRANT_ROW_TYPE_LABELS } from './grant-form-schema'
import {
  formatGrantRowToolbarAriaLabel,
  omitRedundantGrantDetail,
  resolveGrantRowPresentation,
  type GrantRowHeaderContext,
} from './grant-row-presentation.lib'

const headerContext = {
  rowLabels: GRANT_ROW_TYPE_LABELS,
  equipmentOptions: [{ value: 'longsword', label: 'Longsword' }],
  weaponOptions: [{ value: 'longsword', label: 'Longsword' }],
  toolOptions: [{ value: 'thieves-tools', label: "Thieves' Tools" }],
  armorOptions: [],
  skillOptions: [{ value: 'athletics', label: 'Athletics' }],
  spellOptions: [
    { value: 'aid', label: 'Aid' },
    { value: 'animate-dead', label: 'Animate Dead' },
  ],
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
      spellIds: ['aid', 'animate-dead'],
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
    <DisclosureEntityCard
      itemId={heading}
      toolbarAriaLabel={toolbarAriaLabel}
      entity={entity}
      density="compact"
      collapsed={collapsed}
      onToggleCollapse={() => setCollapsed((current) => !current)}
    >
      <p className="text-sm text-muted-foreground">Grant body fields render here when expanded.</p>
    </DisclosureEntityCard>
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
          spellIds: ['aid', 'animate-dead'],
        }}
      />
    </div>
  ),
}
