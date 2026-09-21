import { useWatch } from 'react-hook-form'
import { formatFieldMessage } from '@rpg/contracts'
import { Alert } from '@rpg/ui'
import { FormSectionHeader } from '@rpg/ui/form'

import { TABLE_BUILDER_VALUES_LABEL } from '../../lib/table-builder/table-builder-copy'
import type { TableBuilderFormValues } from '../../lib/table-builder/table-builder-draft'
import type { TableBuilderHostConfig } from '../../lib/table-builder/table-builder-host-config'
import {
  tableBuilderGroupClasses,
  tableBuilderSectionClasses,
  tableBuilderSectionErrorClasses,
} from './table-builder.variants'
import { tableBuilderValuesStickyPaddingClasses } from './table-builder-values.variants'
import { useTableBuilderHostConfig } from '../../lib/table-builder/table-builder-host-context'
import { TableBuilderValuesGrid } from './table-builder-values-grid'
import {
  resolveTableBuilderValuesHint,
  useTableBuilderValues,
  type TableBuilderValuesState,
} from './table-builder-values.lib'

export type TableBuilderValuesChrome = 'section' | 'bare'

export type TableBuilderValuesProps = {
  allowedLevels: readonly number[]
  /** `section` includes the values heading and host notice; `bare` is grid-only. */
  chrome?: TableBuilderValuesChrome
}

type TableBuilderValuesBodyProps = {
  allowedLevels: readonly number[]
  fixedLevels: boolean
  values: TableBuilderValuesState
}

function TableBuilderValuesGridBlock({
  allowedLevels,
  fixedLevels,
  values,
}: TableBuilderValuesBodyProps) {
  if (values.hasNoColumns) return null

  return (
    <div className={tableBuilderGroupClasses}>
      <TableBuilderValuesGrid
        allowedLevels={allowedLevels}
        columns={values.columns}
        fields={values.fields}
        rowLevels={values.rowLevels}
        usedLevels={values.usedLevels}
        includeLevel={values.includeLevel}
        gridTemplate={values.gridTemplate}
        includeActions={!fixedLevels}
        addRowDisabled={values.addRowDisabled}
        onLevelChange={values.handleLevelChange}
        onAddRow={values.handleAddRow}
        onRemoveRow={values.removeRow}
      />
    </div>
  )
}

function TableBuilderValuesRowsError({ message }: { message: string | undefined }) {
  if (!message) return null
  return <p className={tableBuilderSectionErrorClasses}>{formatFieldMessage(message)}</p>
}

function resolveSectionValuesNotice(config: TableBuilderHostConfig, draft: TableBuilderFormValues) {
  return config.resolveValuesNotice?.({
    draft: {
      kind: draft.kind ?? 'levelProgression',
      name: draft.name ?? '',
      columns: draft.columns ?? [],
      rows: draft.rows ?? [],
    },
  })
}

function TableBuilderValuesBareChrome(props: TableBuilderValuesBodyProps) {
  return (
    <div className={tableBuilderSectionClasses}>
      <TableBuilderValuesGridBlock {...props} />
      <TableBuilderValuesRowsError message={props.values.rowsErrorMessage} />
    </div>
  )
}

type TableBuilderValuesSectionChromeProps = TableBuilderValuesBodyProps & {
  valuesNotice?: ReturnType<NonNullable<TableBuilderHostConfig['resolveValuesNotice']>>
  stickyPadding?: string
}

function TableBuilderValuesSectionChrome({
  allowedLevels,
  fixedLevels,
  values,
  valuesNotice,
  stickyPadding,
}: TableBuilderValuesSectionChromeProps) {
  return (
    <section
      className={[tableBuilderSectionClasses, stickyPadding].filter(Boolean).join(' ')}
      aria-label={TABLE_BUILDER_VALUES_LABEL}
    >
      <FormSectionHeader
        label={TABLE_BUILDER_VALUES_LABEL}
        hint={resolveTableBuilderValuesHint(values.hasNoColumns, values.includeLevel)}
        labelPresentation="field-label"
        size="md"
        required
      />
      {valuesNotice ? (
        <Alert
          variant="info"
          density="compact"
          title={valuesNotice.title}
          description={valuesNotice.description}
        />
      ) : null}
      <TableBuilderValuesGridBlock
        allowedLevels={allowedLevels}
        fixedLevels={fixedLevels}
        values={values}
      />
      <TableBuilderValuesRowsError message={values.rowsErrorMessage} />
    </section>
  )
}

export function TableBuilderValues({ allowedLevels, chrome = 'section' }: TableBuilderValuesProps) {
  const config = useTableBuilderHostConfig()
  const values = useTableBuilderValues(allowedLevels)
  const fixedLevels = config.rows === 'fixedLevels'
  const draft = useWatch<TableBuilderFormValues>() as TableBuilderFormValues

  const bodyProps: TableBuilderValuesBodyProps = { allowedLevels, fixedLevels, values }

  if (chrome === 'bare') {
    return <TableBuilderValuesBareChrome {...bodyProps} />
  }

  const stickyPadding =
    config.resolveExtendedProgressionAction !== undefined
      ? tableBuilderValuesStickyPaddingClasses
      : undefined

  return (
    <TableBuilderValuesSectionChrome
      {...bodyProps}
      valuesNotice={resolveSectionValuesNotice(config, draft)}
      stickyPadding={stickyPadding}
    />
  )
}
