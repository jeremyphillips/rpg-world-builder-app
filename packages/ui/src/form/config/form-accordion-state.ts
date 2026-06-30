import type { ArrayConfig, GroupConfig } from './field-config'

/** In-memory fallback (tests / SSR). */
const accordionOpenByBatchKey = new Map<string, string[]>()

const STORAGE_PREFIX = 'rpg-form-accordion:'

function readStorage(batchKey: string): string[] | null {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${batchKey}`)
    return raw ? (JSON.parse(raw) as string[]) : null
  } catch {
    return null
  }
}

function writeStorage(batchKey: string, values: string[]): void {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${batchKey}`, JSON.stringify(values))
  } catch {
    /* quota / private mode */
  }
}

export function readAccordionBatchOpen(batchKey: string, defaultOpen: string[]): string[] {
  const fromMap = accordionOpenByBatchKey.get(batchKey)
  if (fromMap) return fromMap

  const fromStorage = readStorage(batchKey)
  if (fromStorage) {
    accordionOpenByBatchKey.set(batchKey, fromStorage)
    return fromStorage
  }

  return defaultOpen
}

export function writeAccordionBatchOpen(batchKey: string, values: string[]): void {
  accordionOpenByBatchKey.set(batchKey, values)
  writeStorage(batchKey, values)
}

/** @internal Test helper — clears persisted accordion state between runs. */
export function resetAccordionBatchStateForTests(): void {
  accordionOpenByBatchKey.clear()
  if (typeof sessionStorage === 'undefined') return
  for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
    const key = sessionStorage.key(i)
    if (key?.startsWith(STORAGE_PREFIX)) sessionStorage.removeItem(key)
  }
}

/** Stable key from section ids (and optional tab scope); avoids React `useId` prefixes. */
export function buildAccordionBatchKey(
  idPrefix: string,
  sections: Array<{ item: GroupConfig | ArrayConfig; index: number }>,
  getSectionValue: (item: GroupConfig | ArrayConfig, index: number) => string,
): string {
  const sectionPart = sections.map(({ item, index }) => getSectionValue(item, index)).join('|')
  const tabMatch = idPrefix.match(/-([a-z][a-z0-9-]*)$/i)
  const tabScope = tabMatch?.[1]
  return tabScope && !/^_:?r/i.test(tabScope) ? `${tabScope}|${sectionPart}` : sectionPart
}
