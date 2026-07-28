import type { CharacterBuildContext } from '../context'
import type { CharacterBuilderDraft } from './draft'
import { CHARACTER_BUILDER_DRAFT_VERSION, characterBuilderDraftSchema } from './draft'
import {
  characterBuilderDraftScopeSchema,
  characterBuilderDraftScopesEqual,
  type CharacterBuilderDraftScope,
} from './draft-scope'
import { normalizeCharacterBuilderDraft } from '../equipment/equipment-purchase'

// ---------------------------------------------------------------------------
// Character builder draft storage — scoped keys and safe rehydration policy.
// ---------------------------------------------------------------------------

export const CHARACTER_BUILDER_DRAFT_STORAGE_KEY_PREFIX = 'character-builder'

export type CharacterBuilderDraftStorageRetainedDimensions = {
  mode?: CharacterBuildContext['mode']
}

export type CharacterBuilderDraftStorageLoadResult =
  | { status: 'restored'; draft: CharacterBuilderDraft }
  | { status: 'empty' }
  | {
      status: 'rejected'
      reason: CharacterBuilderDraftStorageRejectionReason
      shouldClear: boolean
    }

export type CharacterBuilderDraftStorageRejectionReason =
  | 'scope_mismatch'
  | 'obsolete_format'
  | 'malformed'
  | 'version_mismatch'

const DRAFT_STORAGE_REJECTION_MESSAGES: Record<
  CharacterBuilderDraftStorageRejectionReason,
  string
> = {
  scope_mismatch:
    'A saved draft belongs to a different campaign or character type and could not be restored.',
  obsolete_format: 'A saved draft uses an outdated format and could not be restored.',
  malformed: 'A saved draft was damaged and could not be restored.',
  version_mismatch: 'A saved draft is from an older version and could not be restored.',
}

export function formatCharacterBuilderDraftRestoreRejectionMessage(
  reason: CharacterBuilderDraftStorageRejectionReason,
): string {
  return DRAFT_STORAGE_REJECTION_MESSAGES[reason]
}

export function resolveCharacterBuilderDraftScope(
  context: Pick<CharacterBuildContext, 'characterKind' | 'rulesScope'>,
  userId: string | undefined,
): CharacterBuilderDraftScope | null {
  if (context.rulesScope.type === 'campaign') {
    return {
      kind: 'campaign',
      campaignId: context.rulesScope.campaignId,
      characterKind: context.characterKind,
    }
  }

  if (!userId) return null

  return {
    kind: 'standalone',
    userId,
    rulesetId: context.rulesScope.rulesetId,
    characterKind: context.characterKind,
  }
}

export function resolveCharacterBuilderDraftKey(
  scope: CharacterBuilderDraftScope,
  retained: CharacterBuilderDraftStorageRetainedDimensions = {},
): string {
  if (scope.kind === 'campaign') {
    return `${CHARACTER_BUILDER_DRAFT_STORAGE_KEY_PREFIX}:campaign:${scope.campaignId}:${scope.characterKind}`
  }

  const mode = retained.mode ?? 'dashboard'
  return `${CHARACTER_BUILDER_DRAFT_STORAGE_KEY_PREFIX}:standalone:${mode}:${scope.userId}:${scope.rulesetId}:${scope.characterKind}`
}

export function reportCharacterBuilderDraftStorageIssue(
  message: string,
  details?: Record<string, unknown>,
): void {
  if (!isCharacterBuilderDraftStorageReportingEnabled()) return
  console.warn(`[character-builder:draft-storage] ${message}`, details)
}

export function loadCharacterBuilderDraftFromStorage(
  raw: unknown,
  expectedScope: CharacterBuilderDraftScope,
): CharacterBuilderDraftStorageLoadResult {
  if (raw == null) return { status: 'empty' }

  const version = readPersistedDraftVersion(raw)
  if (version === null) {
    reportCharacterBuilderDraftStorageIssue('Rejected malformed builder draft payload', {
      expectedScope,
    })
    return { status: 'rejected', reason: 'malformed', shouldClear: true }
  }

  if (version !== CHARACTER_BUILDER_DRAFT_VERSION) {
    reportCharacterBuilderDraftStorageIssue('Rejected obsolete builder draft version', {
      expectedScope,
      version,
      expectedVersion: CHARACTER_BUILDER_DRAFT_VERSION,
    })
    return { status: 'rejected', reason: 'version_mismatch', shouldClear: true }
  }

  const scopeResult = characterBuilderDraftScopeSchema.safeParse(readPersistedDraftScope(raw))
  if (!scopeResult.success) {
    reportCharacterBuilderDraftStorageIssue('Rejected obsolete builder draft payload shape', {
      expectedScope,
      version,
    })
    return { status: 'rejected', reason: 'obsolete_format', shouldClear: true }
  }

  if (!characterBuilderDraftScopesEqual(scopeResult.data, expectedScope)) {
    reportCharacterBuilderDraftStorageIssue('Rejected builder draft with mismatched scope', {
      expectedScope,
      storedScope: scopeResult.data,
    })
    return { status: 'rejected', reason: 'scope_mismatch', shouldClear: false }
  }

  const draftResult = characterBuilderDraftSchema.safeParse(readPersistedDraftValues(raw))
  if (!draftResult.success) {
    reportCharacterBuilderDraftStorageIssue('Rejected malformed builder draft values', {
      expectedScope,
    })
    return { status: 'rejected', reason: 'malformed', shouldClear: true }
  }

  return {
    status: 'restored',
    draft: normalizeCharacterBuilderDraft(draftResult.data),
  }
}

/** Safe rehydrate with explicit scope enforcement. */
export function parsePersistedCharacterBuilderState(
  raw: unknown,
  expectedScope: CharacterBuilderDraftScope,
): CharacterBuilderDraft | null {
  const result = loadCharacterBuilderDraftFromStorage(raw, expectedScope)
  return result.status === 'restored' ? result.draft : null
}

function isCharacterBuilderDraftStorageReportingEnabled(): boolean {
  const nodeEnv = readNodeEnv()
  return nodeEnv !== 'production'
}

function readNodeEnv(): string | undefined {
  if (typeof globalThis !== 'object' || globalThis === null || !('process' in globalThis)) {
    return undefined
  }

  const processRef = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process
  return processRef?.env?.NODE_ENV
}

function readPersistedDraftVersion(raw: unknown): number | null {
  if (typeof raw !== 'object' || raw === null || !('version' in raw)) return null
  const version = raw.version
  return typeof version === 'number' ? version : null
}

function readPersistedDraftScope(raw: unknown): unknown {
  if (typeof raw !== 'object' || raw === null || !('scope' in raw)) return undefined
  return raw.scope
}

function readPersistedDraftValues(raw: unknown): unknown {
  if (typeof raw !== 'object' || raw === null) return undefined
  if ('draft' in raw) return raw.draft
  if ('values' in raw) return raw.values
  return undefined
}
