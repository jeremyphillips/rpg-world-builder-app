import type { Meta } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import type { MonsterActionDraftRow } from '../../lib/actions/monster-action-presets'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import { MonsterActionBonusSummary } from './monster-action-bonus-summary'

const leap: MonsterActionDraftRow = {
  id: 'leap',
  kind: 'leap',
  name: 'Leap',
  distanceFeet: 30,
  movementFeet: 10,
}

const meta = {
  title: 'Dashboard/Content/Monsters/MonsterActionBonusSummary',
  component: MonsterActionBonusSummary,
} satisfies Meta<typeof MonsterActionBonusSummary>

export default meta

function Host() {
  const values = resolveMonsterCreateDefaultValues()
  values.name = 'Hezrou'
  values.bonusActions = [leap]
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
  } as unknown as ContentFormCtx
  return (
    <FormProvider {...form}>
      <MonsterActionBonusSummary ctx={ctx} action={leap} />
    </FormProvider>
  )
}

export const Leap = {
  render: () => <Host />,
}
