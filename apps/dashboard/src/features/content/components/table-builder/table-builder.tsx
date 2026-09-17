import { useId } from 'react'
import { FormProvider, type UseFormReturn } from 'react-hook-form'
import { formatFieldMessage } from '@rpg/contracts'
import { TextField } from '@rpg/ui'

import {
  TABLE_BUILDER_NAME_HINT,
  TABLE_BUILDER_NAME_LABEL,
} from '../../lib/table-builder/table-builder-copy'
import type { TableBuilderFormValues } from '../../lib/table-builder/table-builder-draft'
import type { TableBuilderKind } from '../../lib/table-builder/table-builder-kind'
import {
  tableBuilderAuthoringPaneClasses,
  tableBuilderLayoutClasses,
  tableBuilderPreviewPaneClasses,
} from './table-builder.variants'
import { TableBuilderColumns } from './table-builder-columns'
import { TableBuilderPreview } from './table-builder-preview'
import { TableBuilderValues } from './table-builder-values'

export type TableBuilderProps = {
  /** Isolated draft form owned by the hosting surface (modal or story harness). */
  form: UseFormReturn<TableBuilderFormValues>
  kind: TableBuilderKind
  /** Semantic level set the structural axis may use — progression tables only. */
  allowedLevels: readonly number[]
}

/**
 * Reusable structured-table authoring surface: name, columns editor, values
 * grid, and live preview. Renders no chrome of its own — the host provides the
 * modal (or page) shell, the `<form>` element, and footer actions.
 */
export function TableBuilder({ form, kind, allowedLevels }: TableBuilderProps) {
  const nameId = useId()
  const nameError = form.getFieldState('name', form.formState).error

  return (
    <FormProvider {...form}>
      <div className={tableBuilderLayoutClasses}>
        <div className={tableBuilderAuthoringPaneClasses}>
          <TextField
            id={nameId}
            label={TABLE_BUILDER_NAME_LABEL}
            hint={TABLE_BUILDER_NAME_HINT}
            required
            error={nameError?.message ? formatFieldMessage(nameError.message) : undefined}
            invalid={Boolean(nameError)}
            {...form.register('name')}
          />
          <TableBuilderColumns kind={kind} />
          <TableBuilderValues kind={kind} allowedLevels={allowedLevels} />
        </div>
        <div className={tableBuilderPreviewPaneClasses}>
          <TableBuilderPreview />
        </div>
      </div>
    </FormProvider>
  )
}
