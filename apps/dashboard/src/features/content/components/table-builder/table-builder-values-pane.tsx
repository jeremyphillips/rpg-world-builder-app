import { FormProvider, type UseFormReturn } from 'react-hook-form'

import type { TableBuilderFormValues } from '../../lib/table-builder/table-builder-draft'
import type { TableBuilderHostConfig } from '../../lib/table-builder/table-builder-host-config'
import { TableBuilderHostConfigProvider } from '../../lib/table-builder/table-builder-host-context'
import { TableBuilderValues, type TableBuilderValuesChrome } from './table-builder-values'

export type TableBuilderValuesPaneProps = {
  form: UseFormReturn<TableBuilderFormValues>
  config: TableBuilderHostConfig
  allowedLevels: readonly number[]
  chrome?: TableBuilderValuesChrome
}

/**
 * Embeddable sparse values grid for hosts that own their own modal chrome.
 * Wraps the isolated table draft form and host config — no name/kind/preview panes.
 */
export function TableBuilderValuesPane({
  form,
  config,
  allowedLevels,
  chrome = 'bare',
}: TableBuilderValuesPaneProps) {
  return (
    <TableBuilderHostConfigProvider config={config}>
      <FormProvider {...form}>
        <TableBuilderValues allowedLevels={allowedLevels} chrome={chrome} />
      </FormProvider>
    </TableBuilderHostConfigProvider>
  )
}
