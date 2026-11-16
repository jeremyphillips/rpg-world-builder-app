import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import type { MonsterActionDraftRow } from '../../../lib/actions/monster-action-presets'
import { monsterFormTestValues } from '../../../lib/monster-form-test-values'
import type { MonsterFormValues } from '../../../lib/monster-form-values'
import { MonsterActionAttackSummary } from './monster-action-attack-summary'

const bite: MonsterActionDraftRow = {
  id: 'bite',
  kind: 'natural-weapon',
  name: 'Bite',
  mode: 'melee',
  damageType: 'piercing',
  damage: { dice: { count: 1, faces: 8 } },
}

const meta = {
  title: 'Dashboard/Content/Monsters/MonsterActionAttackSummary',
  component: MonsterActionAttackSummary,
} satisfies Meta<typeof MonsterActionAttackSummary>

export default meta

type Story = StoryObj<typeof meta>

function Host() {
  const form = useForm<MonsterFormValues>({
    defaultValues: monsterFormTestValues({
      name: 'Attack summary story',
      actions: [bite] as MonsterFormValues['actions'],
    }),
  })
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
