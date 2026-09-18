import type { ReactNode } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import {
  applyExtendedXpIncrementToDraft,
  buildXpThresholdsDraft,
  buildXpThresholdsHostConfig,
  resolveSystemXpEntries,
} from '@/features/campaign/lib/rules/character-configuration/xp-thresholds-field.lib'
import type { TableBuilderFormValues } from '@/features/content/lib/table-builder/table-builder-draft'

import { TableBuilderExtendedProgressionDock } from './table-builder-extended-progression-dock'
import { TableBuilderValueCell } from './table-builder-value-cell'
import { TableBuilderValuesRow } from './table-builder-values-row'
import { TableBuilderHostConfigProvider } from '../../lib/table-builder/table-builder-host-context'

const SYSTEM_ENTRIES = resolveSystemXpEntries('srd-cc-5.2.1')

function buildHostConfig(effectiveMaxLevel: number) {
  return buildXpThresholdsHostConfig({
    effectiveMaxLevel,
    systemEntries: SYSTEM_ENTRIES,
    dormantOverrides: [],
    extendedProgressionEnabled: effectiveMaxLevel > 20,
    maxCharacterLevel: 20,
    extendedTierName: effectiveMaxLevel > 20 ? 'Epic Destiny' : undefined,
  })
}

function XpTableBuilderHarness({
  defaultValues,
  children,
  effectiveMaxLevel = defaultValues.rows.length,
}: {
  defaultValues: TableBuilderFormValues
  children: ReactNode
  effectiveMaxLevel?: number
}) {
  const form = useForm<TableBuilderFormValues>({ defaultValues, mode: 'onSubmit' })

  return (
    <FormProvider {...form}>
      <TableBuilderHostConfigProvider config={buildHostConfig(effectiveMaxLevel)}>
        {children}
      </TableBuilderHostConfigProvider>
    </FormProvider>
  )
}

