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

/**
 * Creates a {@link MessageDef}. Pass the params type explicitly for
 * parameterized messages: `defineMessage<{ min: number }>('…', ({ min }) => …)`.
 */
export function defineMessage<P extends MessageParams | void = void>(
  id: string,
  format: (params: P) => string,
): MessageDef<P> {
  return Object.assign((params: P) => format(params), { id }) as unknown as MessageDef<P>
}
