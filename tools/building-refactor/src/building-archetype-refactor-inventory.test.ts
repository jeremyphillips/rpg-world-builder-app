import { readdirSync, readFileSync } from 'node:fs'
import { dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import {
  BUILDING_ARCHETYPE_REFACTOR_INVENTORY,
  BUILDING_ARCHETYPE_REFACTOR_STATUS,
  BUILDING_CORPUS_DISPOSITIONS,
  BUILDING_RESEARCH_CORPUS_IDS,
  LEGACY_RUNTIME_BUILDING_ARCHETYPE_IDS,
} from './building-archetype-refactor-inventory'

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'])
const IGNORED_SOURCE_DIRECTORIES = new Set(['node_modules', 'dist', '.next', 'coverage'])
const INVENTORY_MODULE_NAME = 'building-archetype-refactor-inventory'
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')

function sourceFilesUnder(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      return IGNORED_SOURCE_DIRECTORIES.has(entry.name) ? [] : sourceFilesUnder(path)
    }
    return SOURCE_EXTENSIONS.has(extname(entry.name)) ? [path] : []
  })
}

describe('Building archetype refactor inventory', () => {
  it('accounts for all researched and formerly-runtime concepts exactly once', () => {
    expect(BUILDING_RESEARCH_CORPUS_IDS).toHaveLength(308)
    expect(new Set(BUILDING_RESEARCH_CORPUS_IDS).size).toBe(308)
    expect(LEGACY_RUNTIME_BUILDING_ARCHETYPE_IDS).toHaveLength(143)
    expect(new Set(LEGACY_RUNTIME_BUILDING_ARCHETYPE_IDS).size).toBe(143)
    expect(BUILDING_ARCHETYPE_REFACTOR_INVENTORY).toHaveLength(308)
    expect(new Set(BUILDING_ARCHETYPE_REFACTOR_INVENTORY.map(({ id }) => id)).size).toBe(308)

    for (const id of BUILDING_RESEARCH_CORPUS_IDS) {
      expect(BUILDING_CORPUS_DISPOSITIONS[id]).toBeDefined()
    }
    expect(Object.keys(BUILDING_CORPUS_DISPOSITIONS)).toHaveLength(308)
  })

  it('keeps specialization and manifestation targets within the research corpus', () => {
    const knownIds = new Set<string>(BUILDING_RESEARCH_CORPUS_IDS)

    for (const id of BUILDING_RESEARCH_CORPUS_IDS) {
      const disposition = BUILDING_CORPUS_DISPOSITIONS[id]
      if (disposition.kind !== 'specialization' && disposition.kind !== 'manifestation') continue

      expect(disposition.of).not.toBe('n')
      expect(disposition.of.trim()).not.toBe('')
      expect(knownIds.has(disposition.of), `${id} targets ${disposition.of}`).toBe(true)
    }
  })

  it('records the initial four mappings and leaves 304 concepts pending design', () => {
    const statusById = new Map(
      BUILDING_ARCHETYPE_REFACTOR_INVENTORY.map(({ id, status }) => [id, status]),
    )
    expect(statusById.get('house')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.enabledForm)
    expect(statusById.get('brewery')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.enabledFacility)
    expect(statusById.get('temple')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.enabledFacility)
    expect(statusById.get('blacksmith')).toBe(
      BUILDING_ARCHETYPE_REFACTOR_STATUS.rehomeToOrganizationActivity,
    )
    expect(
      BUILDING_ARCHETYPE_REFACTOR_INVENTORY.filter(
        ({ id }) => id === 'house' || id === 'brewery' || id === 'temple' || id === 'blacksmith',
      ).every(({ wasRuntimeArchetype }) => wasRuntimeArchetype),
    ).toBe(true)

    const unresolved = BUILDING_ARCHETYPE_REFACTOR_INVENTORY.filter(
      ({ status }) =>
        status === BUILDING_ARCHETYPE_REFACTOR_STATUS.pending ||
        status === BUILDING_ARCHETYPE_REFACTOR_STATUS.needsDesign,
    )
    expect(unresolved).toHaveLength(304)
    expect(unresolved.filter(({ wasRuntimeArchetype }) => wasRuntimeArchetype)).toHaveLength(139)
    expect(unresolved.filter(({ wasRuntimeArchetype }) => !wasRuntimeArchetype)).toHaveLength(165)
  })

  it('is not imported by runtime app or package source', () => {
    const runtimeFiles = ['apps', 'packages'].flatMap((directory) =>
      sourceFilesUnder(join(REPO_ROOT, directory)),
    )
    const importingFiles = runtimeFiles.filter((path) =>
      readFileSync(path, 'utf8').includes(INVENTORY_MODULE_NAME),
    )

    expect(importingFiles).toEqual([])
  })
})
