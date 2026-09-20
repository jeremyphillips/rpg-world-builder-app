import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { loadSpellcastingProgressionSeed } from '@rpg/catalog/spellcasting-progressions'

import {
  buildLeveledSlotProgressionDraft,
  buildLeveledSlotProgressionHostConfig,
} from '@/features/campaign'
import type { TableBuilderFormValues } from '../../lib/table-builder/table-builder-draft'
import { TableBuilderHostConfigProvider } from '../../lib/table-builder/table-builder-host-context'
import { TableBuilderPreview } from './table-builder-preview'
import { TableBuilderValuesGrid } from './table-builder-values-grid'

const FULL_CASTER = loadSpellcastingProgressionSeed('srd-cc-5.2.1').slotProgressions.find(
  (entry) => entry.id === 'full-caster',
)!

function SlotProgressionHarness({
  defaultValues,
  effectiveMaxLevel = defaultValues.rows.length,
  children,
}: {
  defaultValues: TableBuilderFormValues
  effectiveMaxLevel?: number
  children: ReactNode
}) {
  const form = useForm<TableBuilderFormValues>({ defaultValues })

  return (
    <FormProvider {...form}>
      <TableBuilderHostConfigProvider
        config={buildLeveledSlotProgressionHostConfig({
          effectiveMaxLevel,
          maxCharacterLevel: 20,
          extendedTierName: effectiveMaxLevel > 20 ? 'Epic Destiny' : undefined,
        })}
      >
        {children}
      </TableBuilderHostConfigProvider>
    </FormProvider>
  )
}

describe('TableBuilder slot progression (wide fixed columns)', () => {
  it('renders sticky level headers and cells in the values grid', () => {
    const draft = buildLeveledSlotProgressionDraft({
      label: 'Full caster',
      effectiveMaxLevel: 20,
      seedRows: FULL_CASTER.kind === 'leveled' ? FULL_CASTER.rows : [],
    })

    render(
      <SlotProgressionHarness defaultValues={draft}>
        <TableBuilderValuesGrid
          allowedLevels={draft.rows.map((_, index) => index + 1)}
          columns={draft.columns}
          fields={draft.rows.map((row, index) => ({ id: row.key ?? `row-${index}` }))}
          rowLevels={draft.rows.map((row) => Number(row.level))}
          usedLevels={draft.rows.map((_, index) => index + 1)}
          includeLevel
          gridTemplate="5.5rem repeat(9, minmax(7rem, 1fr))"
          addRowDisabled
          onLevelChange={() => undefined}
          onAddRow={() => undefined}
          onRemoveRow={() => undefined}
        />
      </SlotProgressionHarness>,
    )

    expect(screen.getByText('Level').className).toMatch(/sticky/)
    expect(screen.getByText('1').className).toMatch(/sticky/)
    expect(screen.getByText('9th')).toBeInTheDocument()
  })

  it('renders the tier separator band after the standard max with nine slot columns', () => {
    const draft = buildLeveledSlotProgressionDraft({
      label: 'Full caster',
      effectiveMaxLevel: 22,
      seedRows: FULL_CASTER.kind === 'leveled' ? FULL_CASTER.rows : [],
      extendedTierName: 'Epic Destiny',
    })

    render(
      <SlotProgressionHarness defaultValues={draft} effectiveMaxLevel={22}>
        <TableBuilderValuesGrid
          allowedLevels={draft.rows.map((_, index) => index + 1)}
          columns={draft.columns}
          fields={draft.rows.map((row, index) => ({ id: row.key ?? `row-${index}` }))}
          rowLevels={draft.rows.map((row) => Number(row.level))}
          usedLevels={draft.rows.map((_, index) => index + 1)}
          includeLevel
          gridTemplate="5.5rem repeat(9, minmax(7rem, 1fr))"
          addRowDisabled
          onLevelChange={() => undefined}
          onAddRow={() => undefined}
          onRemoveRow={() => undefined}
        />
      </SlotProgressionHarness>,
    )

    expect(screen.getByText('Epic Destiny')).toBeInTheDocument()
  })

  it('renders a sticky level column in the embedded preview table', () => {
    const draft = buildLeveledSlotProgressionDraft({
      label: 'Full caster',
      effectiveMaxLevel: 20,
      seedRows: FULL_CASTER.kind === 'leveled' ? FULL_CASTER.rows : [],
    })

    const { container } = render(
      <SlotProgressionHarness defaultValues={draft}>
        <TableBuilderPreview />
      </SlotProgressionHarness>,
    )

    const levelHeader = screen.getByRole('columnheader', { name: 'Level' })
    expect(levelHeader.className).toMatch(/sticky/)

    expect(container.querySelector('table')).toBeTruthy()
    expect(container.querySelector('[class*="overflow-auto"] table')).toBeNull()
  })
})
