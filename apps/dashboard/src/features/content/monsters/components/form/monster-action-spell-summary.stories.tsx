import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import type { MonsterActionDraftRow } from '../../lib/actions/monster-action-presets'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import { MonsterActionSpellSummary } from './monster-action-spell-summary'

const spellcasting: MonsterActionDraftRow = {
  id: 'spellcasting',
  kind: 'spell',
  profile: 'primary',
  name: 'Spellcasting',
  castingAbility: { kind: 'ability', ability: 'int' },
  spells: [{ spellId: 'srd-cc-5.2.1:mage-hand' }, { spellId: 'srd-cc-5.2.1:detect-magic' }],
}

const meta = {
  title: 'Dashboard/Content/Monsters/MonsterActionSpellSummary',
  component: MonsterActionSpellSummary,
} satisfies Meta<typeof MonsterActionSpellSummary>

export default meta

type Story = StoryObj<typeof meta>

function Host() {
  const values = resolveMonsterCreateDefaultValues()
  values.name = 'Archmage'
  values.challengeRating = '5'
  values.abilityScores = { str: 10, dex: 10, con: 10, int: 20, wis: 10, cha: 10 }
  values.actions = [spellcasting]
  const form = useForm<MonsterFormValues>({ defaultValues: values })
  const ctx = {
    entityCatalogLayer: 'homebrew',
    equipmentCatalogStatus: 'ready',
    equipmentCatalogById: new Map(),
    spellCatalogStatus: 'ready',
    spellCatalogById: new Map([
      ['srd-cc-5.2.1:mage-hand', { id: 'srd-cc-5.2.1:mage-hand', name: 'Mage Hand' }],
      ['srd-cc-5.2.1:detect-magic', { id: 'srd-cc-5.2.1:detect-magic', name: 'Detect Magic' }],
    ]),
    armorClassRules: { mode: 'ascending', base: 10 },
    options: { skills: { visible: [] } },
    rulesetId: 'srd-cc-5.2.1',
  } as ContentFormCtx
  return (
    <FormProvider {...form}>
      <MonsterActionSpellSummary ctx={ctx} action={spellcasting} section="actions" />
    </FormProvider>
  )
}

export const Default: Story = {
  render: () => <Host />,
}
