import type { Meta, StoryObj } from '@storybook/react-vite'
import { loadSpellcastingProgressionSeed } from '@rpg/catalog/spellcasting-progressions'
import { FormProvider, useForm } from 'react-hook-form'

import {
  buildLeveledSlotProgressionDraft,
  buildLeveledSlotProgressionHostConfig,
} from '@/features/campaign'
import {
  tableToDraft,
  type TableBuilderFormValues,
} from '../../lib/table-builder/table-builder-draft'
import { TableBuilderHostConfigProvider } from '../../lib/table-builder/table-builder-host-context'
import { rageProgressionTableFixture } from '../tables/progression-table-fixtures'
import { TableBuilderPreview } from './table-builder-preview'

const FULL_CASTER = loadSpellcastingProgressionSeed('srd-cc-5.2.1').slotProgressions.find(
  (entry) => entry.id === 'full-caster',
)!

type HarnessProps = {
  values: TableBuilderFormValues
  hostConfig?: ReturnType<typeof buildLeveledSlotProgressionHostConfig>
}

function PreviewHarness({ values, hostConfig }: HarnessProps) {
  const form = useForm<TableBuilderFormValues>({ defaultValues: values })
  const preview = <TableBuilderPreview />

  return (
    <FormProvider {...form}>
      {hostConfig ? (
        <TableBuilderHostConfigProvider config={hostConfig}>
          {preview}
        </TableBuilderHostConfigProvider>
      ) : (
        preview
      )}
    </FormProvider>
  )
}

const meta = {
  title: 'Content/TableBuilder/TableBuilderPreview',
  component: PreviewHarness,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PreviewHarness>

export default meta
type Story = StoryObj<typeof meta>

export const ResolvedDraft: Story = {
  args: { values: tableToDraft(rageProgressionTableFixture) },
}

export const IncompleteDraft: Story = {
  args: {
    values: {
      kind: 'levelProgression',
      name: '',
      columns: [
        { key: 'a', label: 'Uses', valueType: 'number', format: 'plain' },
        { key: 'b', label: '', valueType: 'dice', format: 'plain' },
      ],
      rows: [
        { level: '1', cells: { a: '2' } },
        { level: '', cells: { b: { count: '1', faces: '6' } } },
      ],
    },
  },
}

export const EmptyDraft: Story = {
  args: { values: { kind: 'levelProgression', name: '', columns: [], rows: [] } },
}

export const WideLeveledSlotProgression: Story = {
  args: {
    values: buildLeveledSlotProgressionDraft({
      label: 'Full caster',
      effectiveMaxLevel: 20,
      seedRows: FULL_CASTER.kind === 'leveled' ? FULL_CASTER.rows : [],
    }),
    hostConfig: buildLeveledSlotProgressionHostConfig({ effectiveMaxLevel: 20 }),
  },
}

export const ExtendedLeveledSlotProgression: Story = {
  args: {
    values: buildLeveledSlotProgressionDraft({
      label: 'Full caster',
      effectiveMaxLevel: 22,
      seedRows: FULL_CASTER.kind === 'leveled' ? FULL_CASTER.rows : [],
      extendedTierName: 'Epic Destiny',
    }),
    hostConfig: buildLeveledSlotProgressionHostConfig({
      effectiveMaxLevel: 22,
      maxCharacterLevel: 20,
      extendedTierName: 'Epic Destiny',
    }),
  },
}
