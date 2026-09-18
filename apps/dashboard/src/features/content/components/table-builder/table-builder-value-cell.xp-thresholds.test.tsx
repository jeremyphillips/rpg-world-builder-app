import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import {
  buildXpThresholdsDraft,
  buildXpThresholdsHostConfig,
  resolveSystemXpEntries,
} from '@/features/campaign/lib/rules/character-configuration/xp-thresholds-field.lib'
import { TableBuilderHostConfigProvider } from '@/features/content/lib/table-builder/table-builder-host-context'
import type { TableBuilderFormValues } from '@/features/content/lib/table-builder/table-builder-draft'

import { TableBuilderValueCell } from './table-builder-value-cell'

function XpThresholdCellHarness({
  defaultValues,
  rowIndex,
  level,
}: {
  defaultValues: TableBuilderFormValues
  rowIndex: number
  level: number
}) {
  const form = useForm<TableBuilderFormValues>({ defaultValues, mode: 'onSubmit' })
  const column = defaultValues.columns[0]!
  const draft = useWatch({ control: form.control }) as TableBuilderFormValues

  return (
    <FormProvider {...form}>
      <TableBuilderHostConfigProvider
        config={buildXpThresholdsHostConfig({
          effectiveMaxLevel: defaultValues.rows.length,
          systemEntries: resolveSystemXpEntries('srd-cc-5.2.1'),
          dormantOverrides: [],
          extendedProgressionEnabled: true,
          maxCharacterLevel: 20,
          extendedTierName: 'Epic Destiny',
        })}
      >
        <TableBuilderValueCell
          draft={{
            kind: draft.kind ?? defaultValues.kind,
            name: draft.name ?? defaultValues.name,
            columns: draft.columns ?? defaultValues.columns,
            rows: draft.rows ?? defaultValues.rows,
          }}
          rowIndex={rowIndex}
          column={column}
          columnIndex={0}
          level={level}
          ariaLabel={`XP required, level ${level}`}
        />
      </TableBuilderHostConfigProvider>
    </FormProvider>
  )
}

describe('TableBuilderValueCell XP thresholds', () => {
  it('does not show progression error while typing', async () => {
    const user = userEvent.setup()
    const draft = buildXpThresholdsDraft({
      effectiveMaxLevel: 25,
      systemEntries: resolveSystemXpEntries('srd-cc-5.2.1'),
      overrides: [],
      extendedProgressionEnabled: true,
      maxCharacterLevel: 20,
      extendedTierName: 'Epic Destiny',
    })

    render(<XpThresholdCellHarness defaultValues={draft} rowIndex={24} level={25} />)

    const input = screen.getByRole('textbox', { name: 'XP required, level 25' })
    await user.type(input, '5')

    expect(screen.queryByText('Enter 555,001 or more.')).not.toBeInTheDocument()
    expect(input).toHaveFocus()
  })

  it('formats grouped values after input change', async () => {
    const draft = buildXpThresholdsDraft({
      effectiveMaxLevel: 25,
      systemEntries: resolveSystemXpEntries('srd-cc-5.2.1'),
      overrides: [],
      extendedProgressionEnabled: true,
      maxCharacterLevel: 20,
      extendedTierName: 'Epic Destiny',
    })

    render(<XpThresholdCellHarness defaultValues={draft} rowIndex={24} level={25} />)

    const input = screen.getByRole('textbox', { name: 'XP required, level 25' })
    fireEvent.change(input, { target: { value: '405,000' } })

    expect(input).toHaveValue('405,000')
  })

  it('shows grouped placeholder formatting for derived cells', () => {
    const draft = buildXpThresholdsDraft({
      effectiveMaxLevel: 25,
      systemEntries: resolveSystemXpEntries('srd-cc-5.2.1'),
      overrides: [],
      extendedProgressionEnabled: true,
      maxCharacterLevel: 20,
      extendedTierName: 'Epic Destiny',
    })

    render(<XpThresholdCellHarness defaultValues={draft} rowIndex={20} level={21} />)

    expect(screen.getByPlaceholderText('405,000')).toBeInTheDocument()
  })
})
