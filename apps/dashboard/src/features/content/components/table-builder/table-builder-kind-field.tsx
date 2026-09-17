import { useId, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { ConfirmDialog, RadioCard } from '@rpg/ui'

import {
  TABLE_BUILDER_KIND_CHANGE_CONFIRM_DESCRIPTION,
  TABLE_BUILDER_KIND_CHANGE_CONFIRM_HEADLINE,
  TABLE_BUILDER_KIND_CHANGE_CONFIRM_LABEL,
  TABLE_BUILDER_KIND_LABEL,
} from '../../lib/table-builder/table-builder-copy'
import {
  hasMeaningfulTableBuilderDraftContent,
  resetTableBuilderDraftForKindChange,
  type TableBuilderFormValues,
} from '../../lib/table-builder/table-builder-draft'
import type {
  TableBuilderHostConfig,
  TableBuilderMode,
} from '../../lib/table-builder/table-builder-host-config'
import {
  buildTableBuilderKindRadioOptions,
  tableBuilderKindLabel,
} from '../../lib/table-builder/table-builder-kind-options.lib'
import { resolveTableKindPresentation } from '../../lib/table-builder/table-builder-kind-ui.lib'
import type { TableBuilderKind } from '../../lib/table-builder/table-builder-kind'
import {
  tableBuilderKindMetadataClasses,
  tableBuilderKindMetadataLabelClasses,
  tableBuilderKindMetadataValueClasses,
} from './table-builder.variants'

export type TableBuilderKindFieldProps = {
  config: TableBuilderHostConfig
  mode: TableBuilderMode
}

function TableBuilderKindMetadata({
  id,
  label,
  value,
}: {
  id: string
  label: string
  value: string
}) {
  const labelId = `${id}-label`
  return (
    <div className={tableBuilderKindMetadataClasses}>
      <div id={labelId} className={tableBuilderKindMetadataLabelClasses}>
        {label}
      </div>
      <div id={id} className={tableBuilderKindMetadataValueClasses} aria-labelledby={labelId}>
        {value}
      </div>
    </div>
  )
}

export function TableBuilderKindField({ config, mode }: TableBuilderKindFieldProps) {
  const fieldId = useId()
  const form = useFormContext<TableBuilderFormValues>()
  const currentKind = useWatch({ control: form.control, name: 'kind' }) ?? 'levelProgression'
  const [pendingKind, setPendingKind] = useState<TableBuilderKind | null>(null)

  const presentation = resolveTableKindPresentation(config, mode, currentKind)

  function applyKindChange(nextKind: TableBuilderKind) {
    const reset = resetTableBuilderDraftForKindChange(form.getValues(), nextKind)
    form.setValue('kind', reset.kind, { shouldDirty: true })
    form.setValue('columns', reset.columns, { shouldDirty: true })
    form.setValue('rows', reset.rows, { shouldDirty: true })
  }

  function handleKindChangeRequest(nextKind: string) {
    const kind = nextKind as TableBuilderKind
    if (kind === currentKind) return

    const draft = form.getValues()
    if (!hasMeaningfulTableBuilderDraftContent(draft)) {
      applyKindChange(kind)
      return
    }

    setPendingKind(kind)
  }

  if (presentation.mode === 'metadata') {
    return (
      <TableBuilderKindMetadata
        id={fieldId}
        label={TABLE_BUILDER_KIND_LABEL}
        value={tableBuilderKindLabel(presentation.kind)}
      />
    )
  }

  const orderedKindOptions = buildTableBuilderKindRadioOptions(presentation.kinds)

  return (
    <>
      <RadioCard
        aria-label={TABLE_BUILDER_KIND_LABEL}
        visualControl="icon"
        density="compact"
        className="grid-cols-1 sm:grid-cols-2"
        options={orderedKindOptions}
        value={currentKind}
        onValueChange={handleKindChangeRequest}
      />

      <ConfirmDialog
        open={pendingKind !== null}
        onOpenChange={(open) => {
          if (!open) setPendingKind(null)
        }}
        headline={TABLE_BUILDER_KIND_CHANGE_CONFIRM_HEADLINE}
        description={TABLE_BUILDER_KIND_CHANGE_CONFIRM_DESCRIPTION}
        confirmLabel={TABLE_BUILDER_KIND_CHANGE_CONFIRM_LABEL}
        confirmVariant="destructive"
        onConfirm={() => {
          if (pendingKind !== null) {
            applyKindChange(pendingKind)
          }
          setPendingKind(null)
        }}
      />
    </>
  )
}
