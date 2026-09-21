import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { makeContentFormCtx } from '../../lib/fixtures/content-form-ctx'
import { ClassSpellbookAcquisitionField } from './class-spellbook-acquisition-field'
import { ClassSpellbookAcquisitionModal } from './class-spellbook-acquisition-modal'
import { buildClassSpellbookAcquisitionDraft } from '../lib/class-spellbook-acquisition-field.lib'
import {
  materializeRegularGain,
  SPELLBOOK_GAIN_MODE_REGULAR,
  SPELLBOOK_GAIN_MODE_VARIABLE,
} from '../lib/class-spell-selection-form.lib'

const meta = {
  title: 'Content/Classes/ClassSpellbookAcquisitionField',
  component: ClassSpellbookAcquisitionField,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ClassSpellbookAcquisitionField>

export default meta
type Story = StoryObj

function RegularWizardHarness() {
  const form = useForm({
    defaultValues: {
      spellSelectionModel: 'prepareFromLearnedCollection',
      spellbookAcquisitionIrregular: false,
      spellbookAcquisitionStarting: 6,
      spellbookAcquisitionPerLevel: 2,
      spellbookAcquisitionThroughLevel: 20,
    },
  })

  return (
    <FormProvider {...form}>
      <ClassSpellbookAcquisitionField formCtx={makeContentFormCtx()} />
    </FormProvider>
  )
}

function IrregularHarness() {
  const form = useForm({
    defaultValues: {
      spellSelectionModel: 'prepareFromLearnedCollection',
      spellbookAcquisitionIrregular: true,
      spellbookAcquisitionCurve: {
        curve: {
          rows: [
            { level: 1, count: 6 },
            { level: 2, count: 2 },
            { level: 4, count: 3 },
          ],
        },
        extension: 'zero',
      },
    },
  })

  return (
    <FormProvider {...form}>
      <ClassSpellbookAcquisitionField formCtx={makeContentFormCtx()} />
    </FormProvider>
  )
}

export const RegularWizard: Story = {
  name: 'Regular summary (6 / 2 / 20)',
  render: () => <RegularWizardHarness />,
}

export const IrregularCurve: Story = {
  name: 'Irregular summary',
  render: () => <IrregularHarness />,
}

export const RegularModal: StoryObj<typeof ClassSpellbookAcquisitionModal> = {
  name: 'Modal — regular acquisition',
  render: () => (
    <ClassSpellbookAcquisitionModal
      open
      formCtx={makeContentFormCtx()}
      maxLevel={20}
      allowedLevels={Array.from({ length: 20 }, (_, index) => index + 1)}
      initialGainMode={SPELLBOOK_GAIN_MODE_REGULAR}
      initialStarting={6}
      initialPerLevel={2}
      initialThroughLevel={20}
      initialTableDraft={buildClassSpellbookAcquisitionDraft(
        materializeRegularGain({ starting: 6, perLevel: 2, throughLevel: 20 }),
      )}
      onSave={() => undefined}
      onOpenChange={() => undefined}
    />
  ),
}

export const VariableModal: StoryObj<typeof ClassSpellbookAcquisitionModal> = {
  name: 'Modal — varies by level',
  render: () => (
    <ClassSpellbookAcquisitionModal
      open
      formCtx={makeContentFormCtx()}
      maxLevel={20}
      allowedLevels={Array.from({ length: 20 }, (_, index) => index + 1)}
      initialGainMode={SPELLBOOK_GAIN_MODE_VARIABLE}
      initialTableDraft={buildClassSpellbookAcquisitionDraft({
        curve: {
          rows: [
            { level: 1, count: 6 },
            { level: 2, count: 2 },
            { level: 4, count: 3 },
          ],
        },
        extension: 'zero',
      })}
      onSave={() => undefined}
      onOpenChange={() => undefined}
    />
  ),
}
