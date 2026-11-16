import type { Meta, StoryObj } from '@storybook/react-vite'
import { createMonsterDraftInputSchema } from '@rpg/contracts'
import { TabbedForm } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { buildMonsterTabs } from '../../lib/monster-form-fields'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'

const ctx: ContentFormCtx = { entityCatalogLayer: 'homebrew' }

function MonsterFormsStory({ values }: { values: MonsterFormValues }) {
  const creatureDetails = buildMonsterTabs(ctx).filter((tab) => tab.id === 'creatureDetails')
  return (
    <TabbedForm
      schema={createMonsterDraftInputSchema}
      tabs={creatureDetails}
      defaultValues={values}
      onSubmit={() => undefined}
    />
  )
}

const meta = {
  title: 'Dashboard/Content/Monsters/MonsterAlternateFormsEditor',
  component: MonsterFormsStory,
} satisfies Meta<typeof MonsterFormsStory>

export default meta
type Story = StoryObj<typeof meta>

function valuesWithForms(name?: string): MonsterFormValues {
  return {
    ...resolveMonsterCreateDefaultValues(),
    forms: {
      trueForm: { id: 'true', name: 'Humanoid' },
      alternates: [{ id: 'bear', name, appearance: 'bear', overrides: { sizes: ['large'] } }],
    },
  }
}

export const Empty: Story = { args: { values: resolveMonsterCreateDefaultValues() } }
export const Populated: Story = { args: { values: valuesWithForms('Bear') } }
export const InvalidDraft: Story = { args: { values: valuesWithForms() } }
