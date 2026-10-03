import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

import type { CharacterBuildAdvisory, CharacterKind } from '@rpg/contracts'

import { CharacterBuildAdvisoryConfirmDialog } from '../components/build-advisories/character-build-advisory-confirm-dialog'

type PendingConfirm = {
  advisories: readonly CharacterBuildAdvisory[]
  resolve: (confirmed: boolean) => void
}

/**
 * Create-time gate for non-blocking build advisories. `confirmAdvisories`
 * resolves `true` immediately when there are none; otherwise it opens the
 * dialog and resolves with the user's choice (`false` on Go back, Escape, or
 * unmount). Holds no state beyond the open dialog.
 */
export function useCharacterBuildAdvisoryConfirm({
  characterKind,
}: {
  characterKind: CharacterKind
}): {
  confirmAdvisories: (advisories: readonly CharacterBuildAdvisory[]) => Promise<boolean>
  dialog: ReactNode
} {
  const [pending, setPending] = useState<PendingConfirm | null>(null)
  const pendingRef = useRef<PendingConfirm | null>(null)

  const settle = useCallback((confirmed: boolean) => {
    pendingRef.current?.resolve(confirmed)
    pendingRef.current = null
    setPending(null)
  }, [])

  useEffect(() => () => pendingRef.current?.resolve(false), [])

  const confirmAdvisories = useCallback((advisories: readonly CharacterBuildAdvisory[]) => {
    if (advisories.length === 0) return Promise.resolve(true)
    pendingRef.current?.resolve(false)
    return new Promise<boolean>((resolve) => {
      const next = { advisories, resolve }
      pendingRef.current = next
      setPending(next)
    })
  }, [])

  const dialog = (
    <CharacterBuildAdvisoryConfirmDialog
      open={pending !== null}
      characterKind={characterKind}
      advisories={pending?.advisories ?? []}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
    />
  )

  return { confirmAdvisories, dialog }
}
