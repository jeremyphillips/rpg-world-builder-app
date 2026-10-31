import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { useMonsterActionSections } from '../../hooks/use-monster-action-sections'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import { MonsterActionDetail } from './monster-action-detail'

const meta = {
  title: 'Dashboard/Content/Monsters/MonsterActionDetail',
  component: MonsterActionDetail,
} satisfies Meta<typeof MonsterActionDetail>

export default meta

type Story = StoryObj<typeof meta>

const ctx = {
  entityCatalogLayer: 'homebrew',
  equipmentCatalogStatus: 'ready',
  equipmentCatalogById: new Map(),
} as ContentFormCtx

function Host() {
  const values = resolveMonsterCreateDefaultValues()
  values.actions = [
    { id: 'claw', kind: 'natural-weapon', name: 'Claw', mode: 'melee', damageType: 'slashing' },
  ]
  const form = useForm<MonsterFormValues>({ defaultValues: values })
  return (
    <FormProvider {...form}>
      <Detail />
    </FormProvider>
  )
}

function Detail() {
  const sections = useMonsterActionSections()
  return <MonsterActionDetail ctx={ctx} sections={sections} located={sections.locate('claw')} />
}

export const Claw: Story = {
  args: { ctx, sections: undefined as never, located: null },
  render: () => <Host />,
}
