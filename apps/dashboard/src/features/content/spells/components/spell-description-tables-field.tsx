import { useCallback, useMemo, useRef, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import type { GeneralTable } from '@rpg/contracts'
import type { RichTextTableEmbedCreateSession, RichTextTableEmbedHost } from '@rpg/ui'
import { RichTextTableEmbedHostRegistrar } from '@rpg/ui'

import { TableBuilderModal } from '../../components/table-builder/table-builder-modal'
import { formatSpellTableMetadata } from '../lib/spell-description-tables.lib'
import type { SpellFormValues } from '../lib/spell-form-fields'

type TableModalState =
  | { mode: 'create'; session?: RichTextTableEmbedCreateSession }
  | { mode: 'edit'; index: number; value: GeneralTable }

export function SpellDescriptionTablesField() {
  const form = useFormContext<SpellFormValues>()
  const tables = (useWatch({ control: form.control, name: 'tables' }) ?? []) as GeneralTable[]
  const [modalState, setModalState] = useState<TableModalState | null>(null)
  const pendingSessionRef = useRef<RichTextTableEmbedCreateSession | null>(null)

  const setTables = useCallback(
    (next: GeneralTable[]) => {
      form.setValue('tables', next, { shouldDirty: true, shouldValidate: true })
    },
    [form],
  )

  const closeModal = useCallback(() => {
    pendingSessionRef.current?.cancel()
    pendingSessionRef.current = null
    setModalState(null)
  }, [])

  const handleSave = useCallback(
    (table: GeneralTable) => {
      if (!modalState) return

      if (modalState.mode === 'create') {
        setTables([...tables, table])
        modalState.session?.commit(table.id)
        pendingSessionRef.current = null
        setModalState(null)
        return
      }

      setTables(tables.map((entry, index) => (index === modalState.index ? table : entry)))
      setModalState(null)
    },
    [modalState, setTables, tables],
  )

  const host = useMemo<RichTextTableEmbedHost>(
    () => ({
      resolve: (tableId) => {
        const table = tables.find((entry) => entry.id === tableId)
        if (!table) return undefined
        return {
          title: table.name,
          metadata: formatSpellTableMetadata(table),
        }
      },
      requestCreate: (session) => {
        pendingSessionRef.current?.cancel()
        pendingSessionRef.current = session
        setModalState({ mode: 'create', session })
      },
      onEditTable: (tableId) => {
        const index = tables.findIndex((entry) => entry.id === tableId)
        if (index === -1) return
        setModalState({ mode: 'edit', index, value: tables[index]! })
      },
    }),
    [tables],
  )

  return (
    <>
      <RichTextTableEmbedHostRegistrar host={host} />

      {modalState ? (
        <TableBuilderModal
          open
          config={{ allowedKinds: ['general'] }}
          mode={modalState.mode}
          value={modalState.mode === 'edit' ? modalState.value : undefined}
          onSave={(table) => handleSave(table as GeneralTable)}
          onOpenChange={(open) => {
            if (!open) closeModal()
          }}
        />
      ) : null}
    </>
  )
}
