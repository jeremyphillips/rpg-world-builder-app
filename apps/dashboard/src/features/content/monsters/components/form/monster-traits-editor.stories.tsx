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
  args: { ctx: { entitySource: 'homebrew' } },
} satisfies Meta<typeof MonsterTraitsEditor>

export default meta

type Story = StoryObj<typeof meta>

function Host({ values, width }: { values?: MonsterFormValues; width?: number }) {
  const form = useForm<MonsterFormValues>({
    defaultValues: values ?? resolveMonsterCreateDefaultValues(),
  })
  const ctx: ContentFormCtx = { entitySource: 'homebrew' }
  return (
    <div style={width ? { maxWidth: width } : undefined}>
      <FormProvider {...form}>
        <MonsterTraitsEditor ctx={ctx} />
      </FormProvider>
    </div>
  )
}

export const Empty: Story = { render: () => <Host /> }

export const Narrow: Story = { render: () => <Host width={360} /> }
