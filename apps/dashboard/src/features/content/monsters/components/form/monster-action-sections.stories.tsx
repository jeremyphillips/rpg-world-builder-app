import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import { MonsterActionSections } from './monster-action-sections'

const meta = {
  title: 'Dashboard/Content/Monsters/MonsterActionSections',
  component: MonsterActionSections,
  args: {
    ctx: {
      entityCatalogLayer: 'homebrew',
      equipmentCatalogStatus: 'ready',
      equipmentCatalogById: new Map(),
    },
  },
} satisfies Meta<typeof MonsterActionSections>

export default meta

type Story = StoryObj<typeof meta>

function Host({ width, values }: { width?: number; values?: MonsterFormValues }) {
  const defaults = resolveMonsterCreateDefaultValues()
  defaults.actions = [
    { id: 'claw', kind: 'natural-weapon', name: 'Claw', mode: 'melee', damageType: 'slashing' },
  ]
  const form = useForm<MonsterFormValues>({ defaultValues: values ?? defaults })
  const ctx: ContentFormCtx = {
    entityCatalogLayer: 'homebrew',
    equipmentCatalogStatus: 'ready',
    equipmentCatalogById: new Map(),
  }
  return (
    <div style={width ? { maxWidth: width } : undefined}>
      <FormProvider {...form}>
        <MonsterActionSections ctx={ctx} />
      </FormProvider>
    </div>
  )
}

export const Wide: Story = { render: () => <Host /> }

export const Narrow: Story = { render: () => <Host width={360} /> }

export const WithUnavailableAction: Story = {
  render: () => {
    const values = resolveMonsterCreateDefaultValues()
    values.actions = [
      { id: 'claw', kind: 'natural-weapon', name: 'Claw', mode: 'melee', damageType: 'slashing' },
      {
        id: 'tail',
        kind: 'natural-weapon',
        name: 'Tail',
        mode: 'melee',
        damageType: 'bludgeoning',
        available: false,
      },
    ]
    return <Host values={values} />
  },
}
