import { useMemo, useState, type ReactNode } from 'react'
import type { Spell } from '@rpg/contracts'
import { ArrayAddActionInterceptProvider, getArrayFieldMutators } from '@rpg/ui/form'
import { useFormContext, useWatch } from 'react-hook-form'

import { replaceMonsterSpellRow } from '../../lib/actions/monster-spell-frequency'
import {
  MONSTER_SPELL_PICKER_INTERCEPT,
  MonsterSpellPickerContext,
} from './monster-spell-picker-context'
import { MonsterSpellPickerDrawer } from './monster-spell-picker-drawer'

type SpellPickerRequest = { mode: 'add' } | { mode: 'change'; index: number }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function MonsterSpellPickerHost({
  enabled,
  arrayName,
  catalog,
  children,
}: {
  enabled: boolean
  arrayName: string
  catalog: ReadonlyMap<string, Spell> | undefined
  children: ReactNode
}) {
  const { control, setValue } = useFormContext()
  const [request, setRequest] = useState<SpellPickerRequest | null>(null)
  const rows = useWatch({ name: arrayName }) as unknown[] | undefined
  const spells = useMemo(() => [...(catalog?.values() ?? [])], [catalog])
  const disabledSpellIds = useMemo(() => {
    const ids = new Set<string>()
    for (const [index, row] of (rows ?? []).entries()) {
      if (request?.mode === 'change' && index === request.index) continue
      if (!isRecord(row) || typeof row.spellId !== 'string' || row.spellId.length === 0) continue
      ids.add(row.spellId)
    }
    return ids
  }, [request, rows])

  const picker = useMemo(
    () => ({
      openChange: (index: number) => setRequest({ mode: 'change', index }),
    }),
    [],
  )

  const commit = (spellId: string) => {
    if (!request) return
    if (request.mode === 'add') {
      getArrayFieldMutators(control, arrayName)?.append({ spellId })
      return
    }
    const current = rows?.[request.index]
    if (!isRecord(current)) return
    const next = replaceMonsterSpellRow(current, spellId)
    setValue(`${arrayName}.${request.index}`, next, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
  }

  return (
    <MonsterSpellPickerContext.Provider value={enabled ? picker : null}>
      <ArrayAddActionInterceptProvider
        registry={{
          [MONSTER_SPELL_PICKER_INTERCEPT]: {
            onSelect: () => setRequest({ mode: 'add' }),
          },
        }}
      >
        {children}
      </ArrayAddActionInterceptProvider>
      {enabled ? (
        <MonsterSpellPickerDrawer
          open={request !== null}
          mode={request?.mode ?? 'add'}
          spells={spells}
          disabledSpellIds={disabledSpellIds}
          onOpenChange={(open) => {
            if (!open) setRequest(null)
          }}
          onCommit={commit}
        />
      ) : null}
    </MonsterSpellPickerContext.Provider>
  )
}
