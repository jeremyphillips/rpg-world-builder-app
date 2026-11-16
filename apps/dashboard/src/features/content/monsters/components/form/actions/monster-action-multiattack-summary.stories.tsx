import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { systemDefaultArmorClassRules } from '@rpg/contracts'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import type { MonsterActionDraftRow } from '../../../lib/actions/monster-action-presets'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../../lib/monster-form-values'
import { MonsterActionMultiattackSummary } from './monster-action-multiattack-summary'

const bite: MonsterActionDraftRow = {
  id: 'bite',
  kind: 'natural-weapon',
  name: 'Bite',
  mode: 'melee',
  damageType: 'piercing',
  damage: { dice: { count: 1, faces: 8 } },
}

const multiattack: MonsterActionDraftRow = {
  id: 'multiattack',
  kind: 'multiattack',
  name: 'Multiattack',
  steps: [{ count: 2, actionIds: ['bite'] }],
}

const storyCtx = {
  entityCatalogLayer: 'homebrew',
  equipmentCatalogStatus: 'ready',
  equipmentCatalogById: new Map(),
  spellCatalogStatus: 'ready',
  spellCatalogById: new Map(),
  armorClassRules: systemDefaultArmorClassRules(),
  options: { skills: { visible: [] } },
  rulesetId: 'srd-cc-5.2.1',
} as unknown as ContentFormCtx

const meta = {
  title: 'Dashboard/Content/Monsters/MonsterActionMultiattackSummary',
  component: MonsterActionMultiattackSummary,
  args: {
    ctx: storyCtx,
    action: multiattack,
  },
} satisfies Meta<typeof MonsterActionMultiattackSummary>

export default meta

type Story = StoryObj<typeof meta>

function Host() {
  const values = resolveMonsterCreateDefaultValues()
  values.name = 'Wolf'
  values.actions = [bite, multiattack]
  const form = useForm<MonsterFormValues>({ defaultValues: values })
  return (
    <FormProvider {...form}>
      <MonsterActionMultiattackSummary ctx={storyCtx} action={multiattack} />
    </FormProvider>
  )
}

export const Default: Story = {
  render: () => <Host />,
}
