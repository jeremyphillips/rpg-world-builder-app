import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import type { MonsterActionDraftRow } from '../../lib/actions/monster-action-presets'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'

const bite: MonsterActionDraftRow = {
  id: 'bite',
  kind: 'natural-weapon',
  name: 'Bite',
  mode: 'melee',
  damageType: 'piercing',
  damage: { dice: { count: 1, faces: 8 } },
}
import { MonsterActionAttackSummary } from './monster-action-attack-summary'

const meta = {
  title: 'Dashboard/Content/Monsters/MonsterActionAttackSummary',
  component: MonsterActionAttackSummary,
} satisfies Meta<typeof MonsterActionAttackSummary>

export default meta

type Story = StoryObj<typeof meta>

function Host() {
  const values = resolveMonsterCreateDefaultValues()
  values.actions = [bite]
  const form = useForm<MonsterFormValues>({ defaultValues: values })
  const ctx = {
    entityCatalogLayer: 'homebrew',
    equipmentCatalogStatus: 'ready',
    equipmentCatalogById: new Map(),
  } as ContentFormCtx
  return (
    <FormProvider {...form}>
      <MonsterActionAttackSummary ctx={ctx} action={bite} />
    </FormProvider>
  )
}

export const NaturalWeapon: Story = {
  args: {
    ctx: {
      entityCatalogLayer: 'homebrew',
      equipmentCatalogStatus: 'ready',
      equipmentCatalogById: new Map(),
    } as ContentFormCtx,
    action: bite,
  },
  render: () => <Host />,
}
