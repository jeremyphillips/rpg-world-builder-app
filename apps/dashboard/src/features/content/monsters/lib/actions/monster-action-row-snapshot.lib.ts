import {
  MONSTER_ACTION_SECTIONS,
  type MonsterActionSection,
} from './references/monster-action-equipment-references'
import type { MonsterFormValues } from '../monster-form-values'
import {
  monsterFormSectionRows,
  monsterFormSectionRowsFieldName,
} from './monster-action-section-access'

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Registration can leave `{ damage: { dice: { count: undefined } } }`. That is not authored data. */
export function hasDefinedLeaf(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasDefinedLeaf)
  if (isPlainRecord(value)) return Object.values(value).some(hasDefinedLeaf)
  return value !== undefined
}

export type MissingPathEntry = { path: string; value: unknown }

function sourceForLiveItem(snapshot: unknown[], live: unknown): unknown {
  if (!isPlainRecord(live) || typeof live.id !== 'string') return undefined
  return snapshot.find((item) => isPlainRecord(item) && item.id === live.id)
}

export function collectMissingPaths(
  snapshot: unknown,
  live: unknown,
  path: string,
  missing: MissingPathEntry[],
) {
  if (Array.isArray(snapshot)) {
    collectMissingArraySnapshot(snapshot, live, path, missing)
    return
  }
  if (isPlainRecord(snapshot)) {
    collectMissingRecordSnapshot(snapshot, live, path, missing)
  }
}

function collectMissingArraySnapshot(
  snapshot: unknown[],
  live: unknown,
  path: string,
  missing: MissingPathEntry[],
) {
  if (!Array.isArray(live)) {
    missing.push({ path, value: snapshot })
    return
  }
  live.forEach((item, index) => {
    const source = sourceForLiveItem(snapshot, item)
    if (source === undefined || !isPlainRecord(item) || typeof item.id !== 'string') return
    collectMissingPaths(source, item, `${path}.${index}`, missing)
  })
}

function collectMissingRecordSnapshot(
  snapshot: Record<string, unknown>,
  live: unknown,
  path: string,
  missing: MissingPathEntry[],
) {
  const liveRecord = isPlainRecord(live) ? live : {}
  for (const [key, value] of Object.entries(snapshot)) {
    if (key === 'limitedUse') continue
    const childPath = path ? `${path}.${key}` : key
    const liveValue = liveRecord[key]
    if (isPlainRecord(value) || Array.isArray(value)) {
      if (liveValue === undefined) {
        if (hasDefinedLeaf(value)) missing.push({ path: childPath, value })
        continue
      }
      collectMissingPaths(value, liveValue, childPath, missing)
      continue
    }
    if (liveValue === undefined && value !== undefined) {
      missing.push({ path: childPath, value })
    }
  }
}

export function lostDefinedKeys(previous: unknown, next: unknown): boolean {
  if (Array.isArray(previous)) {
    if (!Array.isArray(next) || next.length < previous.length) return true
    return previous.some((item, index) => lostDefinedKeys(item, next[index]))
  }
  if (isPlainRecord(previous)) {
    if (!isPlainRecord(next)) return true
    return Object.entries(previous).some(([key, value]) => {
      if (key === 'limitedUse') return false
      if (!hasDefinedLeaf(value)) return false
      if (next[key] === undefined) return true
      return lostDefinedKeys(value, next[key])
    })
  }
  return false
}

export function collectMonsterActionSnapshotMissing(
  snapshot: MonsterFormValues,
  live: MonsterFormValues,
): MissingPathEntry[] {
  const missing: MissingPathEntry[] = []
  for (const section of MONSTER_ACTION_SECTIONS) {
    const fieldName = monsterFormSectionRowsFieldName(section)
    collectMissingPaths(
      monsterFormSectionRows(snapshot, section),
      monsterFormSectionRows(live, section),
      fieldName,
      missing,
    )
  }
  return missing
}

export type { MonsterActionSection }
