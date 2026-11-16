import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { systemDefaultArmorClassRules } from '@rpg/contracts'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import type { MonsterActionDraftRow } from '../../../lib/actions/monster-action-presets'
import { monsterFormTestValues } from '../../../lib/monster-form-test-values'
import type { MonsterFormValues } from '../../../lib/monster-form-values'
import { MonsterActionSpellSummary } from './monster-action-spell-summary'

const spellcasting: MonsterActionDraftRow = {
  id: 'spellcasting',
  kind: 'spell',
  profile: 'primary',
  name: 'Spellcasting',
  castingAbility: { kind: 'ability', ability: 'int' },
  spells: [{ spellId: 'srd-cc-5.2.1:mage-hand' }, { spellId: 'srd-cc-5.2.1:detect-magic' }],
}

const storyCtx = {
  entityCatalogLayer: 'homebrew',
  equipmentCatalogStatus: 'ready',
  equipmentCatalogById: new Map(),
  spellCatalogStatus: 'ready',
  spellCatalogById: new Map([
    ['srd-cc-5.2.1:mage-hand', { id: 'srd-cc-5.2.1:mage-hand', name: 'Mage Hand' }],
    ['srd-cc-5.2.1:detect-magic', { id: 'srd-cc-5.2.1:detect-magic', name: 'Detect Magic' }],
  ]),
  armorClassRules: systemDefaultArmorClassRules(),
  options: { skills: { visible: [] } },
  rulesetId: 'srd-cc-5.2.1',
} as unknown as ContentFormCtx

const meta = {
  title: 'Dashboard/Content/Monsters/MonsterActionSpellSummary',
  component: MonsterActionSpellSummary,
  args: {
    ctx: storyCtx,
    action: spellcasting,
    section: 'actions',
  },
} satisfies Meta<typeof MonsterActionSpellSummary>

export default meta

type Story = StoryObj<typeof meta>

function Host() {
  const form = useForm<MonsterFormValues>({
    defaultValues: monsterFormTestValues({
      name: 'Archmage',
      challengeRating: '5',
      abilityScores: { str: 10, dex: 10, con: 10, int: 20, wis: 10, cha: 10 },
      actions: [spellcasting] as MonsterFormValues['actions'],
    }),
  })
  return (
    <FormProvider {...form}>
      <MonsterActionSpellSummary ctx={storyCtx} action={spellcasting} section="actions" />
    </FormProvider>
  )
}

export const Default: Story = {
  render: () => <Host />,
}
