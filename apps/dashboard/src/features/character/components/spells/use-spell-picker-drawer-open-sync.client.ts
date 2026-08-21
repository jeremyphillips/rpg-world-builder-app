'use client'

import * as React from 'react'

import {
  createBrowseStateByMode,
  resolveModeBrowseState,
} from '../picker/catalog-picker-browse-mode.lib'
import {
  createDefaultSpellPickerBrowseState,
  resolveInitialSpellPickerMode,
  sanitizeSpellPickerBrowseState,
} from './spell-picker-drawer.lib'
import type { SpellPickerBrowseState, SpellPickerMode } from './spell-picker-drawer.types'

type UseSpellPickerDrawerOpenSyncInput = {
  open: boolean
  initialMode: SpellPickerMode | undefined
  modes: readonly SpellPickerMode[]
  recommendationsEnabled: boolean
}

export function useSpellPickerDrawerOpenSync({
  open,
  initialMode,
  modes,
  recommendationsEnabled,
}: UseSpellPickerDrawerOpenSyncInput) {
  const [mode, setMode] = React.useState<SpellPickerMode>(() =>
    resolveInitialSpellPickerMode(modes, initialMode),
  )
  const [browseBuckets, setBrowseBuckets] = React.useState(() =>
    createBrowseStateByMode(modes, (entry) =>
      createDefaultSpellPickerBrowseState(entry, recommendationsEnabled),
    ),
  )
  const [browseState, setBrowseState] = React.useState<SpellPickerBrowseState>(() =>
    createDefaultSpellPickerBrowseState(
      resolveInitialSpellPickerMode(modes, initialMode),
      recommendationsEnabled,
    ),
  )
  const [openSyncKey, setOpenSyncKey] = React.useState(0)
  const openBrowseSyncKey = open
    ? `${String(initialMode)}:${modes.join(',')}:${recommendationsEnabled}`
    : 'closed'
  const [trackedOpenBrowseSyncKey, setTrackedOpenBrowseSyncKey] = React.useState(openBrowseSyncKey)

  if (open && openBrowseSyncKey !== trackedOpenBrowseSyncKey) {
    setTrackedOpenBrowseSyncKey(openBrowseSyncKey)
    const nextMode = resolveInitialSpellPickerMode(modes, initialMode)
    setMode(nextMode)
    const resolved = resolveModeBrowseState(browseBuckets, nextMode, (entry) =>
      createDefaultSpellPickerBrowseState(entry, recommendationsEnabled),
    )
    if (resolved.initialized) setBrowseBuckets(resolved.buckets)
    const sanitized = sanitizeSpellPickerBrowseState(
      nextMode,
      resolved.state,
      recommendationsEnabled,
    )
    setBrowseState(sanitized)
    setOpenSyncKey((current) => current + 1)
  } else if (!open && trackedOpenBrowseSyncKey !== 'closed') {
    setTrackedOpenBrowseSyncKey('closed')
  }

  return {
    browseBuckets,
    browseState,
    mode,
    openSyncKey,
    setBrowseBuckets,
    setBrowseState,
    setMode,
  }
}
