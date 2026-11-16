import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import type { MonsterActionDraftRow } from '../../../lib/actions/monster-action-presets'
import { monsterFormTestValues } from '../../../lib/monster-form-test-values'
import type { MonsterFormValues } from '../../../lib/monster-form-values'
import { MonsterActionShapeShiftSummary } from './monster-action-shape-shift-summary'

const shapeShift: MonsterActionDraftRow = {
  id: 'shape-shift',
  kind: 'shape-shift',
  equipment: 'worn-transforms',
  prerequisite: "the vampire isn't in sunlight or running water",
}

const ctx = {
  equipmentCatalogById: new Map(),
  spellCatalogById: new Map(),
} as unknown as ContentFormCtx

const meta = {
  title: 'Dashboard/Content/Monsters/MonsterActionShapeShiftSummary',
  component: MonsterActionShapeShiftSummary,
  args: { ctx, action: shapeShift },
} satisfies Meta<typeof MonsterActionShapeShiftSummary>

export default meta
type Story = StoryObj<typeof meta>

function Host() {
  const form = useForm<MonsterFormValues>({
    defaultValues: monsterFormTestValues({
      name: 'Vampire',
      sizes: ['medium'],
      forms: {
        profileFormId: 'vampire',
        trueForm: { kind: 'profile' },
        definedForms: [
          { id: 'bat', name: 'Bat', overrides: { sizes: ['tiny'] } },
          { id: 'mist', name: 'Cloud of mist', overrides: {} },
        ],
      },
      bonusActions: [shapeShift] as MonsterFormValues['bonusActions'],
    }),
  })
  return (
    <FormProvider {...form}>
      <MonsterActionShapeShiftSummary ctx={ctx} action={shapeShift} />
    </FormProvider>
  )
}

export const Default: Story = { render: () => <Host /> }
