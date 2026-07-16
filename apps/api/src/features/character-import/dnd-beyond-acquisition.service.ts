import {
  adaptDndBeyondCharacter,
  buildDndBeyondCharacterUrl,
  buildDndBeyondReadonlyUrl,
  CHARACTER_IMPORT_ERROR_MESSAGES,
  createDndBeyondEquipmentNameIndex,
  createDndBeyondSpellNameIndex,
  DND_BEYOND_SRD_TOOL_RULESET_ID,
  dndBeyondCharacterPayloadSchema,
  dndBeyondCharacterResponseSchema,
  dndBeyondErrorEnvelopeSchema,
  DND_BEYOND_PAYLOAD_VERSION,
  DND_BEYOND_UNSUPPORTED_API_VERSION_CODE,
  normalizeDndBeyondCharacterInput,
  type CharacterImportResult,
} from '@rpg/contracts/character-import'
import { loadSeedEquipment } from '@rpg/catalog/equipment'
import { loadSeedSpells } from '@rpg/catalog/spells'

import { loadEnv } from '../../env'
import { HttpError } from '../../lib/http-error'

type FetchFn = typeof fetch

const VERSION_METADATA = {
  requestedPayloadVersion: DND_BEYOND_PAYLOAD_VERSION,
  supportedPayloadVersion: DND_BEYOND_PAYLOAD_VERSION,
} as const

function upstreamFailure(message = CHARACTER_IMPORT_ERROR_MESSAGES['upstream-failure']): never {
  throw new HttpError(502, 'upstream-failure', message, VERSION_METADATA)
}

function invalidUpstreamPayload(details?: unknown): never {
  throw new HttpError(
    502,
    'invalid-upstream-payload',
    CHARACTER_IMPORT_ERROR_MESSAGES['invalid-upstream-payload'],
    details ?? VERSION_METADATA,
  )
}

function parseUpstreamJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown
  } catch {
    upstreamFailure()
  }
}

function assertUnsupportedApiVersion(json: unknown): void {
  const errorEnvelope = dndBeyondErrorEnvelopeSchema.safeParse(json)
  if (!errorEnvelope.success) {
    return
  }

  const upstreamCode = errorEnvelope.data.error.code
  if (upstreamCode === DND_BEYOND_UNSUPPORTED_API_VERSION_CODE) {
    throw new HttpError(
      502,
      'unsupported-api-version',
      CHARACTER_IMPORT_ERROR_MESSAGES['unsupported-api-version'],
      VERSION_METADATA,
    )
  }

  upstreamFailure()
}

export async function previewDndBeyondCharacter(
  rawInput: string,
  fetchImpl: FetchFn = fetch,
): Promise<CharacterImportResult> {
  let characterId: string
  try {
    characterId = normalizeDndBeyondCharacterInput(rawInput)
  } catch {
    throw HttpError.badRequest(
      'Enter a numeric character ID or a supported D&D Beyond character URL.',
    )
  }

  const { dndBeyondFetchTimeoutMs } = loadEnv()
  const url = buildDndBeyondCharacterUrl(characterId)

  let response: Response
  try {
    response = await fetchImpl(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(dndBeyondFetchTimeoutMs),
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new HttpError(
        504,
        'upstream-failure',
        CHARACTER_IMPORT_ERROR_MESSAGES['upstream-failure'],
        VERSION_METADATA,
      )
    }
    upstreamFailure()
  }

  if (response.status === 404) {
    throw new HttpError(
      404,
      'character-unavailable',
      CHARACTER_IMPORT_ERROR_MESSAGES['character-unavailable'],
      VERSION_METADATA,
    )
  }

  if (!response.ok) {
    upstreamFailure()
  }

  const text = await response.text()
  const json = parseUpstreamJson(text)

  assertUnsupportedApiVersion(json)

  const envelope = dndBeyondCharacterResponseSchema.safeParse(json)
  if (!envelope.success) {
    invalidUpstreamPayload({
      ...VERSION_METADATA,
      issues: envelope.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  if (!envelope.data.success) {
    throw new HttpError(
      404,
      'character-unavailable',
      CHARACTER_IMPORT_ERROR_MESSAGES['character-unavailable'],
      VERSION_METADATA,
    )
  }

  if (!envelope.data.data) {
    throw new HttpError(
      404,
      'character-unavailable',
      CHARACTER_IMPORT_ERROR_MESSAGES['character-unavailable'],
      VERSION_METADATA,
    )
  }

  const payload = dndBeyondCharacterPayloadSchema.safeParse(envelope.data.data)
  if (!payload.success) {
    invalidUpstreamPayload({
      ...VERSION_METADATA,
      issues: payload.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  return adaptDndBeyondCharacter(
    payload.data,
    {
      provider: 'dnd-beyond',
      payloadVersion: DND_BEYOND_PAYLOAD_VERSION,
      requestedPayloadVersion: DND_BEYOND_PAYLOAD_VERSION,
      supportedPayloadVersion: DND_BEYOND_PAYLOAD_VERSION,
      characterId,
      acquisition: 'public-id-fetch',
      readonlyUrl: buildDndBeyondReadonlyUrl(characterId),
    },
    {
      equipmentNameIndex: createDndBeyondEquipmentNameIndex(
        loadSeedEquipment(DND_BEYOND_SRD_TOOL_RULESET_ID).map((item) => ({
          name: item.name,
          slug: item.slug,
        })),
      ),
      spellNameIndex: createDndBeyondSpellNameIndex(
        loadSeedSpells(DND_BEYOND_SRD_TOOL_RULESET_ID).map((spell) => ({
          name: spell.name,
          slug: spell.slug,
        })),
      ),
    },
  )
}
