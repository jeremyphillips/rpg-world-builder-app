// ---------------------------------------------------------------------------
// Message definition primitive — the single seam for user-facing validation
// copy. Every message carries a stable id (`validation.<scope>.<rule>`) plus an
// English formatter, so a future locale catalog can key off `id` without
// refactoring schemas or forms. See docs/validation-messages.md.
// ---------------------------------------------------------------------------

/** Interpolation params for a message formatter. */
export type MessageParams = Record<string, string | number>

/**
 * A callable message definition: invoke it to get the formatted English
 * string; read `.id` when a keyed catalog (i18n, API issue payloads) is needed.
 */
export type MessageDef<P extends MessageParams | void = void> = (P extends void
  ? () => string
  : (params: P) => string) & {
  /** Stable message id: `validation.<scope>.<rule>`. */
  readonly id: string
}

const STRUCTURED_MESSAGE_PREFIX = '\x00'

type StructuredMessagePayload = {
  f: string
  s?: string
  id?: string
  p?: MessageParams
}

function hasMessageParams(params: MessageParams | undefined): params is MessageParams {
  return params !== undefined && Object.keys(params).length > 0
}

/** Encodes field + optional summary variants for transport through RHF error strings. */
export function encodeStructuredMessage(
  field: string,
  summary?: string,
  messageId?: string,
  params?: MessageParams,
): string {
  const hasSummary = summary !== undefined && summary !== field
  const hasMetadata = messageId !== undefined || hasMessageParams(params)
  if (!hasSummary && !hasMetadata) return field

  const payload: StructuredMessagePayload = { f: field }
  if (hasSummary) payload.s = summary
  if (messageId) payload.id = messageId
  if (hasMessageParams(params)) payload.p = params

  return `${STRUCTURED_MESSAGE_PREFIX}${JSON.stringify(payload)}`
}

/** Decodes a structured message produced by {@link encodeStructuredMessage}. */
export function decodeStructuredMessage(raw: string): {
  field: string
  summary: string
  messageId?: string
  params?: MessageParams
} | null {
  if (!raw.startsWith(STRUCTURED_MESSAGE_PREFIX)) return null

  try {
    const parsed = JSON.parse(
      raw.slice(STRUCTURED_MESSAGE_PREFIX.length),
    ) as StructuredMessagePayload
    if (typeof parsed.f !== 'string') return null
    return {
      field: parsed.f,
      summary: typeof parsed.s === 'string' ? parsed.s : parsed.f,
      messageId: typeof parsed.id === 'string' ? parsed.id : undefined,
      params: parsed.p,
    }
  } catch {
    return null
  }
}

/** Returns the field-context message, decoding structured payloads when present. */
export function formatFieldMessage(raw: string): string {
  return decodeStructuredMessage(raw)?.field ?? raw
}

/**
 * Creates a {@link MessageDef}. Pass the params type explicitly for
 * parameterized messages: `defineMessage<{ min: number }>('…', ({ min }) => …)`.
 *
 * An optional `summaryFormat` produces a shorter label for collapsed row
 * summaries; both variants are encoded into the returned string when they differ.
 */
export function defineMessage<P extends MessageParams | void = void>(
  id: string,
  format: (params: P) => string,
  summaryFormat?: (params: P) => string,
): MessageDef<P> {
  const fn = (params: P) => {
    const field = format(params)
    const messageParams = params === undefined ? undefined : (params as unknown as MessageParams)
    if (!summaryFormat) {
      return encodeStructuredMessage(field, undefined, id, messageParams)
    }
    return encodeStructuredMessage(field, summaryFormat(params), id, messageParams)
  }

  return Object.assign(fn, { id }) as unknown as MessageDef<P>
}
