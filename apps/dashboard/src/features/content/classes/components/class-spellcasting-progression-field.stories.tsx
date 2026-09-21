import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { makeContentFormCtx } from '../../lib/fixtures/content-form-ctx'
import { ClassSpellcastingProgressionField } from './class-spellcasting-progression-field'

const meta = {
  title: 'Content/Classes/ClassSpellcastingProgressionField',
  component: ClassSpellcastingProgressionField,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ClassSpellcastingProgressionField>

export default meta
type Story = StoryObj

function BardProgressionHarness() {
  const form = useForm({
    defaultValues: {
      grantsCantrips: true,
      spellSelectionModel: 'limitedRepertoire',
      spellcasting: {
        progression: {
          cantrips: {
            curve: {
              rows: [
                { level: 1, count: 2 },
                { level: 4, count: 3 },
              ],
            },
            extension: 'carryForward',
          },
          repertoire: {
            curve: {
              rows: [
                { level: 1, count: 4 },
                { level: 10, count: 12 },
              ],
            },
            extension: 'carryForward',
          },
        },
      },
    },
  })

  return (
    <FormProvider {...form}>
      <ClassSpellcastingProgressionField formCtx={makeContentFormCtx()} />
    </FormProvider>
  )
}

export const BardTwoColumn: Story = {
  name: 'Bard (cantrips + repertoire)',
  render: () => <BardProgressionHarness />,
}
