import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import type { MonsterActionDraftRow } from '../../lib/actions/monster-action-presets'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import { MonsterActionParrySummary } from './monster-action-parry-summary'

const parry: MonsterActionDraftRow = {
  id: 'parry',
  kind: 'parry',
  name: 'Parry',
  acBonus: 2,
}

const meta = {
  title: 'Dashboard/Content/Monsters/MonsterActionParrySummary',
  component: MonsterActionParrySummary,
} satisfies Meta<typeof MonsterActionParrySummary>

export default meta

type Story = StoryObj<typeof meta>

function Host() {
  const values = resolveMonsterCreateDefaultValues()
  values.name = 'Knight'
  values.reactions = [parry]
  const form = useForm<MonsterFormValues>({ defaultValues: values })
  const ctx = {
    entityCatalogLayer: 'homebrew',
    equipmentCatalogStatus: 'ready',
    equipmentCatalogById: new Map(),
    spellCatalogStatus: 'ready',
    spellCatalogById: new Map(),
    armorClassRules: { mode: 'ascending', base: 10 },
    options: { skills: { visible: [] } },
    rulesetId: 'srd-cc-5.2.1',
  } as ContentFormCtx
  return (
    <FormProvider {...form}>
      <MonsterActionParrySummary ctx={ctx} action={parry} />
    </FormProvider>
  )
}

export const Default: Story = {
  render: () => <Host />,
}
