import type { Meta, StoryObj } from '@storybook/react-vite'
import { createMonsterDraftInputSchema } from '@rpg/contracts'
import { TabbedForm } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import { buildMonsterTabs } from '../../../lib/monster-form-fields'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../../lib/monster-form-values'

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
  title: 'Dashboard/Content/Monsters/MonsterFormsEditor',
  component: MonsterFormsStory,
} satisfies Meta<typeof MonsterFormsStory>

export default meta
type Story = StoryObj<typeof meta>

function valuesWithForms(
  trueForm: NonNullable<MonsterFormValues['forms']>['trueForm'],
  definedForms: NonNullable<MonsterFormValues['forms']>['definedForms'],
): MonsterFormValues {
  return {
    ...resolveMonsterCreateDefaultValues(),
    forms: {
      profileFormId: 'profile',
      trueForm,
      definedForms,
    },
  }
}

const definedRows = [
  { id: 'humanoid', name: 'Humanoid' },
  { id: 'bear', name: 'Bear', overrides: { sizes: ['large' as const] } },
]

export const CreatureProfile: Story = {
  args: { values: valuesWithForms({ kind: 'profile' }, definedRows) },
}
export const DefinedFormWithoutRows: Story = {
  args: { values: valuesWithForms({ kind: 'defined', formId: undefined }, []) },
}
export const DefinedFormAwaitingSelection: Story = {
  args: { values: valuesWithForms({ kind: 'defined', formId: undefined }, definedRows) },
}
export const DefinedFormSelected: Story = {
  args: {
    values: valuesWithForms({ kind: 'defined', formId: 'humanoid' }, definedRows),
  },
}
