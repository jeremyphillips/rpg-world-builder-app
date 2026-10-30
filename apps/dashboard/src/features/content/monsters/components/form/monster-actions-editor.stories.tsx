import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import { MonsterActionsEditor } from './monster-actions-editor'

const meta = {
  title: 'Dashboard/Content/Monsters/MonsterActionsEditor',
  component: MonsterActionsEditor,
  args: {
    ctx: {
      entityCatalogLayer: 'homebrew',
      equipmentCatalogStatus: 'ready',
      equipmentCatalogById: new Map(),
    },
  },
} satisfies Meta<typeof MonsterActionsEditor>

export default meta

type Story = StoryObj<typeof meta>

function Host({ width }: { width?: number }) {
  const values = resolveMonsterCreateDefaultValues()
  values.actions = [
    { id: 'claw', kind: 'natural-weapon', name: 'Claw', mode: 'melee', damageType: 'slashing' },
  ]
  const form = useForm<MonsterFormValues>({ defaultValues: values })
  const ctx: ContentFormCtx = {
    entityCatalogLayer: 'homebrew',
    equipmentCatalogStatus: 'ready',
    equipmentCatalogById: new Map(),
  }
  return (
    <div style={width ? { maxWidth: width } : undefined}>
      <FormProvider {...form}>
        <MonsterActionsEditor ctx={ctx} />
      </FormProvider>
    </div>
  )
}

export const Wide: Story = { render: () => <Host /> }

export const Narrow: Story = { render: () => <Host width={360} /> }