describe('TableBuilder XP thresholds', () => {
  it('shows the extended progression dock when extended levels exist', () => {
    const draft = buildXpThresholdsDraft({
      effectiveMaxLevel: 25,
      systemEntries: SYSTEM_ENTRIES,
      overrides: [],
      extendedProgressionEnabled: true,
      maxCharacterLevel: 20,
      extendedTierName: 'Epic Destiny',
    })

    render(
      <XpTableBuilderHarness defaultValues={draft}>
        <TableBuilderExtendedProgressionDock />
      </XpTableBuilderHarness>,
    )

    expect(screen.getByRole('button', { name: 'Set extended progression' })).toBeInTheDocument()
  })

  it('opens the bulk increment panel with the current increment', async () => {
    const user = userEvent.setup()
    const draft = buildXpThresholdsDraft({
      effectiveMaxLevel: 25,
      systemEntries: SYSTEM_ENTRIES,
      overrides: [],
      extendedProgressionEnabled: true,
      maxCharacterLevel: 20,
      extendedTierName: 'Epic Destiny',
    })

    render(
      <XpTableBuilderHarness defaultValues={draft}>
        <TableBuilderExtendedProgressionDock />
      </XpTableBuilderHarness>,
    )

    await user.click(screen.getByRole('button', { name: 'Set extended progression' }))

    expect(screen.getByText('Extended progression')).toBeInTheDocument()
    expect(screen.getByText(/· Levels 21–25/)).toBeInTheDocument()
    expect(screen.getByLabelText('XP increase per level')).toHaveValue('50,000')
  })

  it('shows icon-only restore with tooltip label for explicit overrides', async () => {
    const user = userEvent.setup()
    const draft = buildXpThresholdsDraft({
      effectiveMaxLevel: 25,
      systemEntries: SYSTEM_ENTRIES,
      overrides: [{ level: 6, xpRequired: 25_000 }],
      extendedProgressionEnabled: true,
      maxCharacterLevel: 20,
      extendedTierName: 'Epic Destiny',
    })

    render(
      <XpTableBuilderHarness defaultValues={draft} effectiveMaxLevel={25}>
        <TableBuilderValuesRow
          index={5}
          columns={draft.columns}
          includeLevel
          allowedLevels={draft.rows.map((_, index) => index + 1)}
          usedLevels={new Set([6])}
          onLevelChange={() => undefined}
          onRemove={() => undefined}
        />
      </XpTableBuilderHarness>,
    )

    const restore = screen.getByRole('button', { name: 'Restore system value' })
    expect(restore).toBeInTheDocument()
    await user.hover(restore)
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Restore system value')
  })

  it('clears an override on restore and surfaces invalid fallback state', async () => {
    const user = userEvent.setup()
    const draft = buildXpThresholdsDraft({
      effectiveMaxLevel: 10,
      systemEntries: SYSTEM_ENTRIES,
      overrides: [
        { level: 6, xpRequired: 25_000 },
        { level: 7, xpRequired: 30_000 },
      ],
    })
    render(
      <XpTableBuilderHarness defaultValues={draft} effectiveMaxLevel={10}>
        <TableBuilderValuesRow
          index={6}
          columns={draft.columns}
          includeLevel
          allowedLevels={draft.rows.map((_, index) => index + 1)}
          usedLevels={new Set([7])}
          onLevelChange={() => undefined}
          onRemove={() => undefined}
        />
      </XpTableBuilderHarness>,
    )

    await user.click(screen.getByRole('button', { name: 'Restore system value' }))

    expect(screen.getByRole('textbox', { name: 'XP required, level 7' })).toHaveValue('')
    expect(screen.getByText('Enter 25,001 or more.')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('23,000')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Restore system value' })).not.toBeInTheDocument()
  })

  it('focuses the input when clicking the grouped shell padding', () => {
    const draft = buildXpThresholdsDraft({
      effectiveMaxLevel: 25,
      systemEntries: SYSTEM_ENTRIES,
      overrides: [],
      extendedProgressionEnabled: true,
      maxCharacterLevel: 20,
      extendedTierName: 'Epic Destiny',
    })

    render(
      <XpTableBuilderHarness defaultValues={draft}>
        <TableBuilderValueCell
          draft={draft}
          rowIndex={20}
          column={draft.columns[0]!}
          columnIndex={0}
          level={21}
          ariaLabel="XP required, level 21"
        />
      </XpTableBuilderHarness>,
    )

    const input = screen.getByRole('textbox', { name: 'XP required, level 21' })
    const shell = input.closest('[class*="grid-cols-[1fr_1px_auto]"]')
    expect(shell).toBeTruthy()
    fireEvent.mouseDown(shell!)
    expect(input).toHaveFocus()
  })
})

describe('applyExtendedXpIncrementToDraft integration', () => {
  it('writes explicit thresholds across the extended range in the draft', () => {
    const draft = buildXpThresholdsDraft({
      effectiveMaxLevel: 25,
      systemEntries: SYSTEM_ENTRIES,
      overrides: [{ level: 22, xpRequired: 485_000 }],
    })
    const columnKey = draft.columns[0]!.key
    const nextDraft = applyExtendedXpIncrementToDraft(draft, SYSTEM_ENTRIES, 25, 65_000)

    expect(nextDraft.rows[20]?.cells[columnKey]).toBe('420000')
    expect(nextDraft.rows[21]?.cells[columnKey]).toBe('485000')
    expect(nextDraft.rows[24]?.cells[columnKey]).toBe('680000')
  })
})

describe('TableBuilderExtendedProgressionDock apply', () => {
  it('writes explicit thresholds across the extended range on apply', async () => {
    const user = userEvent.setup()
    const draft = buildXpThresholdsDraft({
      effectiveMaxLevel: 25,
      systemEntries: SYSTEM_ENTRIES,
      overrides: [{ level: 22, xpRequired: 999_999 }],
      extendedProgressionEnabled: true,
      maxCharacterLevel: 20,
      extendedTierName: 'Epic Destiny',
    })
    const columnKey = draft.columns[0]!.key

    function ApplyHarness() {
      const form = useForm<TableBuilderFormValues>({ defaultValues: draft, mode: 'onSubmit' })
      const rows = useWatch({ control: form.control, name: 'rows' })

      return (
        <FormProvider {...form}>
          <TableBuilderHostConfigProvider config={buildHostConfig(25)}>
            <TableBuilderExtendedProgressionDock />
            <output data-testid="level-22">{String(rows?.[21]?.cells[columnKey] ?? '')}</output>
            <output data-testid="level-25">{String(rows?.[24]?.cells[columnKey] ?? '')}</output>
          </TableBuilderHostConfigProvider>
        </FormProvider>
      )
    }

    render(<ApplyHarness />)

    await user.click(screen.getByRole('button', { name: 'Set extended progression' }))

    const incrementInput = screen.getByLabelText('XP increase per level')
    await user.clear(incrementInput)
    await user.type(incrementInput, '65000')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(screen.getByTestId('level-22')).toHaveTextContent('485000')
    expect(screen.getByTestId('level-25')).toHaveTextContent('680000')
  })

  it('shows the extended-range apply hint below the increment input', async () => {
    const user = userEvent.setup()
    const draft = buildXpThresholdsDraft({
      effectiveMaxLevel: 30,
      systemEntries: SYSTEM_ENTRIES,
      overrides: [],
      extendedProgressionEnabled: true,
      maxCharacterLevel: 20,
      extendedTierName: 'Epic Destiny',
    })

    render(
      <XpTableBuilderHarness defaultValues={draft}>
        <TableBuilderExtendedProgressionDock />
      </XpTableBuilderHarness>,
    )

    await user.click(screen.getByRole('button', { name: 'Set extended progression' }))

    expect(
      screen.getByText('Replaces existing explicit thresholds in this range.'),
    ).toBeInTheDocument()
  })
})
