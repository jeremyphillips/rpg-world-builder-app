export type EquipmentPickerFocusRequest = {
  mode: 'magic_items'
  allowanceId: string
}

export type EquipmentPickerFocusIntent = EquipmentPickerFocusRequest & {
  requestId: string
}

export function createEquipmentPickerFocusRequestId(): string {
  const suffix =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`

  return `equipment-picker-focus:${suffix}`
}

export function buildEquipmentPickerFocusIntent(
  request: EquipmentPickerFocusRequest,
  requestId: string,
): EquipmentPickerFocusIntent {
  return { ...request, requestId }
}

export function shouldConsumeEquipmentPickerFocusIntent(args: {
  intent: EquipmentPickerFocusIntent
  consumedRequestIds: ReadonlySet<string>
}): boolean {
  return !args.consumedRequestIds.has(args.intent.requestId)
}
