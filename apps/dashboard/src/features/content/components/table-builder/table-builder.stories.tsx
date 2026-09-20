import type { Meta, StoryObj } from '@storybook/react-vite'
import { zodResolver } from '@hookform/resolvers/zod'
import { loadSpellcastingProgressionSeed } from '@rpg/catalog/spellcasting-progressions'
import { useForm } from 'react-hook-form'
import type { ProgressionTable } from '@rpg/contracts'

import {
  buildLeveledSlotProgressionDraft,
  buildLeveledSlotProgressionHostConfig,
} from '@/features/campaign'
import {
  createEmptyTableBuilderDraft,
  tableToDraft,
  type TableBuilderFormValues,
} from '../../lib/table-builder/table-builder-draft'
import type {
  TableBuilderHostConfig,
  TableBuilderMode,
} from '../../lib/table-builder/table-builder-host-config'
import { resolveTableBuilderFormSchema } from '../../lib/table-builder/resolve-table-builder-form-schema'
import {
  martialArtsProgressionTableFixture,
  mixedProgressionTableFixture,
  rageProgressionTableFixture,
} from '../tables/progression-table-fixtures'
import { TableBuilder } from './table-builder'

const ALLOWED_LEVELS = Array.from({ length: 20 }, (_, index) => index + 1)

const FULL_CASTER = loadSpellcastingProgressionSeed('srd-cc-5.2.1').slotProgressions.find(
  (entry) => entry.id === 'full-caster',
)!

const LEVELED_SLOT_CONFIG = buildLeveledSlotProgressionHostConfig({ effectiveMaxLevel: 20 })

const CLASS_FEATURE_CONFIG: TableBuilderHostConfig = {
  allowedKinds: ['levelProgression', 'general'],
  recommendedKind: 'levelProgression',
  allowedLevels: ALLOWED_LEVELS,
}

type HarnessProps = {
  table?: ProgressionTable
  config?: TableBuilderHostConfig
  mode?: TableBuilderMode
  initialDraft?: TableBuilderFormValues
}

/** Standalone harness — the modal normally owns this isolated draft form. */
function TableBuilderHarness({
  table,
  config = CLASS_FEATURE_CONFIG,
  mode = table === undefined ? 'create' : 'edit',
  initialDraft,
}: HarnessProps) {
  const form = useForm<TableBuilderFormValues>({
    resolver: zodResolver(resolveTableBuilderFormSchema(config)),
    defaultValues:
      initialDraft ?? (table !== undefined ? tableToDraft(table) : createEmptyTableBuilderDraft()),
  })

  return (
    <form noValidate onSubmit={form.handleSubmit(() => undefined)}>
      <TableBuilder form={form} config={config} mode={mode} />
    </form>
  )
}

const meta = {
  title: 'Content/TableBuilder/TableBuilder',
  component: TableBuilderHarness,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TableBuilderHarness>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const RageProgression: Story = {
  args: { table: rageProgressionTableFixture },
}

export const MartialArtsDice: Story = {
  args: { table: martialArtsProgressionTableFixture },
}

export const MixedColumnTypes: Story = {
  args: { table: mixedProgressionTableFixture },
}

export const SignedFormatting: Story = {
  args: { table: rageProgressionTableFixture },
}

export const KindSelectionCreate: Story = {
  args: { mode: 'create', config: CLASS_FEATURE_CONFIG },
}

export const KindReadOnlyEdit: Story = {
  args: {
    table: rageProgressionTableFixture,
    mode: 'edit',
    config: CLASS_FEATURE_CONFIG,
  },
}

export const WideLeveledSlotProgression: Story = {
  args: {
    config: LEVELED_SLOT_CONFIG,
    mode: 'edit',
    initialDraft: buildLeveledSlotProgressionDraft({
      label: 'Full caster',
      effectiveMaxLevel: 20,
      seedRows: FULL_CASTER.kind === 'leveled' ? FULL_CASTER.rows : [],
    }),
  },
}
