function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export type PersistedPreferenceStore<
  TVersion extends number,
  TPreferences extends { version: TVersion },
> = {
  key: string
  readStored: () => unknown | null
  writeStored: (preferences: TPreferences) => void
  createDefault: () => TPreferences
  validate: (raw: unknown) => TPreferences | null
  hydrate: () => TPreferences
  persist: (preferences: TPreferences) => void
}

export type CreatePersistedPreferenceConfig<
  TVersion extends number,
  TPreferences extends { version: TVersion },
  TDefaults extends Omit<TPreferences, 'version'>,
> = {
  key: string
  version: TVersion
  defaults: TDefaults
  validatePayload: (raw: Record<string, unknown>) => Omit<TPreferences, 'version'> | null
}

/** SSR-safe localStorage read/write with versioned validation and merge-safe defaults. */
export function createPersistedPreference<
  TVersion extends number,
  TPreferences extends { version: TVersion },
  TDefaults extends Omit<TPreferences, 'version'>,
>({
  key,
  version,
  defaults,
  validatePayload,
}: CreatePersistedPreferenceConfig<TVersion, TPreferences, TDefaults>): PersistedPreferenceStore<
  TVersion,
  TPreferences
> {
  function readStored(): unknown | null {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return null
      return JSON.parse(raw) as unknown
    } catch {
      return null
    }
  }

  function writeStored(preferences: TPreferences): void {
    try {
      localStorage.setItem(key, JSON.stringify(preferences))
    } catch {
      // Best-effort persistence — storage can fail in private mode.
    }
  }

  function createDefault(): TPreferences {
    return {
      version,
      ...defaults,
    } as unknown as TPreferences
  }

  function validate(raw: unknown): TPreferences | null {
    if (!isRecord(raw) || raw.version !== version) return null

    const payload = validatePayload(raw)
    if (!payload) return null

    return {
      version,
      ...payload,
    } as TPreferences
  }

  function hydrate(): TPreferences {
    const stored = readStored()
    if (stored === null) {
      return createDefault()
    }

    const validated = validate(stored)
    if (!validated) {
      return createDefault()
    }

    return {
      ...createDefault(),
      ...validated,
      version,
    }
  }

  function persist(preferences: TPreferences): void {
    writeStored({
      ...preferences,
      version,
    })
  }

  return {
    key,
    readStored,
    writeStored,
    createDefault,
    validate,
    hydrate,
    persist,
  }
}
