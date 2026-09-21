import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { makeContentFormCtx } from '../../lib/fixtures/content-form-ctx'
import { ClassSpellbookAcquisitionField } from './class-spellbook-acquisition-field'

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
      <ClassSpellbookAcquisitionField formCtx={makeContentFormCtx()} mode="regular" />
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
      <ClassSpellbookAcquisitionField formCtx={makeContentFormCtx()} mode="irregular" />
    </FormProvider>
  )
}

export const RegularWizard: Story = {
  name: 'Regular (6 / 2 / 20)',
  render: () => <RegularWizardHarness />,
}

export const IrregularCurve: Story = {
  name: 'Irregular table',
  render: () => <IrregularHarness />,
}
