import type { ColumnChangeState } from '@rpg/ui'

export type OverviewPreferencesColumnSchema = {
  /** User-facing column ids in schema definition order. */
  ids: readonly string[]
  /** Column ids that must remain visible. */
  lockedIds?: readonly string[]
}

export type OverviewPreferencesBase<TVersion extends number> = {
  version: TVersion
  columnVisibility?: ColumnChangeState['visibility']
  columnOrder?: string[]
  advancedOpen?: boolean
}

export type OverviewPreferencesExtras = {
  pageSize?: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function sanitizeOverviewColumnVisibility(
  visibility: unknown,
  columnSchema: OverviewPreferencesColumnSchema,
): ColumnChangeState['visibility'] | undefined {
  if (!isRecord(visibility)) return undefined

  const allowedIds = new Set(columnSchema.ids)
  const lockedIds = new Set(columnSchema.lockedIds ?? [])
  const sanitized: ColumnChangeState['visibility'] = {}

  for (const [id, visible] of Object.entries(visibility)) {
    if (!allowedIds.has(id) || typeof visible !== 'boolean') continue
    sanitized[id] = lockedIds.has(id) ? true : visible
  }

  for (const id of lockedIds) {
    sanitized[id] = true
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined
}

export function sanitizeOverviewColumnOrder(
  order: unknown,
  columnSchema: OverviewPreferencesColumnSchema,
): string[] | undefined {
  if (!Array.isArray(order)) return undefined

  const allowedIds = new Set(columnSchema.ids)
  const known = order.filter((id): id is string => typeof id === 'string' && allowedIds.has(id))
  const missing = columnSchema.ids.filter((id) => !known.includes(id))
  const sanitized = [...known, ...missing]

  return sanitized.length > 0 ? sanitized : undefined
}

export function parseOverviewPageSize<TPageSize extends number>(
  value: unknown,
  pageSizes: readonly TPageSize[],
): TPageSize | undefined {
  if (typeof value !== 'number' || !Number.isInteger(value)) return undefined
  return pageSizes.includes(value as TPageSize) ? (value as TPageSize) : undefined
}

export function hasInvalidOverviewPreferenceFieldShapes(
  raw: Record<string, unknown>,
  checks: {
    columnVisibility?: boolean
    columnOrder?: boolean
    pageSize?: boolean
    advancedOpen?: boolean
  },
): boolean {
  const invalidChecks = [
    checks.columnVisibility &&
      raw.columnVisibility !== undefined &&
      !isRecord(raw.columnVisibility),
    checks.columnOrder && raw.columnOrder !== undefined && !Array.isArray(raw.columnOrder),
    checks.pageSize && raw.pageSize !== undefined && typeof raw.pageSize !== 'number',
    checks.advancedOpen && raw.advancedOpen !== undefined && typeof raw.advancedOpen !== 'boolean',
  ]

  return invalidChecks.some(Boolean)
}

function parseOverviewPreferenceFields<TPageSize extends number>(
  raw: Record<string, unknown>,
  columnSchema: OverviewPreferencesColumnSchema,
  pageSizes: readonly TPageSize[],
) {
  return {
    columnVisibility: sanitizeOverviewColumnVisibility(raw.columnVisibility, columnSchema),
    columnOrder: sanitizeOverviewColumnOrder(raw.columnOrder, columnSchema),
    pageSize: parseOverviewPageSize(raw.pageSize, pageSizes),
    advancedOpen: typeof raw.advancedOpen === 'boolean' ? raw.advancedOpen : undefined,
  }
}

function buildOverviewPreferencesResult<
  TVersion extends number,
  TPreferences extends OverviewPreferencesBase<TVersion>,
  TPageSize extends number,
>(
  version: TVersion,
  fields: ReturnType<typeof parseOverviewPreferenceFields<TPageSize>>,
  extras: Partial<Omit<TPreferences, keyof OverviewPreferencesBase<TVersion> | 'pageSize'>>,
): TPreferences {
  const { columnVisibility, columnOrder, pageSize, advancedOpen } = fields

  return {
    version,
    ...(columnVisibility ? { columnVisibility } : {}),
    ...(columnOrder ? { columnOrder } : {}),
    ...(pageSize ? { pageSize } : {}),
    ...(advancedOpen !== undefined ? { advancedOpen } : {}),
    ...extras,
  } as TPreferences
}

type ValidateOverviewPreferencesPayloadArgs<
  TVersion extends number,
  TPreferences extends OverviewPreferencesBase<TVersion>,
  TPageSize extends number,
> = {
  raw: Record<string, unknown>
  version: TVersion
  pageSizes: readonly TPageSize[]
  columnSchema: OverviewPreferencesColumnSchema
  parseExtras?: CreateOverviewPreferencesConfig<
    TVersion,
    TPreferences,
    never,
    TPageSize
  >['parseExtras']
  validateExtras?: CreateOverviewPreferencesConfig<
    TVersion,
    TPreferences,
    never,
    TPageSize
  >['validateExtras']
}

function validateOverviewPreferencesPayload<
  TVersion extends number,
  TPreferences extends OverviewPreferencesBase<TVersion>,
  TPageSize extends number,
>({
  raw,
  version,
  pageSizes,
  columnSchema,
  parseExtras,
  validateExtras,
}: ValidateOverviewPreferencesPayloadArgs<TVersion, TPreferences, TPageSize>): TPreferences | null {
  if (raw.version !== version) return null

  const fields = parseOverviewPreferenceFields(raw, columnSchema, pageSizes)
  const extras = parseExtras?.(raw, columnSchema) ?? {}
  if (extras === null) return null

  const hasInvalidShapes = hasInvalidOverviewPreferenceFieldShapes(raw, {
    columnVisibility: true,
    columnOrder: true,
    pageSize: true,
    advancedOpen: true,
  })
  const hasInvalidPageSize = raw.pageSize !== undefined && fields.pageSize === undefined
  const hasInvalidExtras = validateExtras ? !validateExtras(raw, extras) : false

  if (hasInvalidShapes || hasInvalidPageSize || hasInvalidExtras) return null

  return buildOverviewPreferencesResult(version, fields, extras)
}

export type CreateOverviewPreferencesConfig<
  TVersion extends number,
  TPreferences extends OverviewPreferencesBase<TVersion>,
  TDefaults extends Omit<TPreferences, 'version'>,
  TPageSize extends number,
> = {
  keyPrefix: string
  version: TVersion
  defaults: TDefaults
  pageSizes: readonly TPageSize[]
  parseExtras?: (
    raw: Record<string, unknown>,
    columnSchema: OverviewPreferencesColumnSchema,
  ) => Partial<Omit<TPreferences, keyof OverviewPreferencesBase<TVersion> | 'pageSize'>> | null
  validateExtras?: (
    raw: Record<string, unknown>,
    parsed: Partial<Omit<TPreferences, keyof OverviewPreferencesBase<TVersion> | 'pageSize'>>,
  ) => boolean
}

export type OverviewPreferencesStore<
  TPreferences extends OverviewPreferencesBase<number>,
  TDefaults extends Omit<TPreferences, 'version'> = Omit<TPreferences, 'version'>,
> = {
  preferencesKey: (id: string) => string
  readStored: (id: string) => unknown | null
  writeStored: (id: string, preferences: TPreferences) => void
  createDefault: (defaults?: TDefaults) => TPreferences
  validate: (raw: unknown, columnSchema: OverviewPreferencesColumnSchema) => TPreferences | null
  hydrate: (
    id: string,
    columnSchema: OverviewPreferencesColumnSchema,
    defaults?: TDefaults,
  ) => TPreferences
  persist: (id: string, preferences: TPreferences) => void
}

export function createOverviewPreferences<
  TVersion extends number,
  TPreferences extends OverviewPreferencesBase<TVersion> & { pageSize?: TPageSize },
  TDefaults extends Omit<TPreferences, 'version'>,
  TPageSize extends number,
>({
  keyPrefix,
  version,
  defaults,
  pageSizes,
  parseExtras,
  validateExtras,
}: CreateOverviewPreferencesConfig<
  TVersion,
  TPreferences,
  TDefaults,
  TPageSize
>): OverviewPreferencesStore<TPreferences, TDefaults> {
  function preferencesKey(id: string): string {
    return `${keyPrefix}${id}`
  }

  function readStored(id: string): unknown | null {
    try {
      const raw = localStorage.getItem(preferencesKey(id))
      if (!raw) return null
      return JSON.parse(raw) as unknown
    } catch {
      return null
    }
  }

  function writeStored(id: string, preferences: TPreferences): void {
    try {
      localStorage.setItem(preferencesKey(id), JSON.stringify(preferences))
    } catch {
      // Best-effort persistence — storage can fail in private mode.
    }
  }

  function createDefault(overrides: TDefaults = defaults): TPreferences {
    return {
      version,
      ...overrides,
    } as unknown as TPreferences
  }

  function validate(
    raw: unknown,
    columnSchema: OverviewPreferencesColumnSchema,
  ): TPreferences | null {
    if (!isRecord(raw)) return null

    return validateOverviewPreferencesPayload({
      raw,
      version,
      pageSizes,
      columnSchema,
      parseExtras,
      validateExtras,
    })
  }

  function hydrate(
    id: string,
    columnSchema: OverviewPreferencesColumnSchema,
    overrides: TDefaults = defaults,
  ): TPreferences {
    const stored = readStored(id)
    if (stored === null) {
      return createDefault(overrides)
    }

    const validated = validate(stored, columnSchema)
    if (!validated) {
      return createDefault(overrides)
    }

    return {
      ...createDefault(overrides),
      ...validated,
      version,
    }
  }

  function persist(id: string, preferences: TPreferences): void {
    writeStored(id, {
      ...preferences,
      version,
    })
  }

  return {
    preferencesKey,
    readStored,
    writeStored,
    createDefault,
    validate,
    hydrate,
    persist,
  }
}
