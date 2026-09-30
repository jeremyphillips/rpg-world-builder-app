/** Identity keys shared by proficiency fills, held sets, and starting choices. */
export function optionIdentityKeys(optionId: string): string[] {
  const keys = [optionId]
  const separator = optionId.lastIndexOf(':')
  if (separator >= 0) keys.push(optionId.slice(separator + 1))
  return keys
}

export function optionIdentitiesOverlap(left: string, right: string): boolean {
  const rightKeys = new Set(optionIdentityKeys(right))
  return optionIdentityKeys(left).some((key) => rightKeys.has(key))
}

export function optionIsHeld(optionId: string, heldKeys: ReadonlySet<string>): boolean {
  return optionIdentityKeys(optionId).some((key) => heldKeys.has(key))
}

export function addOptionIdentityKeys(keys: Set<string>, value: string | undefined): void {
  if (!value) return
  for (const key of optionIdentityKeys(value)) keys.add(key)
}
