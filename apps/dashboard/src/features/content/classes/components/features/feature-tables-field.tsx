import { useMemo, useState } from 'react'
import { useFormContext, useWatch, type FieldPath } from 'react-hook-form'
import type { ProgressionTable } from '@rpg/contracts'

import { TableBuilderModal } from '../../../components/table-builder/table-builder-modal'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { useMasterDetailRowPrefix } from '../../../lib/master-detail/master-detail-row-prefix.context'
import {
  buildFeatureTableAllowedLevels,
  featureTableKindLabel,
  formatFeatureTableMetadata,
} from '../../lib/feature-tables-field.lib'
import type { FeatureRowForm } from '../../lib/class-feature-form-fields'
import { DetailOverflowMenu } from '../../../lib/detail/detail-overflow-menu'
import { FeatureTableRow } from './feature-table-row'
import { FeatureTablesSection } from './feature-tables-section'

type FeatureTablesFieldProps = {
  formCtx: ContentFormCtx
}

type TableModalState = { mode: 'create' } | { mode: 'edit'; index: number; value: ProgressionTable }

export function FeatureTablesField({ formCtx }: FeatureTablesFieldProps) {
  const rowPrefix = useMasterDetailRowPrefix()
  const form = useFormContext<FeatureRowForm>()
  const tablesPath = `${rowPrefix}.tables` as FieldPath<FeatureRowForm>
  const levelPath = `${rowPrefix}.level` as FieldPath<FeatureRowForm>
  const tables = (useWatch({ control: form.control, name: tablesPath }) ?? []) as ProgressionTable[]
  const featureLevel = useWatch({ control: form.control, name: levelPath }) as
    | number
    | string
    | undefined
  const [modalState, setModalState] = useState<TableModalState | null>(null)

  const allowedLevels = useMemo(
    () => buildFeatureTableAllowedLevels(featureLevel, formCtx),
    [featureLevel, formCtx],
  )

  const setTables = (next: ProgressionTable[]) => {
    form.setValue(tablesPath, next, { shouldDirty: true, shouldValidate: true })
  }

  const handleSave = (table: ProgressionTable) => {
    if (!modalState) return

    if (modalState.mode === 'create') {
      setTables([...tables, table])
      return
    }

    setTables(tables.map((entry, index) => (index === modalState.index ? table : entry)))
  }

  const handleDelete = () => {
    if (!modalState || modalState.mode !== 'edit') return
    setTables(tables.filter((_, index) => index !== modalState.index))
  }

  const deleteTableAt = (index: number) => {
    setTables(tables.filter((_, entryIndex) => entryIndex !== index))
  }

  return (
    <>
      <FeatureTablesSection
        onAddTable={() => setModalState({ mode: 'create' })}
        tables={tables.map((table, index) => (
          <FeatureTableRow
            key={table.id}
            title={table.name}
            metadata={formatFeatureTableMetadata(table)}
            typeLabel={featureTableKindLabel(table)}
            onEdit={() => setModalState({ mode: 'edit', index, value: table })}
            overflowActions={
              <DetailOverflowMenu
                triggerLabel={`Actions for ${table.name}`}
                actions={[
                  {
                    id: 'delete',
                    label: 'Delete table',
                    destructive: true,
                    onSelect: () => deleteTableAt(index),
                  },
                ]}
              />
            }
          />
        ))}
      />

      {modalState && allowedLevels.length > 0 ? (
        <TableBuilderModal
          open
          kind="levelProgression"
          mode={modalState.mode}
          value={modalState.mode === 'edit' ? modalState.value : undefined}
          allowedLevels={allowedLevels}
          onSave={(table) => handleSave(table as ProgressionTable)}
          onOpenChange={(open) => {
            if (!open) setModalState(null)
          }}
          onDelete={modalState.mode === 'edit' ? handleDelete : undefined}
        />
      ) : null}
    </>
  )
}
