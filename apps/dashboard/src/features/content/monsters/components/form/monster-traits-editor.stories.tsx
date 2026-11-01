import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import { MonsterTraitsEditor } from './monster-traits-editor'

const meta = {
  title: 'Dashboard/Content/Monsters/MonsterTraitsEditor',
  component: MonsterTraitsEditor,
  args: { ctx: { entityCatalogLayer: 'homebrew' } },
} satisfies Meta<typeof MonsterTraitsEditor>

export default meta

type Story = StoryObj<typeof meta>

function Host({ values, width }: { values?: MonsterFormValues; width?: number }) {
  const form = useForm<MonsterFormValues>({
    defaultValues: values ?? resolveMonsterCreateDefaultValues(),
  })
  const ctx: ContentFormCtx = { entityCatalogLayer: 'homebrew' }
  return (
    <div style={width ? { maxWidth: width } : undefined}>
      <FormProvider {...form}>
        <MonsterTraitsEditor ctx={ctx} />
      </FormProvider>
    </div>
  )
}

export const Empty: Story = { render: () => <Host /> }

export const WithAvailability: Story = {
  render: () => {
    const values = resolveMonsterCreateDefaultValues()
    values.traits = [
      {
        id: 'pack',
        kind: 'custom',
        name: 'Pack Tactics',
        description: 'Advantage when an ally is adjacent.',
      },
      {
        id: 'sunlight',
        kind: 'custom',
        name: 'Sunlight Sensitivity',
        description: 'Disadvantage in sunlight.',
        available: false,
      },
    ]
    return <Host values={values} />
  },
}

export const Narrow: Story = { render: () => <Host width={360} /> }
