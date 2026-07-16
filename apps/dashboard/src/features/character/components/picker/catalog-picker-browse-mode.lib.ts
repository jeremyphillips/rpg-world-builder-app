export type BrowseStateByMode<TMode extends string, TState> = Record<TMode, TState>

export function createBrowseStateByMode<TMode extends string, TState>(
  modes: readonly TMode[],
  createDefault: (mode: TMode) => TState,
): BrowseStateByMode<TMode, TState> {
  return Object.fromEntries(modes.map((mode) => [mode, createDefault(mode)])) as BrowseStateByMode<
    TMode,
    TState
  >
}

export function resolveModeBrowseState<TMode extends string, TState>(
  buckets: BrowseStateByMode<TMode, TState>,
  mode: TMode,
  createDefault: (mode: TMode) => TState,
): { buckets: BrowseStateByMode<TMode, TState>; state: TState; initialized: boolean } {
  if (mode in buckets) {
    return { buckets, state: buckets[mode], initialized: false }
  }

  const state = createDefault(mode)
  return {
    buckets: { ...buckets, [mode]: state },
    state,
    initialized: true,
  }
}

export function updateModeBrowseState<TMode extends string, TState>(
  buckets: BrowseStateByMode<TMode, TState>,
  mode: TMode,
  patch: TState | ((current: TState) => TState),
): BrowseStateByMode<TMode, TState> {
  const current = buckets[mode]
  const next = typeof patch === 'function' ? (patch as (current: TState) => TState)(current) : patch
  return { ...buckets, [mode]: next }
}

export function sanitizeModeBrowseState<TState>(
  state: TState,
  sanitize: (state: TState) => TState,
): TState {
  return sanitize(state)
}
