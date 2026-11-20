import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { systemDefaultArmorClassRules } from '@rpg/contracts'

import type { ContentFormCtx } from '../../../../../lib/forms/registry/content-form-registry'
import type { MonsterActionDraftRow } from '../../../../lib/actions/monster-action-presets'
import { monsterFormTestValues } from '../../../../lib/monster-form-test-values'
import type { MonsterFormValues } from '../../../../lib/monster-form-values'
import { MonsterActionParrySummary } from './parry-preview.slot'

const parry: MonsterActionDraftRow = {
  id: 'parry',
  kind: 'parry',
  name: 'Parry',
  acBonus: 2,
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
  title: 'Dashboard/Content/Monsters/MonsterActionParrySummary',
  component: MonsterActionParrySummary,
  args: {
    ctx: storyCtx,
    action: parry,
  },
} satisfies Meta<typeof MonsterActionParrySummary>

export default meta

type Story = StoryObj<typeof meta>

function Host() {
  const form = useForm<MonsterFormValues>({
    defaultValues: monsterFormTestValues({
      name: 'Knight',
      reactions: [parry] as MonsterFormValues['reactions'],
    }),
  })
  return (
    <FormProvider {...form}>
      <MonsterActionParrySummary ctx={storyCtx} action={parry} />
    </FormProvider>
  )
}

export const Default: Story = {
  render: () => <Host />,
}
