import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { makeContentFormCtx } from '../../../lib/fixtures/content-form-ctx'
import { MasterDetailRowPrefixProvider } from '../../../lib/master-detail/master-detail-row-prefix.context'
import { FeatureTablesField } from './feature-tables-field'
import { FeatureTablesSection } from './feature-tables-section'
import { FeatureTableRow } from './feature-table-row'

const meta = {
  title: 'Content/Classes/FeatureTablesSection',
  component: FeatureTablesSection,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FeatureTablesSection>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  render: () => <FeatureTablesSection onAddTable={() => undefined} />,
}

export const PopulatedRows: Story = {
  render: () => (
    <FeatureTablesSection
      onAddTable={() => undefined}
      tables={[
        <FeatureTableRow
          key="rage"
          title="Rage progression"
          metadata="2 columns · 5 breakpoints"
          typeLabel="Level progression"
          onEdit={() => undefined}
        />,
      ]}
    />
  ),
}

function FeatureTablesFieldHarness() {
  const form = useForm({
    defaultValues: {
      features: [
        {
          name: 'Rage',
          level: 1,
          grants: [],
          tables: [],
          available: true,
        },
      ],
    },
  })

  return (
    <FormProvider {...form}>
      <MasterDetailRowPrefixProvider value="features.0">
        <FeatureTablesField formCtx={makeContentFormCtx()} />
      </MasterDetailRowPrefixProvider>
    </FormProvider>
  )
}

export const WiredField: Story = {
  render: () => <FeatureTablesFieldHarness />,
}
